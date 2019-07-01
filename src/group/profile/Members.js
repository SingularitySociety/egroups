import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import AccessDenied from '../AccessDenied';
import MemberItem from './MemberItem';

const styles = theme => ({
  member: {
    marginBottom: theme.spacing(1),
  },
});

const useStyles = makeStyles(styles);

function Members(props) {
  const classes = useStyles();
  const { db, group, user, callbacks } = props;
  const [ list, setList ] = useState([]);

  useEffect(() => {
    const detacher = db.collection(`groups/${group.groupId}/members`).orderBy("lastAccessed", "desc").onSnapshot((snapshot) => {
      const newList = [];
      snapshot.forEach((doc)=>{
        newList.push(doc.data());
      });
      setList(newList);
    })
    return detacher;
  }, [db, group]);

  const canRead = callbacks.memberPrivilege() >= group.privileges.member.read;
  return <div>
    { 
      !canRead && <AccessDenied />
    }
    {
      list.map((item)=>{
        const context = { group, user, item };
        return <div key={item.uid} className={classes.member}>
          <MemberItem {...context} />
        </div>
      })
    }
  </div>
}

Members.propTypes = {
  callbacks: PropTypes.object.isRequired,
  db: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  group: PropTypes.object.isRequired,
};
  
export default Members;