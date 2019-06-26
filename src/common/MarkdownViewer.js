import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Link from '@material-ui/core/Link';
import { Editor, EditorState, convertFromRaw, CompositeDecorator } from 'draft-js';
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
  headerOne: {
    fontWeight: "600",
    marginBottom: theme.spacing(2),
    fontSize: "1.4rem",
    '@media (min-width:480px)': {
      fontSize: '1.8rem',
    },
  },
  blockquote: {
    fontFamily: "'Roboto', sans-serif",
    padding: theme.spacing(1),
    background: "#dddddd",
    fontSize: "0.95rem",
    '@media (min-width:480px)': {
      fontSize: '1.05rem',
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
    fontFamily:"Consolas,Monaco,Lucida Console,Liberation Mono,DejaVu Sans Mono,Bitstream Vera Sans Mono,Courier New",
    fontSize: "0.65rem",
  },
  unstyled: {
    fontFamily: "'Roboto', sans-serif",
    fontSize: "0.95rem",
    '@media (min-width:480px)': {
      fontSize: '1.05rem',
    },
    lineHeight: "2.0em",
    marginBottom: "1.5em",
  }
});

const linkStrategy = (contentBlock, callback, contentState) => {
  contentBlock.findEntityRanges(
    (character) => {
      const entityKey = character.getEntity();
      return (
        entityKey !== null &&
        contentState.getEntity(entityKey).getType() === 'LINK'
      );
    },
    callback
  );
};

const linkComponent = (props) => {
  const { contentState, entityKey } = props;
  const { url } = contentState.getEntity(entityKey).getData();
  return (
    <Link
      href={url}
    >{props.children}</Link>
  );
};

const decorators = [{
  strategy: linkStrategy,
  component: linkComponent,
}];

export const compositeDecorator = new CompositeDecorator(decorators);

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

const useStyles = makeStyles(styles);

function MarkdownViewer(props) {
  const classes = useStyles();
  const { resource } = props;
  const contentState = resource.raw ? convertFromRaw(resource.raw) : stateFromMarkdown(resource.markdown);
  const editorState = EditorState.createWithContent(contentState, compositeDecorator);
  return (
    <Editor readOnly={true} 
      blockStyleFn={(contentBlock) => { return blockStyleFn(classes, contentBlock)}}
      editorState={editorState} />
  )  
}

MarkdownViewer.propTypes = {
  resource: PropTypes.object.isRequired,
};

export default MarkdownViewer;
