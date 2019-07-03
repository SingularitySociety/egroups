import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Paper, Grid } from '@material-ui/core';
import MUILink from '@material-ui/core/Link';
import { Link } from 'react-router-dom';

const styles = theme => ({
  root: {
    marginBottom: theme.spacing(1),
  },
  paper: {
    marginBottom: theme.spacing(1),
    padding: theme.spacing(1),
  },
  link: {
    color: "#333",
  },
});

function GroupList(props) {
  const [groups, setGroups] = useState([]);
  const { db, classes, filter, groupIds } = props;
  useEffect(()=>{
    async function query() {
      const ref = db.collection("groups").where("groupName", ">", "").where("open", "==", true);
      const query = filter ? filter(ref) : ref;
      const snapshot = await query.get();
      //console.log(snapshot);
      const groups = [];
      snapshot.forEach((doc)=>{
          const group = doc.data();
          group.groupId = doc.id;
          groups.push(group);
      });
      setGroups(groups);
    }
    async function fetch() {
      const promises = groupIds.map(async (groupId)=>{
        const ref = db.doc(`groups/${groupId}`);
        const group = (await ref.get()).data();
        group.groupId = groupId;
        return group;
      });
      const groups = await Promise.all(promises);
      setGroups(groups);
    } 
    if (groupIds) {
      fetch();
    } else {
      query();   
    }
  }, [db, filter, groupIds]);

  return <Grid container justify="center" className={classes.root}>
    { 
      groups.map((group)=> {
        return (
          <Grid item key={group.groupId} xs={12}>
            <MUILink component={Link} className={classes.link}
              to={"/" + (group.groupName || group.groupId)}>
                <Paper className={classes.paper}> 
              {group.title}
              </Paper>
            </MUILink>
          </Grid>);
      })
    }
  </Grid>
}

GroupList.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  
export default withStyles(styles)(GroupList);