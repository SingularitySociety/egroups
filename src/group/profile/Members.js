import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import AccessDenied from '../../common/AccessDenied';
import MemberItem from './MemberItem';
import useOnCollection from '../../common/useOnCollection';

const styles = theme => ({
  member: {
    marginBottom: theme.spacing(1),
  },
});

const useStyles = makeStyles(styles);

function queryFilter(query) {
  return query.orderBy("lastAccessed", "desc").limit(100);
}

function Members(props) {
  const classes = useStyles();
  const { db, group, user } = props;
  const [list, error] = useOnCollection(db, `groups/${group.groupId}/members`, queryFilter);

  console.log(list.length);
  if (error) {
    return <AccessDenied error={error} />    
  }
  return <div>
    {
      list.map((item)=>{
        const context = { group, user, item };
        return <div key={item.userId} className={classes.member}>
          <MemberItem {...context} />
        </div>
      })
    }
  </div>
}

Members.propTypes = {
  privilege: PropTypes.number.isRequired,
  db: PropTypes.object.isRequired,
  group: PropTypes.object.isRequired,
};
  
export default Members;