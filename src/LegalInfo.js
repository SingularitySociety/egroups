import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Header from './Header';
import Grid from '@material-ui/core/Grid';

const styles = theme => ({
  root: {
    flexGrow: 1,
    padding: theme.spacing(1),
    paddingTop: theme.spacing(10),
  },
  caption: {
    textAlign: "center",
    width: "100%",
  },
});

const LegalInfoJP = props => {
  const { classes, user } = props;
  return (
    <React.Fragment>
          <Typography component="h1" variant="h1" gutterBottom>
          Legal Info
          </Typography>
    </React.Fragment>
  );
}

LegalInfoJP.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(LegalInfoJP);
