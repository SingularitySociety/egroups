import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import ErrorMessage from './ErrorMessage';
import BlogArticle from './BlogArticle';

const styles = theme => ({
});

class Blog extends React.Component {
  constructor(props) {
    super(props);
    const { db, group, arp, match:{params:{articleId}} } = this.props;
    this.refArticle = db.doc(`groups/${group.groupId}/${arp.collection}/${articleId}`);
    this.state = {article:null, sections:[], resouces:null};
  }

  async componentDidMount() {
    const { match:{params:{articleId}}, selectTab, arp } = this.props;
    selectTab(arp.tabLeaf, `${arp.leaf}/${articleId}`);
    const article = (await this.refArticle.get()).data();
    if (!article) {
      this.setState({error:{key:"error.invalid.articleId", value:articleId}});
      return;
    }
    article.articleId = articleId;
    this.setState({article});
  }

  render() {
    const { article, error } = this.state;
    const { user, member } = this.props;
    const context = { user, member, article };
    if (error) {
      return <ErrorMessage error={error} />
    }
    if (!article) {
      return "";
    }
    return <BlogArticle {...context} refArticle={this.refArticle}/>;
  }
}

Blog.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  
export default withStyles(styles)(Blog);