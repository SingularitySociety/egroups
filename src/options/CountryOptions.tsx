import React from 'react';
import { injectIntl } from 'react-intl';
import Countries from '../const/Countries';

function CountryOptions(props) {
  const { messages } = props.intl;
  return <React.Fragment>
    {
      Countries.map((country)=> {
        return <option key={country} value={country}>{messages[country]}</option>
      })
    }
  </React.Fragment>;
} 

export default injectIntl(CountryOptions);
