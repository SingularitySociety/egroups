import React, { useState } from 'react';
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

function GroupList(props) {
  const [ processing, setProcessing ] = useState(false);
  const [ redirect, setRedirect ] = useState(null);
  const { user, classes } = props;

  const createNew = async (value) => {
    console.log("createNew", value);
    const createGroup = firebase.functions().httpsCallable('createGroup');
    setProcessing(true);
    const result = (await createGroup({
      title:value, ownerName:user.displayName
    })).data;
    setProcessing(false);
    console.log(result);
    if (result.result && result.groupId) {
      setRedirect(`/a/new/${result.groupId}`);
    } else {
      // BUGBUG: Display Error
      console.log("#### createGroup failed")
    }
  }

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
            createNew={createNew} action={<FormattedMessage id="create" />} />
      }
    </Grid>
  </Grid>
}

GroupList.propTypes = {
  classes: PropTypes.object.isRequired,
};
  
export default withStyles(styles)(GroupList);