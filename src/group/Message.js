import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Typography, Grid } from '@material-ui/core';
import ImageUploader from '../common/ImageUploader';

const styles = theme => ({
  frame: {
    width: "100%",
  },
  userFrame: {
    position: "absolute",
  },
  userName: {
    color: "#606060",
  },
  messageFrame: {
    paddingLeft: "4em",
    paddingTop: "1.5em",
  },
  message: {
    wordWrap: "break-word",
  },
});

class Message extends React.Component {
  render() {
    const { message, classes, group } = this.props;
    // BUGBUG: Use thumbnail, and don't pass loadImage={true}
    const imagePath = `groups/${group.groupId}/members/${message.uid}/images/profile`; // BUGBUG: use thumbnails
    return (
      <div className={classes.frame}>
        <Grid container className={classes.userFrame}>
          <ImageUploader imagePath={imagePath} loadImage={true}
                  readOnly={true} displayMode="thumbSmall" inline={true} />

          <Typography variant="caption" className={classes.userName} gutterBottom>
            { message.userName }
          </Typography>
        </Grid>

        <div className={classes.messageFrame}>
          <Typography gutterBottom className={classes.message}>
            { message.message }
          </Typography>
        </div>
      </div>
    )
  }
}

Message.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  
export default withStyles(styles)(Message);