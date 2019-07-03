import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Grid } from '@material-ui/core';
import CreateNew from './common/CreateNew';
import { FormattedMessage } from 'react-intl';
import { Redirect } from 'react-router-dom';
import * as firebase from "firebase/app";
import "firebase/functions";
import CircularProgress from '@material-ui/core/CircularProgress';

const styles = theme => ({
  createNew: {
    marginBottom: theme.spacing(1),
  },
});

class GroupList extends React.Component {
  state = { processing:false };

  createNew = async (value) => {
    console.log("createNew", value);
    const { user } = this.props;
    const createGroup = firebase.functions().httpsCallable('createGroup');
    this.setState({processing:true});
    const result = (await createGroup({
      title:value, ownerName:user.displayName
    })).data;
    this.setState({processing:false});
    console.log(result);
    if (result.result && result.groupId) {
      this.setState({redirect:`/a/new/${result.groupId}`});
    } else {
      // BUGBUG: Display Error
      console.log("#### createGroup failed")
    }
  }
  render() {
    const { classes } = this.props;
    const { redirect, processing } = this.state;
    if (redirect) {
      return <Redirect to={redirect} />
    }
    return <Grid container justify="center">
        <Grid item className={classes.createNew}>
          {
            processing ?
              <CircularProgress />
            :
              <CreateNew label={<FormattedMessage id="group" />} 
                createNew={this.createNew} action={<FormattedMessage id="create" />} />
          }
        </Grid>
    </Grid>
  }
}

GroupList.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  
export default withStyles(styles)(GroupList);