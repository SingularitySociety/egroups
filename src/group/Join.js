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
    const { db, user, group } = this.props;
    const refMember = db.doc("groups/" + group.groupId + "/members/" + user.uid);
    await refMember.set({ lastAccessed: firebase.firestore.FieldValue.serverTimestamp()});
    this.props.memberDidUpdate();
    window.location.pathname = "/" + group.groupName + "/account";
  }
  render() {
    const { user, classes, group } = this.props;
    if (!user) {
        return <Typography variant="h5" className={classes.login}>
            In order to join {group.title}, please create your account by choosing Login first.
        </Typography>
    }
    if (!(group && group.privileges && group.privileges.membership && group.privileges.membership.open)) {
        return <div>
            <Typography>This community is invitation only.</Typography>
            <Button variant="contained" onClick={this.handleJoin}>Try to Join</Button>
        </div>

    }
    return <div>
            <Typography>This community is open to public. Feel free to join anytime.</Typography>
            <Button variant="contained" onClick={this.handleJoin}>Join</Button>
        </div>
  }
}

Join.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  
export default withStyles(styles)(Join);