import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { FormGroup } from '@material-ui/core';
import { Redirect } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import EditableField from '../common/EditableField';

const styles = theme => ({
    button: {
        margin: theme.spacing(1)
    }
});

class Profile extends React.Component {
    state = { member:null };
    async componentDidMount() {
        const { db, group, selectTab, match:{params:{userId}} } = this.props;
        selectTab("listing");
        console.log(userId);
        const member = (await db.doc(`groups/${group.groupId}/members/${userId}`).get()).data();
        console.log(member);
        this.setState({member});
    }
    onSave = name => async value => {
        // no-op
    }    
    
    render() {
        const { classes, group, user } = this.props;
        const { member } = this.state;
        if (!user) {
            return <Redirect to={`/${group.groupName}`} />
        }
        if (!member) {
            return "";
        }
        console.log(user, member);
        return <div>
          <FormGroup row>
            <EditableField label={<FormattedMessage id="member.displayName"/>} 
                value={member.displayName} onSave={this.onSave('displayName')} disabled={true}/>
          </FormGroup>
          <FormGroup row>
            <EditableField label={<FormattedMessage id="member.profile"/>} multiline={true}
                value={member.profile} onSave={this.onSave('profile')} disabled={true}/>
          </FormGroup>
          <FormGroup row>
            <EditableField label={<FormattedMessage id="member.email"/>} 
                value={member.email || ""} onSave={this.onSave('email')} disabled={true}/>
          </FormGroup>
          <FormGroup row>
            <EditableField label={<FormattedMessage id="member.twitter"/>} 
                value={member.twitter || ""} onSave={this.onSave('twitter')} disabled={true}/>
          </FormGroup>
          <FormGroup row>
            <EditableField label={<FormattedMessage id="member.github"/>} 
                value={member.github || ""} onSave={this.onSave('github')} disabled={true}/>
          </FormGroup>
        </div>
    }
}

Profile.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  
export default withStyles(styles)(Profile);