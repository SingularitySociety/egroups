import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Typography, Button } from '@material-ui/core';
import * as firebase from "firebase/app";
import "firebase/firestore";

const styles = theme => ({
    login: {
        marginTop: theme.spacing(9),
    }
});

class Join extends React.Component {
  handleJoin = async () => {
    const { db, user, group, member } = this.props;
    console.log("handleJoin", member);
      const refMember = db.doc("groups/" + group.groupId + "/members/" + user.uid);
      console.log(refMember);
      refMember.set({ lastAccessed: firebase.firestore.FieldValue.serverTimestamp()});
  }
  render() {
    const { user, classes, group } = this.props;
    if (!user) {
        return <Typography variant="h5" className={classes.login}>
            In order to join, please create your account by choosing Login first.
        </Typography>
    }    
    console.log(group && group.privileges && group.privileges.membership && group.privileges.membership.open)
    return <Button variant="contained" onClick={this.handleJoin}>Join us!</Button>
  }
}

Join.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  
export default withStyles(styles)(Join);