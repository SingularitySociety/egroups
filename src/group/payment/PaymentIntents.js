import React, { useState, useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import * as firebase from "firebase/app";
import "firebase/functions";

function PaymentIntents(props) {
  const { group, callbacks } = props;
  const setTabbar = callbacks.setTabbar;
  const [paymentLogs, setPaymentLogs] = useState([]);
  
  useEffect(()=> {
    // todo
    setTabbar("payout.log", "payment/payout");
  }, [setTabbar]);
  

  useEffect(() => {
    (async () => {
      const getPaymentIntentsLog = firebase.functions().httpsCallable('getPaymentIntentsLog');
      const response = (await getPaymentIntentsLog({groupId: group.groupId})).data;
      if (response.result) {
        setPaymentLogs(response.data);
      }
    })();
  }, []);

  // WIP 
  return <div>
           <table>
             <thead>
               <tr>
                 <th>金額</th>
               </tr>
             </thead>
             <tbody>
               {paymentLogs.map((log) => {
                 console.log(log);
                 return <tr>
                          <td>{log.amount}</td>
                        </tr>;
               })}
             </tbody>
           </table>
         </div>;
}
export default PaymentIntents;

