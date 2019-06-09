import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Typography, Button } from '@material-ui/core';
import * as firebase from "firebase/app";
import "firebase/firestore";

const styles = theme => ({
    login: {
        marginTop: theme.spacing(9),
    },
    button: {
        margin: theme.spacing(1)
    }
});

class Join extends React.Component {
  state = { error:null };
  handleJoin = async () => {
    const { db, user, group } = this.props;
    const refMember = db.doc("groups/" + group.groupId + "/members/" + user.uid);
    try {
        await refMember.set({ lastAccessed: firebase.firestore.FieldValue.serverTimestamp()}, {merge:true});
        this.props.memberDidUpdate();
        window.location.pathname = "/" + group.groupName + "/account";
    } catch(e) {
        console.log(e);
        this.setState({error:"Unable to Join"})
    }
  }
  render() {
    const { user, classes, group } = this.props;
    const { error } = this.state;
    const title = <Typography component="h2" variant="h6" gutterBottom>
                    Community Membership
                  </Typography>;
    if (!user) {
        return <div>
            {title}
            <Typography >
                In order to join {group.title}, please create your account by choosing Login first.
            </Typography>
        </div>
    }
    if (!(group && group.privileges && group.privileges.membership && group.privileges.membership.open)) {
        return <div>
            {title}
            <Typography>This community is invitation only.</Typography>
            <Button variant="contained" onClick={this.handleJoin} className={classes.button}>Try to Join</Button>
            {
                error && <p style={{color:"red"}}>{error}</p>
            }
        </div>

    }
    return <div>
            {title}
            <Typography>This community is open to public. Feel free to join anytime.</Typography>
            <Button variant="contained" onClick={this.handleJoin} className={classes.button}>Join</Button>
        </div>
  }
}

Join.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  
export default withStyles(styles)(Join);