import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Editor, EditorState, RichUtils, convertToRaw, convertFromRaw } from 'draft-js';
import theme from '../theme';
import { Button } from '@material-ui/core';
import { FormattedMessage } from 'react-intl';

const styles = {
  frame: {
      border: "1px solid #d0d0d0",
      padding: theme.spacing(1),
      borderRadius: theme.spacing(1),
      marginBottom: theme.spacing(1),
  },
  button: {
    marginRight: theme.spacing(1),
  }
};

class DraftEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {editorState: EditorState.createEmpty()};
    this.onChange = (editorState) => this.setState({editorState});
    console.log("SectionEditor");
  }
  componentDidMount() {
    console.log("SectionEditor:didMount");

  }
  handleKeyCommand = (command, editorState) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      this.onChange(newState);
      return 'handled';
    }
    return 'not-handled';
  }
  onSubmit = (e) => {
    e.preventDefault();
    this.content = convertToRaw(this.state.editorState.getCurrentContent());
    console.log(this.content);
  }
  onCancel = (e) => {
    const editorState = EditorState.createWithContent(convertFromRaw(this.content));
    this.setState({editorState});
  }
  render() {
    const { classes, action } = this.props;
    return (
      <div>
        <div className={classes.frame}>
          <Editor editorState={this.state.editorState} handleKeyCommand={this.handleKeyCommand} onChange={this.onChange} />
        </div>
        
        <Button variant="contained" color="primary" className={classes.button} 
                  onClick={this.onSubmit} type="submit">{action || "Save"}</Button>
        <Button variant="contained" className={classes.button} onClick={this.onCancel}>
            <FormattedMessage id="cancel" />
        </Button>
        </div>
    );
  }
}

DraftEditor.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  
export default withStyles(styles)(DraftEditor);