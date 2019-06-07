import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
});

class Home extends React.Component {
    render() {
        return <p>Group Home</p>
    }
}

Home.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  
export default withStyles(styles)(Home);