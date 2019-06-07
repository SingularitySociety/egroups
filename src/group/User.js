import React from 'react';

// User is non-display object to detect the user
class User extends React.Component {
    componentDidMount() {
        this.props.userDidMount();
    }
    componentWillUnmount() {
        this.props.userWillUnmount();
    }
    render() {
        return null
    }
}

export default User;