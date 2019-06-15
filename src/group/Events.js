import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
});

class Events extends React.Component {
  componentDidMount() {
    const { selectTab } = this.props;
    selectTab("events");
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