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
        <BlogSection index={ 0 } saveSection={this.insertSection} />
        {
          article.sections.map((sectionId, index)=>{
            return <div key={sectionId}>
              <BlogSection index={ index }sectionId={sectionId} markdown={ resources[sectionId].markdown } saveSection={this.updateSection} />
              <BlogSection index={ index+1 } saveSection={this.insertSection} />
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