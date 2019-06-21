import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import ErrorMessage from '../ErrorMessage';
import BlogArticle from './BlogArticle';

const styles = theme => ({
});

class Blog extends React.Component {
  state = {article:null, sections:[], resouces:null};
  async componentDidMount() {
    const { db, group, match:{params:{articleId}}, selectTab } = this.props;
    selectTab("article", `bl/${articleId}`);

    this.refArticle = db.doc(`groups/${group.groupId}/articles/${articleId}`);
    const article = (await this.refArticle.get()).data();
    //console.log("article=", article);
    // BUGBUG: This is an attempt to catch non-existing but does not work because it causes security error unlike chat. 
    if (article === null) {
      this.setState({error:{key:"error.invalid.articleId", value:articleId}});
      return;
    }
    article.articleId = articleId;
    this.setState({article});
  }

  render() {
    const { article, error } = this.state;
    const { user, group, member, db } = this.props;
    const context = { db, user, group, member, article };
    if (error) {
      return <ErrorMessage error={error} />
    }
    if (!article) {
      return "";
    }
    return <BlogArticle {...context} />;
  }
}

Blog.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  
export default withStyles(styles)(Blog);