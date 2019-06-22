import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import MUILink from '@material-ui/core/link';
import { Link } from 'react-router-dom';


const styles = theme => ({
  member: {
    color: "#333",
  }
});

class MemberItem extends React.Component {
  render() {
    const { group, item, classes } = this.props;
    return (
      <MUILink component={Link} to={`/${group.groupName}/pr/${item.uid}`} className={classes.member}>
        {item.displayName}
      </MUILink>
    )
  }
}

MemberItem.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  
export default withStyles(styles)(MemberItem);