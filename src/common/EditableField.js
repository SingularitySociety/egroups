import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { TextField, IconButton } from '@material-ui/core';
import SaveIcon from '@material-ui/icons/Save';

const styles = theme => ({
  form:{
    width: "100%",
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  textField: {
    width: "90%",
  }
});

class About extends React.Component {
  constructor(props) {
    super(props);
    this.state = {value:props.value, editing:false, ignoreBlur:false};
  }
  onChange = (e) => {
    let value = e.target.value;
    let editing = (value !== this.props.value)
    this.setState({value, editing, ignoreBlur:false});
  }
  onSubmit = (e) => {
    e.preventDefault();
    this.setState({ignoreBlue:false});
  }
  onBlur = (e) => {
    if (!this.state.ignoreBlur) {
      this.setState({ value:this.props.value, editing:false })
    }
  }
  onMouseDown = (e) => {
    this.setState({ignoreBlur:true});
  }
  render() {
      const { label, classes } = this.props;
      const { value, editing } = this.state;
      return (
        <form className={classes.form}>
          <TextField label={label} value={value} variant="outlined" className={classes.textField}
            onChange={this.onChange} onBlur={this.onBlur} />
          {
            editing && <React.Fragment>
            <IconButton type="submit" color="primary"
                onClick={this.onSubmit} onMouseDown={this.onMouseDown}>
              <SaveIcon />
            </IconButton>
            </React.Fragment>
          }
        </form>
        )
  }
}

About.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  
export default withStyles(styles)(About);