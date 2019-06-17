import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import MarkdownEditor from '../common/MarkdownEditor2';
import { IconButton, Grid } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import PhotoIcon from '@material-ui/icons/AddPhotoAlternate';
import EditIcon from '@material-ui/icons/Edit';
import RichTextEditor from 'react-rte'; // https://github.com/sstur/react-rte
import MarkdownViewer from '../common/MarkdownViewer';
import ImageUploader from '../common/ImageUploader';

const styles = theme => ({
});

class BlogSection extends React.Component {
  state = { editing:false };

  onSave = (markdown) => {
    //console.log("onSave", markdown);
    const { sectionId, index } = this.props;
    this.props.saveSection(sectionId, index, markdown);
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
  render() {
    const { group, resource, sectionId, article, deleteSection, readOnly } = this.props;
    const { editing } = this.state;
    if (!editing) {
      if (sectionId) {
        //console.log("render1", markdown);
        const value = RichTextEditor.createValueFromString(resource.markdown || "", 'markdown');
        //console.log("render1", value.toString("markdown"));
        if (resource.type==="image") {
          const imagePath = `groups/${group.groupId}/articles/${article.articleId}/${sectionId}`;
          console.log(imagePath);
          return (
            <ImageUploader imagePath={imagePath} onImageUpload={()=>{}} />
          );
        }
        return <Grid container>
          <Grid item xs={11} style={{padding:"1px"}}>
            <MarkdownViewer value={value} useHtml={false} />
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
      <MarkdownEditor markdown={resource.markdown} onSave={this.onSave} onCancel={this.onCancel} onDelete={deleteSection && this.onDelete} />
    )
  }
}

BlogSection.propTypes = {
    classes: PropTypes.object.isRequired,
    saveSection: PropTypes.func.isRequired,
  };
  
export default withStyles(styles)(BlogSection);