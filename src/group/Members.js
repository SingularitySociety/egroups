import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';
import AccessDenied from './AccessDenied';
import { Link } from 'react-router-dom';

const styles = theme => ({
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
      console.log(list);
    })
  }
  componentWillUnmount() {
    this.detacher();
  }
  render() {
    const { member, group } = this.props;
    const { list } = this.state;
    const canRead = ((member && member.privilege) || 0) >= group.privileges.member.read;
    return <div>{ 
      !canRead && <AccessDenied />
    }
    {
      list.map((item)=>{
        return <div key={item.uid}>
          <Typography component={Link} to={`/${group.groupName}/pr/${item.uid}`}>{item.displayName}</Typography>
        </div>
      })
    }</div>
  }
}

Members.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  
export default withStyles(styles)(Members);