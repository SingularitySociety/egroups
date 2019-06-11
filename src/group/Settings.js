import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Typography, FormGroup, Switch, FormControlLabel } from '@material-ui/core';
import { FormattedMessage } from 'react-intl';

const styles = theme => ({
});

class Settings extends React.Component {
  constructor(props) {
    super(props);
    const { group } = props;
    this.state = {
      open: group.privileges.membership.open || false,
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
      break;
    }
  };    
  render() {
      const { open } = this.state;
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
        </div>
      )
  }
}

Settings.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  
export default withStyles(styles)(Settings);