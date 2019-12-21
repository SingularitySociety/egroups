import React, { useState, useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import * as firebase from "firebase/app";
import "firebase/functions";

import * as utils from '../../common/utils';

function PayoutLog(props) {
  const { group, callbacks } = props;
  const setTabbar = callbacks.setTabbar;

  const [paymentLogs, setPaymentLogs] = useState([]);

  useEffect(()=> {
    setTabbar("payout.log", "payment/payout");
  }, [setTabbar]);
  
  useEffect(() => {
    (async () => {
      const getPayoutLog = firebase.functions().httpsCallable('getPayoutLog');
      const response = (await getPayoutLog({groupId: group.groupId})).data;
      if (response.result) {
        setPaymentLogs(response.data);
      }
    })();
  }, []);

  return <div>
           <table>
             <thead>
               <tr>
                 <th><FormattedMessage id="payout.arrival_date"/></th>
                 <th><FormattedMessage id="payout.amount" /></th>
                 <th><FormattedMessage id="payout.type" /></th>
                 <th><FormattedMessage id="payout.status" /></th>
                 <th><FormattedMessage id="payout.failure_message" /></th>
               </tr>
             </thead>
             <tbody>
               {paymentLogs.map((log, key) => {
                 return <tr key={key}>
                          <td>{utils.convDateFormmat(log.arrival_date)}</td>
                          <td>{log.amount} {log.currency}</td>
                          <td>{log.type}</td>
                          <td>{log.status}</td>
                          <td>{log.failure_message || "---"}</td>
                        </tr>;
               })}
             </tbody>
           </table>
         </div>;
}
export default PayoutLog;

