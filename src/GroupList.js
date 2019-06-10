import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Link } from 'react-router-dom';
import CreateNew from './common/CreateNew';

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

  createNew = (value) => {
    console.log("createNew", value);
    const { db, user } = this.props;
    db.collection("groups").add(
      { title:value, owner:user.uid, displayName:user.displayName } // HACK: see groupDidCreate cloud function
    )
  }
  render() {
    return <div>
        { 
            this.state.groups.map((group)=> {
                return <div key={group.groupId}>
                    <Link  to={"/" + (group.groupName || group.groupId)}>{group.title}</Link>
                </div>
            })
        }
        <CreateNew label="Group Name" createNew={this.createNew} />
    </div>
  }
}

GroupList.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  
export default withStyles(styles)(GroupList);