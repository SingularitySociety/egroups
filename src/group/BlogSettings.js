import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';

const styles = theme => ({
});

class BlogSettings extends React.Component {
  async componentDidMount() {
    const { match:{params:{articleId}}, selectTab } = this.props;
    selectTab("blog.settings", `br/${articleId}`);
  }
  render() {
      return (
          <Typography component="h2" variant="h5" gutterBottom>
            BlogSettings
          </Typography>
        )
  }
}

BlogSettings.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  
export default withStyles(styles)(BlogSettings);