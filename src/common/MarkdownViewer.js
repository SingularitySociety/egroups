import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Editor } from 'draft-js';

const styles = theme => ({
});

class MarkdownViewer extends React.Component {
    render() {
      const { value, useHtml } = this.props;
      if (useHtml) {
        return <span dangerouslySetInnerHTML={{__html:value.toString('html')}}></span>
      }
      return (
        <Editor readOnly={true} editorState={value.getEditorState()} />
      )  
    }
}

MarkdownViewer.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  
export default withStyles(styles)(MarkdownViewer);