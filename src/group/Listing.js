import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Members from './Members';

const styles = theme => ({
});

class Listing extends React.Component {
  state = { list:[] };
  componentDidMount() {
    const { selectTab } = this.props;
    selectTab("listing");
  }
  render() {
    const { user, db, member, group, history } = this.props;
    const context = { user, group, db, member, history };
    return <Members {...context} />
  }
}

Listing.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  
export default withStyles(styles)(Listing);