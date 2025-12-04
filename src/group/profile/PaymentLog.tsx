import React, { useEffect } from 'react';

import LogCommon from '../payment/LogCommon';

function getQueryFilter(group, user) {
  return {
    queryFilter: (query) => {
      return query.where("data.groupId", "==", group.groupId )
        .where("data.userId", "==", user.uid )
        .orderBy("created", "desc").limit(100);
    },
  };
}

function PaymentLog(props) {

  const { group, user, callbacks } = props;
  const setTabbar = callbacks.setTabbar;

  useEffect(()=> {
    setTabbar("user.payment.log", "account/payment/log");
  }, [setTabbar]);
  
  const params = {paymentQueryFilter:getQueryFilter(group, user)};

  return <LogCommon {...props}  {...params} />;
}
export default PaymentLog;
  
