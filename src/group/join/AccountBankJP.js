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
  const { bank_data, setBankData } = props;
  function setBankValue(key, e) {
    const new_data = (() => {
      if (bank_data) {
        return Object.assign({}, bank_data);
      } 
      return { country:"JP", currenty:"jpy" };
    })();
    new_data[key] = e.target.value;
    setBankData(new_data);
  }

  return <p>"bank"</p>;
}

AccountBankJP.propTypes = {
  classes: PropTypes.object.isRequired,
  setBankData: PropTypes.func.isRequired,
};
  
export default withStyles(styles)(AccountBankJP);
