import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import AccessDenied from './AccessDenied';
import MemberItem from './MemberItem';

const styles = theme => ({
  member: {
    marginBottom: theme.spacing(1),
  },
});

class Members extends React.Component {
  state = { list:[] };
  componentDidMount() {
    const { db, group } = this.props;
    this.detacher = db.collection(`groups/${group.groupId}/members`).orderBy("lastAccessed", "desc").onSnapshot((snapshot) => {
      const list = [];
      snapshot.forEach((doc)=>{
        list.push(doc.data());
      });
      this.setState({list});
    })
  }
  componentWillUnmount() {
    this.detacher();
  }
  render() {
    const { group, user, classes, callbacks } = this.props;
    const { list } = this.state;
    const canRead = callbacks.memberPrivilege() >= group.privileges.member.read;
    return <div>{ 
      !canRead && <AccessDenied />
    }
    {
      list.map((item)=>{
        const context = { group, user, item };
        return <div key={item.uid} className={classes.member}>
          <MemberItem {...context} />
        </div>
      })
    }</div>
  }
}

Members.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  
export default withStyles(styles)(Members);