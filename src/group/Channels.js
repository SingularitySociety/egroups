import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Typography, IconButton } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';

const styles = theme => ({
});

class Channels extends React.Component {
  state = { list:[] }
  componentDidMount() {
    const { db, group } = this.props;
    this.detacher = db.collection(`groups/${group.groupId}/channels`).onSnapshot((snapshot) => {
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
  createChannel = async () => {
    console.log("createChannel");
    const { db, group } = this.props;
    db.collection(`groups/${group.groupId}/channels`).add({
      title: "new Channel"
    });
  }
  render() {
    const { classes } = this.props;
    return <div>
      <Typography component="h2" variant="h6" gutterBottom className={classes.welcome}>
        Channels
      </Typography>
      <IconButton variant="contained" className={classes.button} onClick={this.createChannel}>
        <AddIcon />
      </IconButton>
      <div>
        { this.state.list.map((channel)=>{
          return <div key={channel.channelId}>{channel.title}</div>
        })}
      </div>
    </div>
  }
}

Channels.propTypes = {
  classes: PropTypes.object.isRequired,
};
  
export default withStyles(styles)(Channels);