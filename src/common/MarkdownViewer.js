import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Editor } from 'draft-js';

const styles = theme => ({
});

class MarkdownViewer extends React.Component {
    render() {
      const { value } = this.props;
      return (
        <Editor readOnly={true} editorState={value.getEditorState()} />
      )
    }
}

MarkdownViewer.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  
export default withStyles(styles)(MarkdownViewer);