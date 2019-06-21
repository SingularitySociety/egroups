import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import ChannelList from './ChannelList';

const styles = theme => ({
  welcome: {
    marginTop: theme.spacing(0),
  }
});

class Channels extends React.Component {
  componentDidMount() {
    const { selectTab } = this.props;
    selectTab("channels");
  }
  render() {
      const { user, db, member, group, history } = this.props;
      const context = { user, group, db, member, history };
      return (
        <div>
          <ChannelList {...context}/>
        </div>
      )
  }
}

Channels.propTypes = {
  classes: PropTypes.object.isRequired,
};
  
export default withStyles(styles)(Channels);