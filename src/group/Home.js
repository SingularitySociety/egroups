import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Channels from './Channels';

const styles = theme => ({
  welcome: {
    marginTop: theme.spacing(0),
  }
});

class Home extends React.Component {
  render() {
      const { user, db, member, group } = this.props;
      return (<div>
        <Channels db={db} group={group} user={user} member={member}/>
        </div>
      )
  }
}

Home.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  
export default withStyles(styles)(Home);