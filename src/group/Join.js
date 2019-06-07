import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

const styles = theme => ({
    login: {
        marginTop: theme.spacing(9),
    }
});

class Join extends React.Component {
  render() {
    const { user, classes } = this.props;
    if (!user) {
        return <Typography variant="h5" className={classes.login}>
            In order to join, please create your account by choosing Login first.
        </Typography>
    }    
    return <p>Join us!</p>
  }
}

Join.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  
export default withStyles(styles)(Join);