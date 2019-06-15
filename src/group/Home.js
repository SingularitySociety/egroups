import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';

const styles = theme => ({
  welcome: {
    marginTop: theme.spacing(0),
  }
});

class Home extends React.Component {
  componentDidMount() {
    const { selectTab } = this.props;
    selectTab("home");
  }
  render() {
      const { group } = this.props;
      //const context = { user, group, db, member, history };
      return (
        <div>
          <Typography component="h2" variant="h6" gutterBottom>
            { group.title }
          </Typography>
          <Typography gutterBottom>
            { group.description }
          </Typography>
        </div>
      )
  }
}

Home.propTypes = {
  classes: PropTypes.object.isRequired,
};
  
export default withStyles(styles)(Home);