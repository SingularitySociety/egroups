import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import * as firebase from "firebase/app";
import "firebase/firestore";
import CreateNew from './CreateNew';

const styles = theme => ({
});

class Channels extends React.Component {
  state = { list:[] }
  componentDidMount() {
    const { db, group } = this.props;
    this.detacher = db.collection(`groups/${group.groupId}/channels`).orderBy("created", "desc").onSnapshot((snapshot) => {
      console.log("onSnapshot")
      const list = [];
      snapshot.forEach((doc)=>{
        const channel = doc.data();
        channel.channelId = doc.id;
        list.push(channel);
      });
      this.setState({list});
    })
  }
  componentWillUnmount() {
    this.detacher();
  }
  createChannel = async (title) => {
    console.log("createChannel:", title)
    const { db, group } = this.props;
    db.collection(`groups/${group.groupId}/channels`).add({
      title,
      created: firebase.firestore.FieldValue.serverTimestamp()
    });
  }
  render() {
    return <div>
      <CreateNew createNew={ this.createChannel }/>
      <div>
        {
          this.state.list.map((channel)=>{
            return <div key={channel.channelId}>{channel.title}</div>
          })
        }
      </div>
    </div>
  }
}

Channels.propTypes = {
  classes: PropTypes.object.isRequired,
};
  
export default withStyles(styles)(Channels);