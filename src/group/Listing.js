import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Members from './Members';

const styles = theme => ({
});

class Listing extends React.Component {
  state = { list:[] };
  componentDidMount() {
    const { callbacks } = this.props;
    callbacks.setTabbar("listing");
  }
  render() {
    const { user, db, member, group, history, callbacks } = this.props;
    const context = { user, group, db, member, history, callbacks };
    return <Members {...context} />
  }
}

Listing.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  
export default withStyles(styles)(Listing);