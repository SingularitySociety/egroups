import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Paper, Grid } from '@material-ui/core';
import MUILink from '@material-ui/core/Link';
import { Link } from 'react-router-dom';

const styles = theme => ({
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
  const { db, classes } = props;
  useEffect(()=>{
    async function fetchList() {
      const ref = db.collection("groups").where("groupName", ">", "");
      const snapshot = await ref.get();
      //console.log(snapshot);
      const groups = [];
      snapshot.forEach((doc)=>{
          const group = doc.data();
          group.groupId = doc.id;
          groups.push(group);
      });
      setGroups(groups);
    } 
    fetchList();   
  }, [db]);

  return <Grid container justify="center">
    { 
      groups.map((group)=> {
          return (
            <Grid item key={group.groupId}  xs={12}>
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