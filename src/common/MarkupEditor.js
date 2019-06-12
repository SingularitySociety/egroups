import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Editor, EditorState, RichUtils, convertToRaw, convertFromRaw } from 'draft-js';
import theme from '../theme';
import { Button } from '@material-ui/core';
import { FormattedMessage } from 'react-intl';
import RichTextEditor from 'react-rte';

const styles = {
  button: {
    marginRight: theme.spacing(1),
  }
};

class MarkupEditor extends React.Component {
  state = {
    value: RichTextEditor.createEmptyValue()
  }
  constructor(props) {
    super(props);
    console.log("SectionEditor");
  }
  componentDidMount() {
    console.log("SectionEditor:didMount");

  }
  onChange = (value) => {
    this.setState({value});
  }

  onSubmit = (e) => {
    e.preventDefault();
    const { value } = this.state;
    console.log(value.toString('html'));
    console.log(value.toString('markdown'));
  }
  onCancel = (e) => {
    console.log("cancelled");
    const value = RichTextEditor.createValueFromString("abcd**eda**few", 'markdown');
    this.setState({value});
  }
  render() {
    const { classes, action } = this.props;
    const { value } = this.state;
    return (
      <div>
        <div className={classes.frame}>
          <RichTextEditor autoFocus value={value} onChange={this.onChange} />
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

MarkupEditor.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  
export default withStyles(styles)(MarkupEditor);