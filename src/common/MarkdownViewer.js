import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Editor, EditorState } from 'draft-js';
import './MarkdownViewer.css';
import {stateFromMarkdown} from 'draft-js-import-markdown';


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
    //console.log(type, classes.unstyled);
    return classes.unstyled;
  }
}

class MarkdownViewer extends React.Component {
    render() {
      const { value, classes, markdown } = this.props;
      const contentState = stateFromMarkdown(markdown);
      let editorState = EditorState.createWithContent(contentState);
      return (
        <Editor readOnly={true} 
        blockStyleFn={(contentBlock) => { return blockStyleFn(classes, contentBlock)}}
        editorState={editorState} />
      )  
    }
}

MarkdownViewer.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  
export default withStyles(styles)(MarkdownViewer);