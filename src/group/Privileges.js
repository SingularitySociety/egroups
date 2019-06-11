import React from 'react';

const Privileges = {
    guest: 0,
    member: 0x01,
    subscriber: 0x100,
    mentor: 0x10000,
    admin: 0x1000000,
    owner: 0x2000000
};

export const PrivilegeOptions = ()=>{
    return (<React.Fragment>
    <option key="member" value={Privileges.member}>Member</option>,
    <option key="subscriber" value={Privileges.subscriber}>Subscriber</option>,
    <option key="mentor" value={Privileges.mentor}>Mentor</option>,
    <option key="admin" value={Privileges.admin}>Admin</option>
    </React.Fragment>);
} 

export default Privileges;