import React, { useEffect } from 'react';

import LogCommon from './LogCommon';
import AccessDenied from '../../common/AccessDenied';

function getQueryFilter(group) {
  return {
    queryFilter: (query) => {
      return query.where("data.groupId", "==", group.groupId ).orderBy("created", "desc").limit(100);
    },
  };
}

function PaymentLog(props) {

  const { group, callbacks } = props;
  const { requirePemission, accessControll, privilege } = props;
  const setTabbar = callbacks.setTabbar;

  useEffect(()=> {
    setTabbar("payment.log", "payment/log");
  }, [setTabbar]);

  if (!accessControll(requirePemission, privilege)) {
    return <AccessDenied />;
  }
  
  const params = {paymentQueryFilter:getQueryFilter(group)};
  
  return <LogCommon {...props}  {...params} />;
}
export default PaymentLog;
  
