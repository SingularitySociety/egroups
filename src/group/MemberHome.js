import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';
import MountDetector from '../common/MountDetector';

const styles = theme => ({
});

class MemberHome extends React.Component {
    componentDidMount() {
      const { selectTab } = this.props;
      selectTab("member");
    }
    memberDidMount = () => {
      const { member, user } = this.props;
      console.log("didMout", member, user);
    }
    memberWillUnmount = () => {
    }
    render() {
      const { member } = this.props;
      return (<React.Fragment>
          { member && <MountDetector didMount={this.memberDidMount} willUnmount={this.memberWillUnmount} />}
          <Typography component="h2" variant="h5" gutterBottom>
            Member-only Page
          </Typography>
        </React.Fragment>)
    }
}

MemberHome.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  
export default withStyles(styles)(MemberHome);