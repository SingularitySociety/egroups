import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import { Typography } from '@material-ui/core';
import { FormattedMessage } from 'react-intl';

const styles = theme => ({
  root: {
    flexGrow: 1,
    padding: theme.spacing(1),
  },
  errorMessage: {
    marginTop: theme.spacing(3),
  },
});

const useStyles = makeStyles(styles);

function ErrorMessage(props) {
  const classes = useStyles();
  const { error } = props;
  return (
    <React.Fragment>
      <Grid container justify="center" alignItems="center" direction="row" className={classes.root}>
        <Grid item style={{width:"calc(80vmin)"}}>
          <Typography color="error" className={classes.errorMessage} component="h1" variant="h1" >
            <FormattedMessage id={ error.key } />
          </Typography>
        </Grid>
      </Grid>
    </React.Fragment>
  );
}

ErrorMessage.propTypes = {
  error: PropTypes.object.isRequired,
};

export default ErrorMessage;
