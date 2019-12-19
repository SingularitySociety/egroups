import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Grid, IconButton } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import SaveIcon from '@material-ui/icons/Save';
import CancelIcon from '@material-ui/icons/Cancel';
import urlParser from "js-video-url-parser";
import EditIcon from '@material-ui/icons/Edit';
import VideoIcon from '@material-ui/icons/VideoLibrary';

import { TextField } from '@material-ui/core';

const styles = theme => ({
  root: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  wideFrame: {
    //backgroundColor: "lightgray",
  },
  wide: {
    width: "100%",
  },
  textField: {
    width: "90%",
    marginBottom: theme.spacing(1),
    margin: "auto",
  },
  thumbLarge: {
    height: "12em",
    width: "12em",
    backgroundPosition: "center",
    backgroundSize: "cover",
    backgroundColor: "lightgray",
    border: "1px lightgray solid",
    borderRadius: "6em",
  },
  thumbMiddle: {
    height: "5em",
    width: "5em",
    backgroundPosition: "center",
    backgroundSize: "cover",
    backgroundColor: "lightgray",
    border: "1px lightgray solid",
    borderRadius: "2.5em",
  },
  thumbMiddleCenter: {
    height: "5em",
    width: "5em",
    backgroundPosition: "center",
    backgroundSize: "cover",
    backgroundColor: "lightgray",
    border: "1px lightgray solid",
    borderRadius: "2.5em",
    marginLeft: "auto",
    marginRight: "auto",
    marginTop: "10px",
    marginBottom: "10px",
  },
  thumbSmall: {
    height: "3em",
    width: "3em",
    backgroundPosition: "center",
    backgroundSize: "cover",
    backgroundColor: "lightgray",
    border: "1px lightgray solid",
    borderRadius: "1.5em",
  },
});

function validVideo(data) {
  if (!data || data.mediaType !== "video") {
    return false;
  }
  if (["youtube", "vimeo"].includes(data.provider)) {
    return true;
  }
  return false;
}

function VideoEditor(props) {
  const { videoUrl, displayMode, onVideoUpload } = props;
  const { classes, readOnly, inline, onDelete, sectionId } = props;
  const { editing, setEditing } = props;
  const [videoUrlForm, setVideoUrlForm] = useState(videoUrl);
  
  const data = urlParser.parse(videoUrl);

  function startEditing() {
    setEditing(true);
  }
  function onCancel() {
    setEditing(false);
  }
  
  if (readOnly && !validVideo(data)) {
    return "";
  }

  
  const embedVideoUrl = urlParser.create({
    videoInfo: data,
    format: "embed",
  });

  const videoIframe = validVideo(data) ?
        (<iframe title={sectionId}
                 width={readOnly ? 720 : 660}
                 height={readOnly ? 405 : 371}
                 src={embedVideoUrl}
                 frameBorder="0"
                 allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                 allowFullScreen>
         </iframe>) : <span><VideoIcon /></span>;
  const videoElement = (displayMode === "wide") ? (
    <Grid item xs={readOnly ? 12 : 11} className={ classes.wideFrame }>
      {videoIframe}
    </Grid>
  ) : <Grid item className={classes[displayMode || "thumbLarge"]} >{videoIframe}</Grid>;

       
  if (inline) {
    return videoElement;
  }
  function saveVideo() {
    onVideoUpload(videoUrlForm);
    setEditing(false);
  }
  const videoEditElement = (
    <React.Fragment>
      <Grid item xs={11} >
        <TextField onChange={(e) => {setVideoUrlForm(e.target.value);}}
                   defaultValue={videoUrl}
                   placeholder="yourube, vimeo Video Url."
                   className={classes.textField} />
      </Grid>
      <Grid item xs={1}>
        <IconButton size="small" onClick={(e) => { saveVideo();}} type="submit">
          <SaveIcon />
        </IconButton>
        <br/>
        <IconButton size="small" onClick={onCancel}>
          <CancelIcon />
        </IconButton>
        <br/>
        {
          onDelete && <IconButton size="small" onClick={onDelete}>
                           <DeleteIcon />
                         </IconButton>
                     }
      </Grid>
    </React.Fragment>);

  const videoViewElement = (
    <React.Fragment>
      {videoElement}
      {!readOnly && onVideoUpload &&
       <Grid item xs={1}>
         <IconButton size="small" variant="contained" component="label" onClick={startEditing}>
           <EditIcon />
         </IconButton>
         {
           onDelete && 
             <IconButton size="small" onClick={onDelete}><DeleteIcon /></IconButton>
         }
       </Grid>}
    </React.Fragment>);

  return (
    <Grid container className={classes.root} spacing={1} justify="center">
      { editing && !readOnly ? videoEditElement : videoViewElement }
    </Grid>);
}

VideoEditor.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(VideoEditor);
