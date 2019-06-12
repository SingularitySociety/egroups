import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import MarkdownEditor from '../common/MarkdownEditor';
import { IconButton, Grid } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import EditIcon from '@material-ui/icons/Edit';
import RichTextEditor from 'react-rte'; // https://github.com/sstur/react-rte
import { Editor } from 'draft-js';

const styles = theme => ({
});

class BlogSection extends React.Component {
  state = { editing:false };

  onSave = (markdown) => {
    const { sectionId, index } = this.props;
    this.props.saveSection(sectionId, index, markdown);
    this.setState({editing:false});
  }
  onCancel = () => {
    this.setState({editing:false})
  }
  onDelete = () => {
    const { sectionId, index } = this.props;
    this.props.deleteSection(sectionId, index);
  }
  startEditing = () => {
    this.setState({editing:true})
  }
  render() {
    const { markdown, sectionId, deleteSection } = this.props;
    const { editing } = this.state;
    if (!editing) {
      if (sectionId) {
        const value = RichTextEditor.createValueFromString(markdown || "", 'markdown');
        return <Grid container>
          <Grid item xs={11}>
            <Editor readOnly={true} editorState={value.getEditorState()} />
          </Grid>
          <Grid item xs={1}>
            <IconButton size="small" variant="contained" onClick={this.startEditing}>
              <EditIcon />
            </IconButton>
          </Grid>
        </Grid>
      }
      return (
        <IconButton size="small" variant="contained" onClick={this.startEditing}>
          <AddIcon />
        </IconButton>
      );
    }
    return (
      <MarkdownEditor markdown={markdown} onSave={this.onSave} onCancel={this.onCancel} onDelete={deleteSection && this.onDelete} />
    )
  }
}

BlogSection.propTypes = {
    classes: PropTypes.object.isRequired,
    saveSection: PropTypes.func.isRequired,
  };
  
export default withStyles(styles)(BlogSection);