import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
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
          <Typography className={classes.errorMessage} component="h1" variant="h1" >
            <FormattedMessage id={ error.key } />
          </Typography>
  );
}

ComplexGrid.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(ComplexGrid);
