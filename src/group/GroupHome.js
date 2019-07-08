import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import MountDetector from '../common/MountDetector';
import Privileges from '../const/Privileges';
import * as firebase from "firebase/app";
import "firebase/firestore";
import BlogArticle from './blog/BlogArticle';
import { injectIntl, FormattedMessage } from 'react-intl';
import ArticleList from './blog/ArticleList';
import { Typography } from '@material-ui/core';

const styles = theme => ({
  welcome: {
    marginTop: theme.spacing(0),
  }
});

class GroupHome extends React.Component {
  state = {};
  componentDidMount() {
    const { callbacks } = this.props;
    callbacks.setTabbar("home");
    this.loadArticle();
  }
  loadArticle = async () => {
    const { group, db } = this.props;
    if (group.homepageId) {
      this.refArticle = db.doc(`groups/${group.groupId}/pages/${group.homepageId}`);
      const article = (await this.refArticle.get()).data();
      //console.log(article);
      article.articleId = group.homepageId;
      this.setState({article});
    }
  }
  privilegeDidMount = async (privilege) => {
    const { group, db, user, callbacks, intl:{messages} } = this.props;
    console.log({privilegeDidMount:privilege});
    if (privilege >= Privileges.admin) {
      this.setState({canEdit:true});
      console.log("isAdmin", group.homepageId);

      // This code is not atomic but it is fine because there is only one owner
      if (!group.homepageId) {
        const doc = await db.collection(`groups/${group.groupId}/pages`).add({
          title: messages["title.welcome"], // BUGBUG: Localize it
          created: firebase.firestore.FieldValue.serverTimestamp(),
          type: "page",
          owner: user.uid,
          read: Privileges.guest, 
          comment: Privileges.admin, 
          sections: [], // ordered list of sectionIds
        });
        await db.doc(`groups/${group.groupId}`).set({
          homepageId: doc.id,
        }, {merge:true});
        group.homepageId = doc.id;
        callbacks.groupDidUpdate();
      }
      this.loadArticle();
    }
  }
  privilegeWillUnmount = () => {
  }
  render() {
    const { group, user, db, arp, callbacks, privilege, profiles, history } = this.props;
    const { article } = this.state;
    const context = { group, user, db, article, arp, callbacks, privilege, profiles, history }
    //const context = { user, group, db, member, history };
    return (
      <div>
        { privilege > 0 && <MountDetector didMount={this.privilegeDidMount} willUnmount={this.privilegeWillUnmount} value={privilege} />}
        { article && <BlogArticle {...context} refArticle={this.refArticle} />}
        <Typography component="h3" variant="h3">
          <FormattedMessage id="pages" />
        </Typography>
        <ArticleList {...context}/>
      </div>
    )
  }
}

GroupHome.propTypes = {
  classes: PropTypes.object.isRequired,
};
  
export default withStyles(styles)(injectIntl(GroupHome));