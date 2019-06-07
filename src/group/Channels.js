import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Typography, IconButton } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';

const styles = theme => ({
});

class Channels extends React.Component {
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
        </div>
    }
}

Channels.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  
export default withStyles(styles)(Channels);