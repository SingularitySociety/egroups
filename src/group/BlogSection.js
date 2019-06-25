import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { IconButton, Grid } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import PhotoIcon from '@material-ui/icons/AddPhotoAlternate';
import EditIcon from '@material-ui/icons/Edit';
import MarkdownViewer from '../common/MarkdownViewer';
import MarkdownEditor from '../common/MarkdownEditor';
import ImageUploader from '../common/ImageUploader';

const styles = theme => ({
});

class BlogSection extends React.Component {
  state = { editing:false };

  onSave = (markdown, raw) => {
    //console.log("onSave", markdown);
    const { sectionId, index } = this.props;
    this.props.saveSection(sectionId, index, markdown, raw);
    this.setState({editing:false});
  }
  onCancel = () => {
    this.setState({editing:false})
  }
  onDelete = () => {
    const { deleteSection, sectionId, index } = this.props;
    deleteSection(sectionId, index);
  }
  startEditing = () => {
    this.setState({editing:true})
  }
  insertPhoto = () => {
    const { insertPhoto, index } = this.props;
    insertPhoto(index);
  }
  onImageUpload = (imageUrl) => {
    //console.log("onImageUpload", imageUrl);
    const { onImageUpload, sectionId } = this.props;
    onImageUpload(sectionId, imageUrl);
  }
  render() {
    const { resource, sectionId, deleteSection, readOnly, refArticle } = this.props;
    const { editing } = this.state;
    if (!editing) {
      if (sectionId) {
        //console.log("render1", markdown);
        //const value = RichTextEditor.createValueFromString(resource.markdown || "", 'markdown');
        //console.log("render1", value.toString("markdown"));
        if (resource.type==="image") {
          if (readOnly && !resource.hasImage) {
            return "";
          }
          const imagePath = `${refArticle.path}/${sectionId}`;
          const thumbnails = (resource[sectionId] && resource[sectionId].thumbnails) || resource.thumbnails
          return (
              <ImageUploader imagePath={imagePath} loadImage={resource.hasImage} imageUrl={resource.imageUrl}
                imageThumbnails={thumbnails} 
                readOnly={readOnly} displayMode="wide" onImageUpload={this.onImageUpload} deleteImage={this.onDelete} />
          );
        }
        const textWidth = readOnly ? 12 : 11;
        return <Grid container justify="center">
          <Grid item xs={textWidth} style={{padding:"1px"}}>
            <MarkdownViewer resource={resource} useHtml={false} />
          </Grid>
          { !readOnly &&
            <Grid item xs={1}>
              <IconButton size="small" variant="contained" onClick={this.startEditing}>
                <EditIcon />
              </IconButton>
            </Grid> 
          }
        </Grid>
      }
      return <Grid container justify="center">
        <Grid item xs={1}>
          <IconButton  size="small" variant="contained" onClick={this.startEditing}>
            <AddIcon />
          </IconButton>
        </Grid> 
        <Grid item xs={1}>
          <IconButton  size="small" variant="contained" onClick={this.insertPhoto}>
            <PhotoIcon />
          </IconButton>
        </Grid> 
      </Grid>
    }
    return (
      <MarkdownEditor resource={resource} onSave={this.onSave} onCancel={this.onCancel} onDelete={deleteSection && this.onDelete} />
    )
  }
}

BlogSection.propTypes = {
    classes: PropTypes.object.isRequired,
    saveSection: PropTypes.func.isRequired,
    resource: PropTypes.object.isRequired,
    refArticle: PropTypes.object.isRequired,
  };
  
export default withStyles(styles)(BlogSection);