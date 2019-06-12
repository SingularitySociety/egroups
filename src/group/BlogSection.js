import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import MarkdownEditor from '../common/MarkdownEditor';
import { IconButton } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';

const styles = theme => ({
});

class BlogSection extends React.Component {
  state = { editing:false };

  onSave = (markdown) => {
    console.log(markdown);
    this.setState({editing:false})
  }
  onCancel = () => {
    this.setState({editing:false})
  }
  startEditing = () => {
    this.setState({editing:true})
  }
  render() {
      const { editing } = this.state;
      if (!editing) {
        return (
          <IconButton variant="contained" onClick={this.startEditing}>
            <AddIcon />
          </IconButton>
        );
      }
      return (
        <MarkdownEditor onSave={this.onSave} onCancel={this.onCancel} />
      )
  }
}

BlogSection.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  
export default withStyles(styles)(BlogSection);