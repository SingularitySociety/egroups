import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';
import MountDetector from '../common/MountDetector';
import Privileges from '../const/Privileges';
import * as firebase from "firebase/app";
import "firebase/firestore";


const styles = theme => ({
  welcome: {
    marginTop: theme.spacing(0),
  }
});

class GroupHome extends React.Component {
  componentDidMount() {
    const { selectTab } = this.props;
    selectTab("home");
  }
  memberDidMount = async (member) => {
    if (member.privilege >= Privileges.admin) {
      this.setState({canEdit:true});
      const { group, db, user, reloadGroup } = this.props;
      console.log("isAdmin", group.homepage);

      // This code is not atomic but it is fine because there is only one owner
      if (!group.homepage) {
        const doc = await db.collection(`groups/${group.groupId}/articles`).add({
          title: "welcome", // BUGBUG: Localize it
          created: firebase.firestore.FieldValue.serverTimestamp(),
          type: "page",
          owner: user.uid,
          read: Privileges.guest, 
          comment: Privileges.admin, 
          sections: [], // ordered list of sectionIds
        });
        await db.doc(`groups/${group.groupId}`).set({
          homepage: doc.id,
        }, {merge:true});
        reloadGroup();
      }
    }
  }
  memberWillUnmount = () => {
  }
  render() {
      const { group, member } = this.props;
      //const context = { user, group, db, member, history };
      return (
        <div>
          { member && <MountDetector didMount={this.memberDidMount} willUnmount={this.memberWillUnmount} value={member} />}
          <Typography component="h2" variant="h6" gutterBottom>
            { group.title }
          </Typography>
          <Typography gutterBottom>
            { group.homepage }
          </Typography>
        </div>
      )
  }
}

GroupHome.propTypes = {
  classes: PropTypes.object.isRequired,
};
  
export default withStyles(styles)(GroupHome);