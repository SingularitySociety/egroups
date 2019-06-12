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
    console.log(markdown);
    const { sectionId, index } = this.props;
    this.props.saveSection(sectionId || index, markdown);
    this.setState({editing:false});
  }
  onCancel = () => {
    this.setState({editing:false})
  }
  startEditing = () => {
    this.setState({editing:true})
  }
  render() {
    const { markdown, sectionId } = this.props;
    const { editing } = this.state;
    if (!editing) {
      if (sectionId) {
        const value = RichTextEditor.createValueFromString(markdown || "", 'markdown');
        return <Grid container>
          <Grid item>
            <Editor readOnly={true} editorState={value.getEditorState()} />
          </Grid>
          <Grid item>
            <IconButton variant="contained" onClick={this.startEditing}>
              <EditIcon />
            </IconButton>
          </Grid>
        </Grid>
      }
      return (
        <IconButton variant="contained" onClick={this.startEditing}>
          <AddIcon />
        </IconButton>
      );
    }
    return (
      <MarkdownEditor markdown={markdown} onSave={this.onSave} onCancel={this.onCancel} />
    )
  }
}

BlogSection.propTypes = {
    classes: PropTypes.object.isRequired,
    saveSection: PropTypes.func.isRequired,
  };
  
export default withStyles(styles)(BlogSection);