import * as moment from 'moment';

export const convDateFormmat = (date) => {
  return moment.unix(date).format("YYYY/MM/DD");
};
export const convDateTimeFormmat = (date) => {
  return moment.unix(date).format("YYYY/MM/DD HH:mm:ss");
};
export const privilegeText = (privilege) => {
  if (privilege === 0x2000000) {
    return "privilege.owner";
  } else if (privilege === 0x1000000) {
    return "privilege.admin";
  } else if (privilege === 0x10000) {
    return "privilege.mentor"; 
  } else if (privilege === 0x100) {
    return "privilege.subscriber"; 
  } else if (privilege === 0x01) {
    return "privilege.member"; 
  } else if (privilege === 0) {
    return "privilege.guest"; 
  }
  return "privilege.na";
};
