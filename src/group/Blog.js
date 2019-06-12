import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';
//import { FormattedMessage } from 'react-intl';
import BlogSection from './BlogSection';

const styles = theme => ({
});

class Blog extends React.Component {
  state = {article:null, sections:[], resouces:null};
  async componentDidMount() {
    const { db, group, match:{params:{articleId}} } = this.props;
    console.log(articleId);
    this.refArticle = db.doc(`groups/${group.groupId}/articles/${articleId}`);
    const article = (await this.refArticle.get()).data();
    console.log("article:", article);
    this.setState({article});
    this.detatcher = this.refArticle.collection("sections").onSnapshot((snapshot)=>{
      const resources = {};
      snapshot.forEach((doc)=>{
        resources[doc.id] = doc.data();
      })
      console.log(resources);
      this.setState({resources});
    });
  }
  componentWillUnmount() {
    this.detatcher();
  }
  insertSection = async (markdown, index) => {
    console.log("insertSection", markdown, index);
    const { user } = this.props;
    const { article } = this.state;
    console.log(user.uid);
    const doc = await this.refArticle.collection("sections").add({
      markdown: markdown,
      created: new Date(),
      author: user.uid,
    });
    console.log(doc.id);
    console.log("befpre", article.sections);
    article.sections.splice(index, 0, doc.id);
    console.log("after", article.sections);
    this.setState(article);
    await this.refArticle.set(article, {merge:true});
  }
  render() {
    const { article, resources } = this.state;
    if (!resources) {
      return "";
    }
    return (
      <div>
        <Typography component="h2" variant="h5" gutterBottom>
          {article.title}
        </Typography>
        <BlogSection index={ 0 } insertSection={this.insertSection} />
        {
          article.sections.map((sectionId, index)=>{
            return [<p key={sectionId}>{resources[sectionId].markdown || "..."}</p>,
            <BlogSection key={index} index={ index+1 } insertSection={this.insertSection} />]

          })
        }
      </div>
    )
  }
}

Blog.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  
export default withStyles(styles)(Blog);