import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import MountDetector from '../common/MountDetector';
import Privileges from '../const/Privileges';
import * as firebase from "firebase/app";
import "firebase/firestore";
import BlogArticle from './blog/BlogArticle';
import { injectIntl } from 'react-intl';


const styles = theme => ({
  welcome: {
    marginTop: theme.spacing(0),
  }
});

class GroupHome extends React.Component {
  state = {};
  componentDidMount() {
    const { selectTab } = this.props;
    selectTab("home");
    this.loadArticle();
  }
  loadArticle = async () => {
    const { group, db } = this.props;
    if (group.homepageId) {
      this.refArticle = db.doc(`groups/${group.groupId}/pages/${group.homepageId}`);
      const article = (await this.refArticle.get()).data();
      console.log(article);
      article.articleId = group.homepageId;
      this.setState({article});
    }
  }
  memberDidMount = async (member) => {
    console.log("memberDidMount");
    const { group, db, user, callbacks, intl:{messages} } = this.props;
    if (callbacks.memberPrivilege() >= Privileges.admin) {
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
        callbacks.reloadGroup();
      }
      this.loadArticle();
    }
  }
  memberWillUnmount = () => {
  }
  render() {
    const { group, member, user, db, arp } = this.props;
    const { article } = this.state;
    const context = { group, member, user, db, article, arp }
    //const context = { user, group, db, member, history };
    return (
      <div>
        { member && <MountDetector didMount={this.memberDidMount} willUnmount={this.memberWillUnmount} value={member} />}
        { article && <BlogArticle {...context} refArticle={this.refArticle} />}
      </div>
    )
  }
}

GroupHome.propTypes = {
  classes: PropTypes.object.isRequired,
};
  
export default withStyles(styles)(injectIntl(GroupHome));