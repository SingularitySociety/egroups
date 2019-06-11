import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';
import { FormattedMessage } from 'react-intl';

const styles = theme => ({
});

class Article extends React.Component {
    render() {
        return (
            <Typography component="h2" variant="h5" gutterBottom>
              <FormattedMessage id="article" />
            </Typography>
          )
    }
}

Article.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  
export default withStyles(styles)(Article);