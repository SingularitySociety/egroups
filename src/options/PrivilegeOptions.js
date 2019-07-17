import React from 'react';
import { injectIntl } from 'react-intl';
import Privileges from '../const/Privileges';

const PrivilegeOptions = (props)=>{
  const { noSubscriber } = props; 
  const { messages } = props.intl;
  const list = noSubscriber ? 
          ["member", "mentor", "admin"] : ["member", "subscriber", "mentor", "admin"]
  return (<React.Fragment>
    { 
      list.map((item) => {
        return <option key={item} value={Privileges[item]}>{messages[item]}</option>
      })
    }
  </React.Fragment>);
} 

export default injectIntl(PrivilegeOptions);
