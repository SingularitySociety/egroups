import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import { Grid, Button } from '@material-ui/core';
import { FormattedMessage } from 'react-intl';

const styles = theme => ({
  join: {
    marginTop: theme.spacing(1),
  }
});
const useStyles = makeStyles(styles);

function JoinButton(props) {
  const { member, pageInfo, group } = props;
  const classes = useStyles();
  if (member 
    || pageInfo.tabId==="join" 
    || pageInfo.tabId==="subscribe") {
      return "";
  }
  const path = `/${group.groupName}/` 
          + (group.subscription ? "subscribe" : "join");

  return (
    <Grid container justify="center" className={classes.join}>
      <Grid item>
        <Button variant="contained" color="primary" component={Link} to={path}><FormattedMessage id="join" /></Button>
      </Grid>
    </Grid>
)
}

JoinButton.propTypes = {
  ///classes: PropTypes.object.isRequired,
};
  
export default JoinButton;