import React from 'react';
import { FormattedMessage } from 'react-intl';
import AccessDenied from '../../common/AccessDenied';
import useOnCollection from '../../common/useOnCollection';
import * as utils from '../../common/utils';

import { makeStyles } from '@material-ui/core/styles';
import MUILink from '@material-ui/core/link';
import { Link } from 'react-router-dom';

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
                 <th><FormattedMessage id="payment.log_type"/></th>
                 <th><FormattedMessage id="payment.user"/></th>
                 <th><FormattedMessage id="payment.created_date"/></th>
                 <th><FormattedMessage id="payment.start_date"/></th>
                 <th></th>
                 <th><FormattedMessage id="payment.end_date"/></th>
                 <th><FormattedMessage id="payment.subtotal"/></th>
                 <th><FormattedMessage id="payment.tax"/></th>
                 <th><FormattedMessage id="payment.amount"/></th>
                 <th><FormattedMessage id="payment.invoice"/></th>
               </tr>
             </thead>
             <tbody>
               {paymentlogs.map((paymentlog, key) => {
                 const url = `/g/${group.groupName}/pr/${paymentlog.data.userId}`;
                 if (paymentlog.type === "billing" && paymentlog.data.subscription) {
                   const subscription = paymentlog.data.subscription;
                   return <tr key={key}>
                            <td>
                              <FormattedMessage id="payment.subscription"/>
                            </td>
                            <td>
                              <MUILink component={Link} to={url} className={classes.member}>
                                {memberObj[paymentlog.data.userId] ? memberObj[paymentlog.data.userId].displayName : paymentlog.data.userId}
                              </MUILink>
                            </td>
                            <td>{utils.convDateFormmat(paymentlog.created.seconds)}</td>
                            <td>{utils.convDateFormmat(subscription.current_period_start)}</td>
                            <td>-</td>
                            <td>{utils.convDateFormmat(subscription.current_period_end)}</td>
                            <td>{subscription.plan.amount} {subscription.plan.currency}</td>
                          </tr>;
                 } else if ( paymentlog.type === "callback") {
                   if (paymentlog.data && paymentlog.data.log && paymentlog.data.log.data && paymentlog.data.log.data.object &&
                       paymentlog.data.log.data.object.object === "invoice") {
                     const dataObject = paymentlog.data.log.data.object;
                     return <tr key={key}>
                              <td>
                                <FormattedMessage id="payment.payment"/>
                              </td>
                              <td>
                                <MUILink component={Link} to={url} className={classes.member}>
                                  {memberObj[paymentlog.data.userId] ? memberObj[paymentlog.data.userId].displayName : paymentlog.data.userId}
                                </MUILink>
                              </td>
                              <td>{utils.convDateTimeFormmat(paymentlog.created.seconds)}</td>
                              <td>{utils.convDateFormmat(dataObject.period_start)}</td>
                              <td>-</td>
                              <td>{utils.convDateFormmat(dataObject.period_end)}</td>
                              <td>
                                {dataObject.subtotal} {dataObject.currency}
                              </td>
                              <td>
                                {dataObject.tax} {dataObject.currency}
                              </td>
                              <td>
                                {dataObject.amount_paid} {dataObject.currency}
                              </td>
                              <td>
                                <MUILink href={dataObject.invoice_pdf} className={classes.member} target="_blank" rel="noopener noreferrer">
                                  領収書
                                </MUILink>
                              </td>
                            </tr>;
                   }
                 }
                 return null;
               })
               }
             </tbody>
           </table>
         </div>;
}
export default PaymentLog;
  
