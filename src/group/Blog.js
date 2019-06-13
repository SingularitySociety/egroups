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
    this.refArticle = db.doc(`groups/${group.groupId}/articles/${articleId}`);
    const article = (await this.refArticle.get()).data();
    this.setState({article});
    this.detatcher = this.refArticle.collection("sections").onSnapshot((snapshot)=>{
      const resources = {};
      snapshot.forEach((doc)=>{
        resources[doc.id] = doc.data();
      })
      this.setState({resources});
    });
  }
  componentWillUnmount() {
    this.detatcher();
  }
  insertSection = async (resourceId, index, markdown) => {
    const { user } = this.props;
    const { article } = this.state;
    const doc = await this.refArticle.collection("sections").add({
      markdown: markdown,
      created: new Date(),
      author: user.uid,
    });
    article.sections.splice(index, 0, doc.id);
    this.setState(article);
    await this.refArticle.set(article, {merge:true});
  }
  updateSection = async (resourceId, index, markdown) => {
    await this.refArticle.collection("sections").doc(resourceId).set({
      markdown
    }, {merge:true})
  }
  deleteSection = async (resourceId, index) => {
    console.log("deleteSection", resourceId);
    const { article } = this.state;
    article.sections.splice(index, 1);
    this.setState(article);
    await this.refArticle.set(article, {merge:true});
    await this.refArticle.collection("sections").doc(resourceId).delete();
  }

  render() {
    const { article, resources } = this.state;
    const { user } = this.props;
    if (!resources || !user) {
      return "";
    }
    const canEdit = (article.owner === user.uid);
    return (
      <div>
        <Typography component="h2" variant="h5" gutterBottom>
          {article.title}
        </Typography>
      { canEdit && <BlogSection index={ 0 } saveSection={this.insertSection} /> }
        {
          article.sections.map((sectionId, index)=>{
            return <div key={sectionId}>
              <BlogSection index={ index }sectionId={sectionId} markdown={ resources[sectionId].markdown } 
                  saveSection={this.updateSection} deleteSection={this.deleteSection} readOnly={!canEdit}/>
              { canEdit && <BlogSection index={ index+1 } saveSection={this.insertSection} /> }
            </div>
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