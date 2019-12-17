import React, { useState, useEffect } from 'react';
import useOnCollection from '../../common/useOnCollection';

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

  const [paymentQueryFilter, setPaymentQueryFilter] = useState(getQueryFilter(group));

  const setTabbar = callbacks.setTabbar;

  useEffect(()=> {
    setTabbar("payment.log", "payment/log");
  }, [setTabbar]);

  const params = {paymentQueryFilter};
  
  return <LogCommon {...props}  {...params} />;
}
export default PaymentLog;
  
