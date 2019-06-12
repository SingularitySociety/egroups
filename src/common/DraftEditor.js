import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Editor, EditorState　} from 'draft-js';
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
  render() {
    const { classes, action } = this.props;
    return (
      <div>
        <div className={classes.frame}>
          <Editor editorState={this.state.editorState} onChange={this.onChange} />
        </div>
        
        <Button variant="contained" color="primary" className={classes.button} 
                  onClick={this.onSubmit} type="submit">{action || "Create"}</Button>
        <Button variant="contained" className={classes.button} onClick={()=>this.setCreatingFlag(false)}>
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