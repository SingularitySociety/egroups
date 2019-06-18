import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
//import theme from '../theme';
import { Button, IconButton, Grid } from '@material-ui/core';
import TrashIcon from '@material-ui/icons/Delete';
import { FormatBold, FormatItalic, FormatUnderlined, FormatQuote } from '@material-ui/icons';
import { Code } from '@material-ui/icons';
import { FormatListBulleted, FormatListNumbered, Undo, Redo } from '@material-ui/icons';
import { FormattedMessage } from 'react-intl';
import { Editor, RichUtils, EditorState, convertToRaw } from 'draft-js';
import { blockStyleFn, editorStyles } from './MarkdownViewer';

import { stateToMarkdown } from 'draft-js-export-markdown';
import { stateFromMarkdown } from 'draft-js-import-markdown';
//import stateFromMarkdown from './markdown/stateFromMarkdown';
//import stateToMarkdown from './markdown/stateToMarkdown';

const styles = editorStyles;

const customStyleMap = {
  /*
  BOLD: {
  }
  */
};

class MarkdownEditor extends React.Component {
  constructor(props) {
    super(props);
    const { resource } = this.props;
    const contentState = stateFromMarkdown(resource.markdown || "");
    const editorState = EditorState.createWithContent(contentState);
    this.state = {
      editorState
    }
  }

  onChange = (editorState) => {
    this.setState({editorState});
  }

  onSave = (e) => {
    e.preventDefault();
    const contentState = this.state.editorState.getCurrentContent();
    //console.log(stateToMarkdown);
    const markdown = stateToMarkdown(contentState);
    const raw = convertToRaw(contentState);
    this.props.onSave(markdown, raw);
  }

  onCancel = (e) => {
    this.props.onCancel();
  }

  handleKeyCommand = (command, editorState) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      this.onChange(newState);
      return 'handled';
    }
    return 'not-handled';
  }

  toggleStyle = (style) => {
    this.onChange(RichUtils.toggleInlineStyle(this.state.editorState, style));    
  }
  toggleBlockType = (type) => {
    this.onChange(RichUtils.toggleBlockType(this.state.editorState, type));
  }
  onMouseDown = e => {
    e.preventDefault(); // don't steal focus
  }
  undo = () => {
    this.onChange(EditorState.undo(this.state.editorState));
  }
  redo = () => {
    this.onChange(EditorState.redo(this.state.editorState));
  }

  render() {
    const { classes, action, onDelete } = this.props;
    const { editorState } = this.state;
    const canUndo = editorState.getUndoStack().size !== 0;
    const canRedo = editorState.getRedoStack().size !== 0;
    return (
      <div>
        <Grid container>
          <Grid item>
            <IconButton size="small" disabled={!canUndo} onClick={this.undo} onMouseDown={this.onMouseDown}>
              <Undo/>
            </IconButton>
          </Grid>
          <Grid item>
            <IconButton size="small" disabled={!canRedo} onClick={this.redo} onMouseDown={this.onMouseDown}>
              <Redo/>
            </IconButton>
          </Grid>
          <Grid item>
            <IconButton size="small" onClick={()=>{this.toggleStyle("BOLD")}} onMouseDown={this.onMouseDown}>
              <FormatBold/>
            </IconButton>
          </Grid>
          <Grid item>
            <IconButton size="small" onClick={()=>{this.toggleStyle("ITALIC")}} onMouseDown={this.onMouseDown}>
              <FormatItalic/>
            </IconButton>
          </Grid>
          <Grid item>
            <IconButton size="small" onClick={()=>{this.toggleStyle("UNDERLINE")}} onMouseDown={this.onMouseDown}>
              <FormatUnderlined/>
            </IconButton>
          </Grid>
          <Grid item>
            <IconButton size="small" onClick={()=>{this.toggleBlockType("unordered-list-item")}} onMouseDown={this.onMouseDown}>
              <FormatListBulleted/>
            </IconButton>
          </Grid>
          <Grid item>
            <IconButton size="small" onClick={()=>{this.toggleBlockType("ordered-list-item")}} onMouseDown={this.onMouseDown}>
              <FormatListNumbered/>
            </IconButton>
          </Grid>
          <Grid item>
            <IconButton size="small" onClick={()=>{this.toggleBlockType("blockquote")}} onMouseDown={this.onMouseDown}>
              <FormatQuote/>
            </IconButton>
          </Grid>
          <Grid item>
            <IconButton size="small" onClick={()=>{this.toggleBlockType("code-block")}} onMouseDown={this.onMouseDown}>
              <Code/>
            </IconButton>
          </Grid>
        </Grid>
        <Grid container>
          <Grid item xs={11} className={classes.editorFrame}>
            <Editor editorState={editorState} 
              customStyleMap={customStyleMap}
              blockStyleFn={(contentBlock) => { return blockStyleFn(classes, contentBlock)}}
              handleKeyCommand={this.handleKeyCommand}
              onChange={this.onChange} />
          </Grid>
        </Grid>
        <Button variant="contained" color="primary" className={classes.button} 
                  onClick={this.onSave} type="submit">{action || "Save"}</Button>
        <Button variant="contained" className={classes.button} onClick={this.onCancel}>
            <FormattedMessage id="cancel" />
        </Button>
        {
          onDelete && <IconButton onClick={onDelete}>
            <TrashIcon />
          </IconButton>
        }
        </div>
    );
  }
}

MarkdownEditor.propTypes = {
    classes: PropTypes.object.isRequired,
    onSave: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    resource: PropTypes.object.isRequired,
  };
  
export default withStyles(styles)(MarkdownEditor);