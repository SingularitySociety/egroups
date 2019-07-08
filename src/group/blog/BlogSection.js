import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { IconButton, Grid } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import PhotoIcon from '@material-ui/icons/AddPhotoAlternate';
import EditIcon from '@material-ui/icons/Edit';
import MarkdownViewer from '../../common/MarkdownViewer';
import MarkdownEditor from '../../common/MarkdownEditor';
import ImageUploader from '../../common/ImageUploader';

function BlogSection(props) {
  const [editing, setEditing] = useState(false);
  const { sectionId, index, resource, readOnly, pathArticle } = props;

  const onSave = (markdown, raw) => {
    props.saveSection(sectionId, index, markdown, raw);
    setEditing(false);
  }
  const onCancel = () => {
    setEditing(false);
  }
  const onDelete = () => {
    props.deleteSection(sectionId, index);
  }
  const startEditing = () => {
    setEditing(true);
  }
  const insertPhoto = () => {
    props.insertPhoto(index);
  }
  const onImageUpload = (imageUrl) => {
    props.onImageUpload(sectionId, imageUrl);
  }

  if (!editing) {
    if (sectionId) {
      //console.log("render1", markdown);
      //const value = RichTextEditor.createValueFromString(resource.markdown || "", 'markdown');
      //console.log("render1", value.toString("markdown"));
      if (resource.type==="image") {
        if (readOnly && !resource.hasImage) {
          return "";
        }
        const imagePath = `${pathArticle}/${sectionId}`;
        const thumbnails = (resource[sectionId] && resource[sectionId].thumbnails) || resource.thumbnails
        return (
            <ImageUploader imagePath={imagePath} loadImage={resource.hasImage} imageUrl={resource.imageUrl}
              imageThumbnails={thumbnails} 
              readOnly={readOnly} displayMode="wide" onImageUpload={onImageUpload} deleteImage={onDelete} />
        );
      }
      const textWidth = readOnly ? 12 : 11;
      return <Grid container justify="center">
        <Grid item xs={textWidth} style={{padding:"1px"}}>
          <MarkdownViewer resource={resource} useHtml={false} />
        </Grid>
        { !readOnly &&
          <Grid item xs={1}>
            <IconButton size="small" variant="contained" onClick={startEditing}>
              <EditIcon />
            </IconButton>
          </Grid> 
        }
      </Grid>
    }
    return <Grid container justify="center">
      <Grid item xs={1}>
        <IconButton  size="small" variant="contained" onClick={startEditing}>
          <AddIcon />
        </IconButton>
      </Grid> 
      <Grid item xs={1}>
        <IconButton  size="small" variant="contained" onClick={insertPhoto}>
          <PhotoIcon />
        </IconButton>
      </Grid> 
    </Grid>
  }
  return (
    <MarkdownEditor resource={resource} onSave={onSave} onCancel={onCancel} onDelete={props.deleteSection && onDelete} />
  )
}

BlogSection.propTypes = {
    saveSection: PropTypes.func.isRequired,
    resource: PropTypes.object.isRequired,
    pathArticle: PropTypes.string.isRequired,
};
  
export default BlogSection;