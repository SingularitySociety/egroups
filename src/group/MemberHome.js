import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';

const styles = theme => ({
});

class MemberHome extends React.Component {
    componentDidMount() {
      const { selectTab } = this.props;
      selectTab("member");
    }
    render() {
        return (
            <Typography component="h2" variant="h5" gutterBottom>
              Member-only Page
            </Typography>
          )
    }
}

MemberHome.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  
export default withStyles(styles)(MemberHome);