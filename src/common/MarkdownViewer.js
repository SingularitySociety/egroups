import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Editor, EditorState, convertFromRaw } from 'draft-js';
import './MarkdownViewer.css';

import {stateFromMarkdown} from 'draft-js-import-markdown';
//import stateFromMarkdown from './markdown/stateFromMarkdown';


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
    fontFamily: "'Roboto', sans-serif",
    padding: theme.spacing(1),
    background: "#dddddd",
    fontSize: "0.95rem",
    '@media (min-width:480px)': {
      fontSize: '1.2rem',
    },
    lineHeight: "2.0em",
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
    fontSize: "1rem",
  },
  unstyled: {
    fontFamily: "'Roboto', sans-serif",
    fontSize: "0.95rem",
    '@media (min-width:480px)': {
      fontSize: '1.2rem',
    },
    lineHeight: "2.0em",
    marginBottom: "1.5em",
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
      const { classes, resource } = this.props;
      const contentState = resource.raw ? convertFromRaw(resource.raw) : stateFromMarkdown(resource.markdown);
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
    resource: PropTypes.object.isRequired,
  };
  
export default withStyles(styles)(MarkdownViewer);