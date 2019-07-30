import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
    form: {
      marginRight: theme.spacing(1),
      marginBottom: theme.spacing(1),
      width: '22rem',
    },
  });

function AccountBankJP(props) {
  return <p>"bank"</p>;
}

AccountBankJP.propTypes = {
  classes: PropTypes.object.isRequired,
};
  
export default withStyles(styles)(AccountBankJP);
