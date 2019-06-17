import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Editor } from 'draft-js';
import './MarkdownViewer.css';

const styles = theme => ({
  root: {
    fontFamily: "'Roboto', sans-serif",
  },
});

class MarkdownViewer extends React.Component {
    render() {
      const { value, useHtml, classes } = this.props;
      if (useHtml) {
        // This is quite safe because we always generate value from markdown. 
        return <span 
          className={classes.root}
          dangerouslySetInnerHTML={{__html:value.toString('html')}}>
        </span>
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