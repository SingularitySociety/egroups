import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Typography, Button } from '@material-ui/core';

const styles = theme => ({
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
        return <div>
            <Typography>You may leave this community anytime.</Typography>
            <Button variant="contained" onClick={this.handleLeave}>Leave</Button>
        </div>
    }
}

Account.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  
export default withStyles(styles)(Account);