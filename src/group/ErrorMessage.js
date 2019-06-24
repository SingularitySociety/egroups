import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
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
    color: "red",
  },
});

function ComplexGrid(props) {
  const { classes, error } = props;
  return (
    <React.Fragment>
      <Grid container justify="center" alignItems="center" direction="row" className={classes.root}>
        <Grid item style={{width:"calc(80vmin)"}}>
          <Typography className={classes.errorMessage} component="h2" variant="h5" >
            <FormattedMessage id={ error.key } />
          </Typography>
        </Grid>
      </Grid>
    </React.Fragment>
  );
}

ComplexGrid.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(ComplexGrid);
