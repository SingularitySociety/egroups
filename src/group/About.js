import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
});

class About extends React.Component {
    render() {
        return <p>Group About</p>
    }
}

About.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  
export default withStyles(styles)(About);