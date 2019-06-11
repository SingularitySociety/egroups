import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Typography, Grid, Button } from '@material-ui/core';
import Header from './Header';
import { FormattedMessage } from 'react-intl';
import { Redirect } from 'react-router-dom';

const styles = theme => ({
  root: {
    flexGrow: 1,
    padding: theme.spacing(1),
    paddingTop: theme.spacing(3),
  },
  button: {
    margin: theme.spacing(1),
  }
});

class NewGroup extends React.Component {
  state = {};
  onSubmit = (e) => {
    e.preventDefault();
    console.log("onSubmit");
    alert("sorry. not yet implemented");
  }
  onCancel = async (e) => {
    e.preventDefault();
    const { db, match:{params:{groupId}} } = this.props;
    console.log("onCancel", groupId);
    await db.doc(`groups/${groupId}`).delete();
    this.setState({redirect:"/"});
  }

  render() {
    const { classes, user } = this.props;
    const { redirect } = this.state;
    if (redirect) {
      return <Redirect to={ redirect } />
    }
    return (
      <React.Fragment>
        <Header user={user} />
        <Grid container justify="center" alignItems="center" direction="row" className={classes.root}>
          <Grid item style={{width:"calc(80vmin)"}}>
            <Typography component="h2" variant="h6" gutterBottom>
              <FormattedMessage id="new.group" />
            </Typography>
            <form className={classes.form}>
              <Button variant="contained" color="primary" className={classes.button} disabled={ false }
                onClick={this.onSubmit} type="submit"><FormattedMessage id="create" /></Button>
              <Button variant="contained" className={classes.button} onClick={this.onCancel}>
                  <FormattedMessage id="cancel" />
              </Button>
            </form>
          </Grid>
        </Grid>
      </React.Fragment>
    );
  }
}

NewGroup.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  
export default withStyles(styles)(NewGroup);