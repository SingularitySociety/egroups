import React from 'react';
import PropTypes from 'prop-types';
import { IconButton, Grid } from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import MarkdownViewer from '../../common/packaged/MarkdownViewer';
import MarkdownEditor from '../../common/packaged/MarkdownEditor';

function BlogSectionMarkdown(props) {
  const { sectionId, index, resource, readOnly } = props;
  const { editing, onDelete, setEditing } = props;
  function onCancel() {
    setEditing(false);
  }
  function onSaveMarkdown(markdown, raw) {
    props.saveMarkdown(sectionId, index, markdown, raw);
    setEditing(false);
  }
  if (editing) {
    return (
      <MarkdownEditor resource={resource} onSave={onSaveMarkdown} onCancel={onCancel}
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

BlogSectionMarkdown.propTypes = {
  resource: PropTypes.object.isRequired,
};
  
export default BlogSectionMarkdown;
