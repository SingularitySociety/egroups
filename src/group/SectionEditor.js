import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import {Editor, EditorState} from 'draft-js';


const styles = {
};
  
class SectionEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {editorState: EditorState.createEmpty()};
    this.onChange = (editorState) => this.setState({editorState});
    console.log("SectionEditor");
  }
  componentDidMount() {
    console.log("SectionEditor:didMount");

  }
  render() {
    return (
        <Editor editorState={this.state.editorState} onChange={this.onChange} />
    );
  }
}

SectionEditor.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  
export default withStyles(styles)(SectionEditor);