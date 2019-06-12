import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';
//import { FormattedMessage } from 'react-intl';
import BlogSection from './BlogSection';

const styles = theme => ({
});

class Blog extends React.Component {
  state = {article:null, sections:[]};
  async componentDidMount() {
    const { db, group, match:{params:{articleId}} } = this.props;
    console.log(articleId);
    this.refArticle = db.doc(`groups/${group.groupId}/articles/${articleId}`);
    const article = (await this.refArticle.get()).data();
    console.log("article:", article);
    this.setState({article});
  }
  insertSection = async (markdown, index) => {
    console.log("insertSection", markdown, index);
    const { user } = this.props;
    console.log(user.uid);
    const doc = await this.refArticle.collection("sections").add({
      markdown: markdown,
      created: new Date(),
      author: user.uid,
    });
    console.log(doc);
  }
  render() {
    const { article } = this.state;
    if (!article) {
      return "";
    }
    return (
      <div>
        <Typography component="h2" variant="h5" gutterBottom>
          {article.title}
        </Typography>
        <BlogSection index={ 0 } insertSection={this.insertSection} />
      </div>
    )
  }
}

Blog.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  
export default withStyles(styles)(Blog);