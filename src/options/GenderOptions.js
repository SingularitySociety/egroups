import React from 'react';
import { injectIntl } from 'react-intl';

const Genders = ["please.specify", "female", "male"];

function GenderOptions(props) {
  const { messages } = props.intl;
  return <React.Fragment>
    {
      Genders.map((gender)=> {
        return <option key={gender} value={gender}>{messages[gender]}</option>
      })
    }
  </React.Fragment>;
} 

export default injectIntl(GenderOptions);
