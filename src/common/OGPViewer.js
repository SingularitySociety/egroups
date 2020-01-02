import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Grid, IconButton } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import SaveIcon from '@material-ui/icons/SaveAlt';
import CancelIcon from '@material-ui/icons/Cancel';
import urlParser from "url";
import EditIcon from '@material-ui/icons/Edit';
import LinkIcon from '@material-ui/icons/Link';

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

function validUrl(url) {
  try {
    const myURL = urlParser.parse(url);
    return myURL;
  } catch(e) {
    console.log(e);
    return "";
  }

}

function OGPEditor(props) {
  const { url, displayMode, onUpdateUrlSection, resource } = props;
  const { classes, readOnly, inline, onDelete, sectionId } = props;
  const { editing, setEditing } = props;
  const [urlForm, setUrlForm] = useState(url);

  console.log(urlForm);
  const myURL = validUrl(urlForm||"");

  function startEditing() {
    setEditing(true);
  }
  function onCancel() {
    setEditing(false);
  }

  if (readOnly && myURL.hostname === null) {
    return "";
  }
  
  
  const ogpElement = (
    <Grid item xs={readOnly ? 12 : 11} className={ classes.wideFrame }>
      {resource.hasData ?
       <React.Fragment>
         <h3><a href={url} target="_blank">{resource.title}</a></h3>
         {resource.description}<br/>
       { resource.image ? <React.Fragment><img src={resource.image} className={ classes.wide }/><br/></React.Fragment> : ""}
       </React.Fragment>
       : <LinkIcon />}
    </Grid>
  );

       
  function saveUrl() {
    onUpdateUrlSection(urlForm);
    setEditing(false);
  }
  const ogpEditElement = (
    <React.Fragment>
      <Grid item xs={11} >
        <TextField onChange={(e) => {setUrlForm(e.target.value);}}
                   defaultValue={url}
                   placeholder="url."
                   className={classes.textField} />
      </Grid>
      <Grid item xs={1}>
        <IconButton size="small" onClick={(e) => { saveUrl();}} type="submit">
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

  const ogpViewElement = (
    <React.Fragment>
      {ogpElement}
      {!readOnly && onUpdateUrlSection &&
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
      { editing && !readOnly ? ogpEditElement : ogpViewElement }
    </Grid>);
}

OGPEditor.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(OGPEditor);
