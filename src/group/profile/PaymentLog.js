import React, { useState, useEffect } from 'react';
import useOnCollection from '../../common/useOnCollection';

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

  const [paymentQueryFilter, setPaymentQueryFilter] = useState(getQueryFilter(group, user));
  const params = {paymentQueryFilter};

  const setTabbar = callbacks.setTabbar;

  useEffect(()=> {
    setTabbar("payment.log", "payment/log");
  }, [setTabbar]);
  
  return <LogCommon {...props}  {...params} />;
}
export default PaymentLog;
  
