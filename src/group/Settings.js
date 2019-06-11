import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Typography, FormGroup, Switch, FormControlLabel } from '@material-ui/core';
import { FormControl, InputLabel, Select } from '@material-ui/core';
import { FormattedMessage } from 'react-intl';
import PrivilegeOptions from './Privileges';
import { Privileges } from './Privileges';

const styles = theme => ({
  formControl: {
    width:theme.spacing(40),
  }
});

class Settings extends React.Component {
  constructor(props) {
    super(props);
    const { group } = props;
    this.state = {
      open: group.privileges.membership.open || false,
      channelCreate: group.privileges.channel.create || Privileges.member,
    };
  }
  handleCheck = name => async event => {
    const { db, group } = this.props;
    const ref = db.doc(`groups/${group.groupId}`);
    this.setState({ [name]: event.target.checked });
    switch(name) {
    case "open":
      await ref.set({privileges:{membership:{open:event.target.checked}}}, {merge:true});
      break;
    default:
      console.log("no handler", name);
      break;
    }
  };    
  handleChange = name => async event => {
    const { db, group } = this.props;
    const ref = db.doc(`groups/${group.groupId}`);
    this.setState({ [name]: event.target.value });
    console.log(typeof(event.target.value));
    switch(name) {
    case "channelCreate":
      // BUGBUG: Why  do we need to use parseInt?
      await ref.set({privileges:{channel:{create:parseInt(event.target.value)}}}, {merge:true});
      break;
    default:
      console.log("no handler", name, event.target.value);
      break;
    }
  };    
  render() {
      const { classes } = this.props;
      const { open, channelCreate } = this.state;
      return (
        <div>
          <Typography component="h2" variant="h5" gutterBottom>
            <FormattedMessage id="settings" />
          </Typography>
          <FormGroup row>
            <FormControlLabel
              control={
                <Switch checked={open} onChange={this.handleCheck('open')} value="open" />
              }
              label={<FormattedMessage id="settings.open" />}
            />
          </FormGroup>
          <FormControl className={classes.formControl}>
            <InputLabel htmlFor="age-native-simple"><FormattedMessage id="settings.channel.create" /></InputLabel>
            <Select
              native
              value={channelCreate}
              onChange={this.handleChange('channelCreate')}
              inputProps={{
                name: 'channelCreate',
                id: 'age-native-simple',
              }}
            >
              <PrivilegeOptions />
            </Select>
          </FormControl>
        </div>
      )
  }
}

Settings.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  
export default withStyles(styles)(Settings);