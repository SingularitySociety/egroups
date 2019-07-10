import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import ErrorMessage from '../ErrorMessage';
import BlogArticle from './BlogArticle';

const styles = theme => ({
});

class Blog extends React.Component {
  constructor(props) {
    super(props);
    const { group, arp, match:{params:{articleId}} } = this.props;
    this.pathArticle = `groups/${group.groupId}/${arp.collection}/${articleId}`;
    this.state = {article:null, sections:[], resouces:null};
  }

  async componentDidMount() {
    const { match:{params:{articleId}}, callbacks, arp, user, db, group } = this.props;
    callbacks.setTabbar(arp.tabLeaf, `${arp.leaf}/${articleId}`);

    const error = {key:"error.invalid.articleId", value:articleId};
    try {
      const refArticle = db.doc(this.pathArticle);
      const article = (await refArticle.get()).data();
      if (article) {
        article.articleId = articleId;
        this.setState({article});

        if (user) {
          const articles = {};
          articles[articleId] = { l:new Date() }; // NOT firebase.firestore.FieldValue.serverTimestamp()
          db.doc(`groups/${group.groupId}/members/${user.uid}/private/history`).set({
            articles
          }, {merge:true})
        }

        return;
      }
    } catch(e) {
      console.log(e);
      // LATER: Detect network error case
      error.key = "warning.access.denied";
    }
    this.setState({ error });
  }

  render() {
    const { article, error } = this.state;
    const { user, arp, group, privilege, db, profiles, callbacks } = this.props;
    const context = { user, article, arp, group, privilege, db, profiles, callbacks };
    if (error) {
      return <ErrorMessage error={error} />
    }
    if (!article) {
      return "";
    }
    return <BlogArticle {...context} pathArticle={this.pathArticle}/>;
  }
}

Blog.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  
export default withStyles(styles)(Blog);