import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Editor, EditorState　} from 'draft-js';
import theme from '../theme';

const styles = {
  frame: {
      border: "1px solid #d0d0d0",
      padding: theme.spacing(1),
      borderRadius: theme.spacing(1),
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
  render() {
    const { classes } = this.props;
    return (
        <div className={classes.frame}>
        <Editor style={{background:"yellow", width:100, height:100}} editorState={this.state.editorState} onChange={this.onChange} />
        </div>
    );
  }
}

DraftEditor.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  
export default withStyles(styles)(DraftEditor);