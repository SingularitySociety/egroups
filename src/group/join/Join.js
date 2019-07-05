import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Typography, Button } from '@material-ui/core';
import { Redirect } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import PleaseLogin from './PleaseLogin';

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
    const { db, user, group, callbacks } = this.props;
    const refMember = db.doc(`groups/${group.groupId}/members/${user.uid}`);
    try {
        await refMember.set({ 
            created: new Date(), // firebase.firestore.FieldValue.serverTimestamp(),
            displayName: user.displayName,
            userId: user.uid,
            email: user.email || "",
            groupId: group.groupId,
        }, {merge:true});
        await refMember.collection("private").doc("history").set({
            // empty object
        }, {merge:true});
        callbacks.memberDidUpdate();
        //window.location.pathname = "/" + group.groupName;
    } catch(e) {
        console.log(e);
        this.setState({error:"Unable to Join"})
    }
  }
  componentDidMount() {
    const { callbacks } = this.props;
    callbacks.setTabbar("join");
  }
  render() {
    const { user, classes, group, member } = this.props;
    const { error } = this.state;
    const title = <Typography component="h2" variant="h6" gutterBottom>
                    <FormattedMessage id="application" />
                  </Typography>;
    if (!user) {
        return <PleaseLogin />;
    }
    if (member) {
        console.log("Become a member or already a member. Redireting to the group home.");
        return <Redirect to={"/" + group.groupName} />
    }
    if (!(group && group.open)) {
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
            <Button variant="contained" color="primary" onClick={this.handleJoin} className={classes.button}><FormattedMessage id="join" /></Button>
            {
                error && <p style={{color:"red"}}>{error}</p>
            }
        </div>
  }
}

Join.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  
export default withStyles(styles)(Join);