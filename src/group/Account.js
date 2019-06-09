import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Typography, Button } from '@material-ui/core';
import { Redirect } from 'react-router-dom';

const styles = theme => ({
    button: {
        margin: theme.spacing(1)
    }
});

class Account extends React.Component {
    handleLeave = async () => {
        const { db, user, group } = this.props;
        const refMember = db.doc("groups/" + group.groupId + "/members/" + user.uid);
        await refMember.delete();
        this.props.memberDidUpdate();
        window.location.pathname = "/" + group.groupName;
    }
    
    render() {
        const { classes, group, user } = this.props;
        if (!user) {
            return <Redirect to={`/${group.groupName}`} />
        }
        return <div>
          <Typography component="h2" variant="h6" gutterBottom>
            Account
          </Typography>
          <Typography>Click the "LEAVE" button below to leave this community.</Typography>
          <Button variant="contained" className={classes.button} onClick={this.handleLeave}>Leave</Button>
        </div>
    }
}

Account.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  
export default withStyles(styles)(Account);