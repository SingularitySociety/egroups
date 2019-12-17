import React, { useState, useEffect } from 'react';
import AccessDenied from '../../common/AccessDenied';
import useOnCollection from '../../common/useOnCollection';
import * as moment from 'moment';

import { makeStyles } from '@material-ui/core/styles';
import MUILink from '@material-ui/core/link';
import { Link } from 'react-router-dom';

const convDateFormmat = (date) => {
  return moment.unix(date).format("YYYY/MM/DD HH:mm:ss");
};

const styles = theme => ({
  member: {
    marginBottom: theme.spacing(1),
    color: "#333",
  },
});

const useStyles = makeStyles(styles);

function PaymentLog(props) {
  const classes = useStyles();

  const { db, group, paymentQueryFilter} = props;

  const [paymentlogs, error] = useOnCollection(db, `stripelog`, paymentQueryFilter);

  const [memberQueryFilter, setMemberQueryFilter] = useState({empty: true});
  const [members, error2] = useOnCollection(db, `groups/${group.groupId}/members`);

  if (error || error2) {
    return <AccessDenied error={error || error2} />;
  }

  const memberObj = (members && members.length > 0) ? members.reduce((ret, member) => {
    ret[member.userId] = member;
    return ret;
  }, {}) : {};
  
  
  return <div>
           <table>
             <thead>
               <tr>
                 <th>ユーザ</th>
                 <th>決済日</th>
                 <th>期間開始</th>
                 <th></th>
                 <th>期間終了</th>
                 <th>金額</th>
               </tr>
             </thead>
             <tbody>
               {paymentlogs.map((paymentlog, key) => {
                 const subscription = paymentlog.data.subscription;
                 const url = `/g/${group.groupName}/pr/${paymentlog.data.userId}`;
                 
                 return <tr key={key}>
                          <td>
                            <MUILink component={Link} to={url} className={classes.member}>
                              {memberObj[paymentlog.data.userId] ? memberObj[paymentlog.data.userId].displayName : paymentlog.data.userId}
                            </MUILink>
                          </td>
                          <td>{convDateFormmat(paymentlog.created.seconds)}</td>
                          <td>{convDateFormmat(subscription.current_period_start)}</td>
                          <td>-</td>
                          <td>{convDateFormmat(subscription.current_period_end)}</td>
                          <td>{subscription.plan.amount} {subscription.plan.currency}</td>
                        </tr>;
               })}
             </tbody>
           </table>
         </div>;
}
export default PaymentLog;
  
