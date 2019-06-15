import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Typography, Button, FormGroup } from '@material-ui/core';
import { Redirect } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import EditableField from '../common/EditableField';

const styles = theme => ({
    button: {
        margin: theme.spacing(1)
    }
});

class Account extends React.Component {
    componentDidMount() {
        const { selectTab } = this.props;
        selectTab("account");
    }
    handleLeave = async () => {
        const { db, user, group } = this.props;
        const refMember = db.doc(`groups/${group.groupId}/members/${user.uid}`);
        await refMember.delete();
        this.props.memberDidUpdate();
        window.location.pathname = "/" + group.groupName;
    }
    onSave = name => async value => {
        //console.log(name, value);
        const { db, user, group } = this.props;
        const refMember = db.doc(`groups/${group.groupId}/members/${user.uid}`);
        await refMember.set({[name]:value}, {merge:true});
        this.props.memberDidUpdate();
      }    
    
    render() {
        const { classes, group, user, member } = this.props;
        if (!user) {
            return <Redirect to={`/${group.groupName}`} />
        }
        if (!member) {
            return "";
        }
        console.log(member);
        return <div>
          <FormGroup row>
            <EditableField label={<FormattedMessage id="member.displayName"/>} 
                value={member.displayName} onSave={this.onSave('displayName')}/>
          </FormGroup>
          <FormGroup row>
            <EditableField label={<FormattedMessage id="member.profile"/>} multiline={true}
                value={member.profile} onSave={this.onSave('profile')}/>
          </FormGroup>
          <Typography component="h2" variant="h6" gutterBottom>
            <FormattedMessage id="account" />
          </Typography>
          <Typography>Click the "LEAVE" button below to leave this community.</Typography>
          <Button variant="contained" className={classes.button} onClick={this.handleLeave}><FormattedMessage id="leave" /></Button>
        </div>
    }
}

Account.propTypes = {
    classes: PropTypes.object.isRequired,
    memberDidUpdate: PropTypes.func.isRequired,
  };
  
export default withStyles(styles)(Account);