import * as moment from 'moment';

export const convDateFormmat = (date) => {
  return moment.unix(date).format("YYYY/MM/DD");
};
export const convDateTimeFormmat = (date) => {
  return moment.unix(date).format("YYYY/MM/DD HH:mm:ss");
};
