import React from 'react';
import { injectIntl } from 'react-intl';

const businessTypes = ["company", "Individual"];

function BusinessType(props) {
  const { messages } = props.intl;
  return <React.Fragment>
    {
      businessTypes.map((type)=> {
        return <option key={type} value={type}>{messages[type]}</option>
      })
    }
  </React.Fragment>;
} 

export default injectIntl(BusinessType);
