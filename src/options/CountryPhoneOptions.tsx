import React from 'react';
import { injectIntl } from 'react-intl';
import Countries, { PhonePrefixes } from '../const/Countries';

function CountryPhoneOptions(props) {
  const { messages } = props.intl;
  return <React.Fragment>
    {
      Countries.map((country)=> {
        const prefix = PhonePrefixes[country]
        return <option key={country} value={prefix}>{`${messages[country]} (${prefix})`}</option>
      })
    }
  </React.Fragment>;
} 

export default injectIntl(CountryPhoneOptions);
