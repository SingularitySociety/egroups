import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Typography, IconButton, Button, TextField } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';

const styles = theme => ({
});

class Channels extends React.Component {
  state = { list:[], creating:false, value:"" }
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
  createChannel = async (e) => {
    e.preventDefault();
    const { db, group } = this.props;
    db.collection(`groups/${group.groupId}/channels`).add({
      title: this.state.value
    });
    this.setCreatingFlag(false);
  }
  setCreatingFlag = (creating) => {
    this.setState({creating, value:""})
  }
  onChange = (e) => {
    let value = e.target.value;
    this.setState({value});
  }
  render() {
    const { classes } = this.props;
    const { creating, value } = this.state;
    return <div>
      <Typography component="h2" variant="h6" gutterBottom className={classes.welcome}>
        Channels
      </Typography>
        { creating ?
          <form>
            <TextField onChange={this.onChange} value={value} autoFocus />
            <Button variant="contained" onClick={this.createChannel} type="submit">Create</Button>
            <Button variant="contained" onClick={()=>this.setCreatingFlag(false)}>Cancel</Button>
          </form>
          : 
          <IconButton variant="contained" onClick={()=>this.setCreatingFlag(true)}>
            <AddIcon />
          </IconButton>
      }
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