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
  const { privilege, pageInfo, group } = props;
  const classes = useStyles();
  if (privilege 
    || pageInfo.tabId==="join" 
    || pageInfo.tabId==="subscribe"
    || !group.open) {
      return false;
  }
  
  const path = `/g/${group.groupName}/` 
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
  pageInfo: PropTypes.object.isRequired,
  group: PropTypes.object.isRequired,
};
  
export default JoinButton;
