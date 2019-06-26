import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import LockIcon from '@material-ui/icons/Lock';
import LockOpenIcon from '@material-ui/icons/LockOpen';

const styles = theme => ({
  button: {
    marginRight: theme.spacing(1),
  },
  locked: {
    display: "none",
  },
  unlocked: {
    padding: theme.spacing(1),
  }
});

class LockedArea extends React.Component {
  state = { locked: true }
  toggle = () => {
    const locked = !this.state.locked;
    this.setState({locked});
  }
  render() {
    const { classes, children, label } = this.props;
    const { locked } = this.state;
    return (
      <div>
      <IconButton onClick={this.toggle} className={classes.button}>
        { locked ? <LockIcon/> : <LockOpenIcon/> }
      </IconButton>
      { label }
      <div className={classes[locked ? "locked" : "unlocked"]}>
        { children }
      </div>
    </div>
    )
  }
}

LockedArea.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  
export default withStyles(styles)(LockedArea);