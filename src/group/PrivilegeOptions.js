import React from 'react';
import { injectIntl } from 'react-intl';
import Privileges from '../const/Privileges';

const PrivilegeOptions = (props)=>{
    const { messages } = props.intl;
    return (<React.Fragment>
    <option key="member" value={Privileges.member}>{messages["member"]}</option>,
    <option key="subscriber" value={Privileges.subscriber}>{messages["subscriber"]}</option>,
    <option key="mentor" value={Privileges.mentor}>{messages["mentor"]}</option>,
    <option key="admin" value={Privileges.admin}>{messages["admin"]}</option>
    </React.Fragment>);
} 

export default injectIntl(PrivilegeOptions);
