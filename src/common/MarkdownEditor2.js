import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import theme from '../theme';
import { Button, IconButton, Grid } from '@material-ui/core';
import TrashIcon from '@material-ui/icons/Delete';
import { FormatBold, FormatItalic, FormatUnderlined } from '@material-ui/icons';
//import { FormatListBulleted, FormatListNumbered, Undo, Redo } from '@material-ui/icons';
import { FormattedMessage } from 'react-intl';
import { EditorValue }  from 'react-rte'; // https://github.com/sstur/react-rte
//import { EditorValue } from 'react-rte';
import { Editor, RichUtils } from 'draft-js';
//import { Editor, EditorState, RichUtils, convertToRaw, convertFromRaw } from 'draft-js';

const styles = {
  editorFrame: {
    borderColor: theme.palette.primary.main,
    borderWidth: "1px",
    borderStyle: "solid",
  },
  button: {
    margin: theme.spacing(1),
  }
};

class MarkdownEditor extends React.Component {
  constructor(props) {
    super(props);
    const value = EditorValue.createFromString(this.props.markdown || "", 'markdown');
    this.state = {
      editorState: value.getEditorState()
    }
  }

  onChange = (editorState) => {
    this.setState({editorState});
  }

  onSave = (e) => {
    e.preventDefault();
    /*
    const { value } = this.state;
    console.log(value.toString('html'));
    console.log(value.toString('markdown'));
    console.log(value.getEditorState());
    */
    const value = new EditorValue(this.state.editorState);
    this.props.onSave(value.toString('markdown'));
  }

  onCancel = (e) => {
    /*
    console.log("cancelled");
    const value = RichTextEditor.createValueFromString("abcd**eda**few", 'markdown');
    this.setState({value});
    */
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

  render() {
    const { classes, action, onDelete } = this.props;
    const { editorState } = this.state;
    return (
      <div>
        <Grid container>
          <Grid item>
            <IconButton size="small" onClick={()=>{this.toggleStyle("BOLD")}}>
              <FormatBold/>
            </IconButton>
          </Grid>
          <Grid item>
            <IconButton size="small" onClick={()=>{this.toggleStyle("ITALIC")}}>
              <FormatItalic/>
            </IconButton>
          </Grid>
          <Grid item>
            <IconButton size="small" onClick={()=>{this.toggleStyle("UNDERLINE")}}>
              <FormatUnderlined/>
            </IconButton>
          </Grid>
        </Grid>
        <Grid container>
          <Grid item xs={11} className={classes.editorFrame}>
            <Editor editorState={editorState} 
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
  };
  
export default withStyles(styles)(MarkdownEditor);