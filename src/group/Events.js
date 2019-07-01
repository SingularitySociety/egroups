import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
});

class Events extends React.Component {
  componentDidMount() {
    const { callbacks } = this.props;
    callbacks.setTabbar("events");
  }
  render() {
      return (
          "Under Construction"
        )
  }
}

Events.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  
export default withStyles(styles)(Events);