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
    const { db, group, arp, match:{params:{articleId}} } = this.props;
    this.refArticle = db.doc(`groups/${group.groupId}/${arp.collection}/${articleId}`);
    this.state = {article:null, sections:[], resouces:null};
  }

  async componentDidMount() {
    const { match:{params:{articleId}}, callbacks, arp } = this.props;
    callbacks.setTabbar(arp.tabLeaf, `${arp.leaf}/${articleId}`);

    const error = {key:"error.invalid.articleId", value:articleId};
    try {
      const article = (await this.refArticle.get()).data();
      if (article) {
        article.articleId = articleId;
        this.setState({article});
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
    const { user, arp, group, callbacks } = this.props;
    const context = { user, article, arp, group, callbacks };
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