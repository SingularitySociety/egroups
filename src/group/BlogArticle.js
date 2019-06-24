import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Typography, Grid, IconButton } from '@material-ui/core';
import SettingsIcon from '@material-ui/icons/Settings';
import AccessDenied from './AccessDenied';
import BlogSection from './BlogSection';
import ErrorMessage from '../ErrorMessage';
import { Link } from 'react-router-dom';

const styles = theme => ({
  readerFrame: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
  editorFrame: {

  },
  title: {
    fontWeight: "600",
    marginBottom: theme.spacing(2),
    fontSize: "1.4rem",
    '@media (min-width:480px)': {
      fontSize: '1.8rem',
    },
  },
});

class BlogArticle extends React.Component {
  state = {article:null, sections:[], resouces:null};
  async componentDidMount() {
    const { article, refArticle } = this.props;
    //console.log("BlogArticle, articleId", article.articleId);
    this.setState({article});
    this.detatcher = refArticle.collection("sections").onSnapshot((snapshot)=>{
      const resources = {};
      snapshot.forEach((doc)=>{
        resources[doc.id] = doc.data();
      });
      //console.log("BlogArticle.cdm", article.sections && article.sections.length, Object.keys(resources).length)
      this.setState({resources});
    });
  }
  componentWillUnmount() {
    this.detatcher();
  }
  insertSection = async (resourceId, index, markdown, raw) => {
    const { user, refArticle } = this.props;
    const { article } = this.state;
    const doc = await refArticle.collection("sections").add({
      type: "markdown",
      markdown,
      raw,
      created: new Date(),
      author: user.uid,
    });
    article.sections.splice(index, 0, doc.id);
    this.setState(article);
    await refArticle.set(article, {merge:true});
  }
  updateSection = async (resourceId, index, markdown, raw) => {
    const { refArticle } = this.props;
    await refArticle.collection("sections").doc(resourceId).set({
      markdown, 
      raw
    }, {merge:true})
  }
  deleteSection = async (resourceId, index) => {
    console.log("deleteSection", resourceId);
    const { refArticle } = this.props;
    const { article } = this.state;
    article.sections.splice(index, 1);
    this.setState(article);
    await refArticle.set(article, {merge:true});
    await refArticle.collection("sections").doc(resourceId).delete();
  }
  insertPhoto = async (index) => {
    console.log("insertPhoto", index);
    const { user, refArticle } = this.props;
    const { article } = this.state;
    const doc = await refArticle.collection("sections").add({
      type: "image",
      created: new Date(),
      author: user.uid,
    });
    article.sections.splice(index, 0, doc.id);
    this.setState(article);
    await refArticle.set(article, {merge:true});
  }
  onImageUpload = async (resourceId, imageUrl) => {
    //console.log("onImageUpload", resourceId, imageUrl);
    const { refArticle } = this.props;
    await refArticle.collection("sections").doc(resourceId).set({
      hasImage: true, imageUrl
    }, {merge:true})
  }

  render() {
    const { article, resources, error } = this.state;
    const { user, member, classes, refArticle } = this.props;
    const context = { refArticle };
    if (error) {
      return <ErrorMessage error={error} />
    }
    if (!article) {
      return "";
    }
    const canEdit = (user && article.owner === user.uid);
    const canRead = ((member && member.privilege) || 0) >= article.read;
    if (!canRead) {
      return <AccessDenied />
    }
    if (!resources) {
      return "";
    }

    const frameClass = canEdit ? classes.editorFrame : classes.readerFrame;

    return (
      <div className={frameClass}>
        <Grid container>
          <Grid item xs={canEdit ? 11 : 12}>
             <Typography component="h2" gutterBottom className={classes.title}>
              {article.title}
            </Typography>
          </Grid>
          {
            canEdit && 
            <Grid item xs={1}>
              <IconButton size="small" component={Link} to={window.location.pathname+"/settings"}>
                <SettingsIcon />
              </IconButton>
            </Grid>
          }
        </Grid>
      { canEdit && <BlogSection index={ 0 } resource={{}} saveSection={this.insertSection} insertPhoto={this.insertPhoto} {...context} /> }
        {
          article.sections.map((sectionId, index)=>{
            return <div key={sectionId}>
              <BlogSection index={ index }sectionId={sectionId} resource={ resources[sectionId] } 
                  saveSection={this.updateSection} deleteSection={this.deleteSection} 
                  insertPhoto={this.insertPhoto} onImageUpload={this.onImageUpload} 
                  readOnly={!canEdit} {...context} />
              { canEdit && <BlogSection index={ index+1 } resource={{}}
                  insertPhoto={this.insertPhoto} saveSection={this.insertSection} {...context} /> }
            </div>
          })
        }
      </div>
    )
  }
}

BlogArticle.propTypes = {
    classes: PropTypes.object.isRequired,
    refArticle: PropTypes.object.isRequired,
  };
  
export default withStyles(styles)(BlogArticle);