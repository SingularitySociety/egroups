import React from 'react';
import PropTypes from 'prop-types';
import { IconButton, Grid } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import PhotoIcon from '@material-ui/icons/AddPhotoAlternate';
import VideoIcon from '@material-ui/icons/VideoLibrary';
import LinkIcon from '@material-ui/icons/Link';

function BlogSectionCreator(props) {
  const { index } = props;

  function insertMarkdown() {
    props.insertMarkdown(index);
  }
  function insertImage() {
    props.insertImage(index);
  }
  function insertVideo() {
    props.insertVideo(index);
  }
  function insertUrl() {
    props.insertUrl(index);
  }
  return <Grid container justify="center">
    <Grid item>
      <IconButton  size="small" variant="contained" onClick={insertMarkdown}>
        <AddIcon />
      </IconButton>
    </Grid> 
    <Grid item>
      <IconButton  size="small" variant="contained" onClick={insertImage}>
        <PhotoIcon />
      </IconButton>
    </Grid> 
    <Grid item>
      <IconButton  size="small" variant="contained" onClick={insertVideo}>
        <VideoIcon />
      </IconButton>
    </Grid> 
    <Grid item>
      <IconButton  size="small" variant="contained" onClick={insertUrl}>
        <LinkIcon />
      </IconButton>
    </Grid> 
         </Grid>;
}

BlogSectionCreator.propTypes = {
  insertImage: PropTypes.func.isRequired,
  insertVideo: PropTypes.func.isRequired,
  insertMarkdown: PropTypes.func.isRequired,
};
  
export default BlogSectionCreator;
