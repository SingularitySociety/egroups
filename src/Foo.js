import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

class Foo extends React.Component {
    render() {
        return <p>Group List</p>
    }
}

Foo.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  
export default withStyles(styles)(Foo);