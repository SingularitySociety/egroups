import React from 'react';
import { injectIntl } from 'react-intl';

export const Privileges = {
    guest: 0,
    member: 0x01,
    subscriber: 0x100,
    mentor: 0x10000,
    admin: 0x1000000,
    owner: 0x2000000
};

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
