import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import MarkdownEditor from '../common/MarkdownEditor';
import { IconButton } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import RichTextEditor from 'react-rte'; // https://github.com/sstur/react-rte
import { Editor } from 'draft-js';

const styles = theme => ({
});

class BlogSection extends React.Component {
  state = { editing:false };

  onSave = (markdown) => {
    console.log(markdown);
    this.props.insertSection(markdown, this.props.index);
    this.setState({editing:false});
  }
  onCancel = () => {
    this.setState({editing:false})
  }
  startEditing = () => {
    this.setState({editing:true})
  }
  render() {
    const { markdown } = this.props;
    const { editing } = this.state;
    if (!editing) {
      if (markdown) {
        const value = RichTextEditor.createValueFromString(markdown || "", 'markdown');
        return <Editor readOnly={true} editorState={value.getEditorState()} />
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
    insertSection: PropTypes.func.isRequired,
  };
  
export default withStyles(styles)(BlogSection);