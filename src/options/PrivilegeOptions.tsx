import React from 'react';
import { injectIntl } from 'react-intl';
import Privileges from '../const/Privileges';

const PrivilegeOptions = (props)=>{
  const { noSubscriber, privilege } = props; 
  const { messages } = props.intl;
  const list = noSubscriber ? 
        ["member", "mentor", "admin"] : ["member", "subscriber", "mentor", "admin"];
  console.log(privilege);
  return (<React.Fragment>
    { 
      list.filter((item) => {
        if (privilege !== undefined) {
          return privilege > Privileges[item];
        }
        return true;
      }).map((item) => {
        return <option key={item} value={Privileges[item]}>{messages[item]}</option>;
      })
    }
  </React.Fragment>);
} 

export default injectIntl(PrivilegeOptions);
