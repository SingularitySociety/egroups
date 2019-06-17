import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Editor } from 'draft-js';
import './MarkdownViewer.css';

const styles = theme => ({
 editorFrame: {
    borderColor: theme.palette.primary.main,
    borderWidth: "1px",
    borderStyle: "solid",
  },
  button: {
    margin: theme.spacing(1),
  },
  blockquote: {
    padding: theme.spacing(1),
    background: "#dddddd",
  },
  unorderedListItem: {
  },
  orderedListItem: {
  },
  unstyled: {
    fontFamily: "'Roboto', sans-serif",
    marginBottom: theme.spacing(1),
  }
});

export const editorStyles = styles;

export const blockStyleFn = (classes, contentBlock) => {
  const type = contentBlock.getType();
  if (type === 'blockquote') {
    return classes.blockquote;
  } else if (type === 'unordered-list-item') {
    return classes.unorderedListItem;
  } else if (type === 'ordered-list-item') {
    return classes.orderedListItem;
  } else if (type === 'unstyled') {
    console.log(type, classes.unstyled);
    return classes.unstyled;
  }
}

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
        <Editor readOnly={true} 
        blockStyleFn={(contentBlock) => { return blockStyleFn(classes, contentBlock)}}
        editorState={value.getEditorState()} />
      )  
    }
}

MarkdownViewer.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  
export default withStyles(styles)(MarkdownViewer);