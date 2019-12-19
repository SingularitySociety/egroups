import React, { useEffect } from 'react';

import LogCommon from './LogCommon';

function getQueryFilter(group) {
  return {
    queryFilter: (query) => {
      return query.where("data.groupId", "==", group.groupId ).orderBy("created", "desc").limit(100);
    },
  };
}

function PaymentLog(props) {

  const { group, callbacks } = props;
  const setTabbar = callbacks.setTabbar;

  useEffect(()=> {
    setTabbar("payment.log", "payment/log");
  }, [setTabbar]);

  const params = {paymentQueryFilter:getQueryFilter(group)};
  
  return <LogCommon {...props}  {...params} />;
}
export default PaymentLog;
  
