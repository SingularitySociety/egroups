import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
//import theme from '../theme';
import { IconButton, Grid } from '@material-ui/core';
import TrashIcon from '@material-ui/icons/Delete';
import SaveIcon from '@material-ui/icons/Save';
import CancelIcon from '@material-ui/icons/Cancel';
import LinkIcon from '@material-ui/icons/Link';
import { FormatBold, FormatItalic, FormatUnderlined, FormatQuote } from '@material-ui/icons';
import { Code } from '@material-ui/icons';
import { FormatListBulleted, FormatListNumbered, Undo, Redo } from '@material-ui/icons';
import { Editor, RichUtils, EditorState, convertToRaw, convertFromRaw } from 'draft-js';
import MarkdownDecorator from './MarkdownDecorator';
import MarkdownStyles, { blockStyleFn } from './MarkdownStyles';

import { stateToMarkdown } from 'draft-js-export-markdown';
import { stateFromMarkdown } from 'draft-js-import-markdown';
//import stateFromMarkdown from './markdown/stateFromMarkdown';
//import stateToMarkdown from './markdown/stateToMarkdown';

const styles = MarkdownStyles;
const decorator = MarkdownDecorator();

class MarkdownEditor extends React.Component {
  constructor(props) {
    super(props);
    const { resource } = this.props;
    const contentState = resource.raw ? convertFromRaw(resource.raw) : stateFromMarkdown(resource.markdown || "");
    const editorState = EditorState.createWithContent(contentState, decorator);
    this.state = {
      editorState,
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
    console.log(raw);
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
  handleReturn = (e, editorState) => {
    if (e.shiftKey) {
      const newState = RichUtils.insertSoftNewline(editorState);
      if (newState) {
        this.onChange(newState);
        return 'handled';
      }
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
  // https://bitwiser.in/2017/05/11/creating-rte-part-3-entities-and-decorators.html
  editLink = () => {
    const { editorState } = this.state;
    const selection = editorState.getSelection();
    if (selection.isCollapsed()) {
      console.log("selection is collapsed")
      return;
    }

    let url = ''; // default
    const content = editorState.getCurrentContent();
    const startKey = selection.getStartKey();
    const startOffset = selection.getStartOffset();
    const blockWithLinkAtBeginning = content.getBlockForKey(startKey);
    const linkKey = blockWithLinkAtBeginning.getEntityAt(startOffset);
    if (linkKey) {
      const linkInstance = content.getEntity(linkKey);
      url = linkInstance.getData().url;
    }

    let link = window.prompt("Paste the link", url);
    if (link === null) {
      console.log("cancelled");
      return;
    }
    if (!link) {
      console.log("removing link");
      const newEditorState = RichUtils.toggleLink(editorState, selection, null);
      this.setState({ editorState: newEditorState });
      return;
    }
    console.log("adding a link", link);
    const contentWithEntity = content.createEntity('LINK', 'MUTABLE', { url: link });
    const entityKey = contentWithEntity.getLastCreatedEntityKey();
    //const newEditorState = EditorState.push(editorState, contentWithEntity, 'create-entity');
    //const yetNewEditorState = RichUtils.toggleLink(newEditorState, selection, entityKey);
    const newEditorState = EditorState.set(editorState, { currentContent: contentWithEntity });
    const yetNewEditorState = RichUtils.toggleLink(newEditorState, newEditorState.getSelection(), entityKey);

    this.setState({ editorState: yetNewEditorState} );
  }

  render() {
    const { classes, onDelete } = this.props;
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
          <Grid item>
            <IconButton size="small" onClick={this.editLink} onMouseDown={this.onMouseDown}>
              <LinkIcon/>
            </IconButton>
          </Grid>
        </Grid>
        <Grid container>
          <Grid item xs={11} className={classes.editorFrame}>
            <Editor editorState={editorState} 
              blockStyleFn={(contentBlock) => { return blockStyleFn(classes, contentBlock)}}
              handleReturn={this.handleReturn}
              handleKeyCommand={this.handleKeyCommand}
              onChange={this.onChange} />
          </Grid>
          <Grid item xs={1}>
            <IconButton size="small" onClick={this.onSave} type="submit">
              <SaveIcon />
            </IconButton>
            <br/>
            <IconButton size="small" onClick={this.onCancel}>
              <CancelIcon />
            </IconButton>
            <br/>
            {
            onDelete && <IconButton size="small" onClick={onDelete}>
              <TrashIcon />
            </IconButton>
            }
          </Grid>
        </Grid>
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