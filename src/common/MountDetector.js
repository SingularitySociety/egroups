import React from 'react';
import PropTypes from 'prop-types';

// This component simply notifies when it's mounted. 
class MountDetector extends React.Component {
    componentDidMount() {
        this.props.didMount(this.props.value);
    }
    componentWillUnmount() {
        this.props.willUnmount();
    }
    render() {
        return null; // Invisible component
    }
}

MountDetector.propTypes = {
    didMount: PropTypes.func.isRequired,
    willUnmount: PropTypes.func.isRequired,
  };

export default MountDetector;