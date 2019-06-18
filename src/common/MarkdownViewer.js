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
  codeBlock: {
    background: "#EFF0F1", // matching github
    paddingLeft: theme.spacing(1),
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
  unstyled: {
    fontFamily: "'Roboto', sans-serif",
    fontSize: "calc(4vmin)",
    lineHeight: "1.8em",
    marginBottom: theme.spacing(2),
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
  } else if (type === 'code-block') {
    return classes.codeBlock;
  } else if (type === 'unstyled') {
    //console.log(type, classes.unstyled);
    return classes.unstyled;
  }
}

class MarkdownViewer extends React.Component {
    render() {
      const { classes, markdown } = this.props;
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