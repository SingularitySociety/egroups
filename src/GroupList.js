import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Link } from 'react-router-dom';

const styles = theme => ({
});

class GroupList extends React.Component {
  state = { groups:[] };
  async componentDidMount() {
    const { db } = this.props;
    const ref = db.collection("groups");
    const snapshot = await ref.get();
    //console.log(snapshot);
    const groups = [];
    snapshot.forEach((doc)=>{
        const group = doc.data();
        group.groupId = doc.id;
        groups.push(group);
    });
    this.setState({groups:groups});
  }
  render() {
    return <ul>
        { 
            this.state.groups.map((group)=> {
                return <li key={group.groupId}>
                    <Link  to={"/" + group.groupName}>{group.title}</Link>
                </li>
            })
        }
    </ul>
  }
}

GroupList.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  
export default withStyles(styles)(GroupList);