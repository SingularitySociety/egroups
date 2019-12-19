import React from 'react';
import PropTypes from 'prop-types';
import { IconButton, Grid } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import PhotoIcon from '@material-ui/icons/AddPhotoAlternate';
import EditIcon from '@material-ui/icons/Edit';
import VideoIcon from '@material-ui/icons/VideoLibrary';
import MarkdownViewer from '../../common/packaged/MarkdownViewer';
import MarkdownEditor from '../../common/packaged/MarkdownEditor';
import ImageUploader from '../../common/ImageUploader';
import VideoEditor from '../../common/VideoEditor';

function BlogSection(props) {
  const { sectionId, index, resource, readOnly, pathArticle } = props;
  const { editingFlags, updateEditingFlag } = props;
  function onMarkdownSave(markdown, raw) {
    props.saveSection(sectionId, index, markdown, raw);
    updateEditingFlag(sectionId, false);
  }
  function onCancel() {
    updateEditingFlag(sectionId, false);
  }
  function onDelete() {
    props.deleteSection(sectionId, index);
  }
  function setEditing(flag) {
    updateEditingFlag(sectionId, flag);
  }
  function onImageUpload(imageUrl) {
    props.onImageUpload(sectionId, imageUrl);
  }
  function onVideoUpload(videoUrl) {
    props.onVideoUpload(sectionId, videoUrl);
  }
  const editing = (editingFlags||{})[sectionId];
  
  if (resource.type==="image") {
    if (readOnly && !resource.hasImage) {
      return "";
    }
    const imagePath = `${pathArticle}/${sectionId}`;
    const thumbnails = (resource[sectionId] && resource[sectionId].thumbnails) || resource.thumbnails;
    return (
      <ImageUploader imagePath={imagePath} loadImage={resource.hasImage} imageUrl={resource.imageUrl}
                     imageThumbnails={thumbnails}
                     readOnly={readOnly} displayMode="wide" onImageUpload={onImageUpload} deleteImage={onDelete} />
    );
  }
  if (resource.type==="video") {
    return (
      <VideoEditor videoUrl={resource.videoUrl} readOnly={readOnly} sectionId={sectionId}
                   editing={editing} setEditing={setEditing}
                   displayMode="wide" onVideoUpload={onVideoUpload} deleteVideo={onDelete} />
    );
  }
  if (resource.type==="markdown") {
    if (editing) {
      return (
        <MarkdownEditor resource={resource} onSave={onMarkdownSave} onCancel={onCancel}
                        onDelete={props.deleteSection && onDelete} />
      );
    }

    const textWidth = readOnly ? 12 : 11;
    return <Grid container justify="center">
             <Grid item xs={textWidth} style={{padding:"1px"}}>
               <MarkdownViewer resource={resource} />
             </Grid>
             { !readOnly &&
               <Grid item xs={1}>
                 <IconButton size="small" variant="contained" onClick={(e) => {setEditing(true);}}>
                   <EditIcon />
                 </IconButton>
               </Grid> 
             }
           </Grid>;
  }
  return <div/>;
}

BlogSection.propTypes = {
  insertImage: PropTypes.func.isRequired,
  saveSection: PropTypes.func.isRequired,
  resource: PropTypes.object.isRequired,
  pathArticle: PropTypes.string.isRequired,
};
  
export default BlogSection;
