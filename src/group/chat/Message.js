import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import { Typography, Grid } from '@material-ui/core';
import ImageUploader from '../../common/ImageUploader';

const styles = theme => ({
  frame: {
    width: "100%",
  },
  userFrame: {
    position: "absolute",
  },
  userName: {
    color: "#606060",
    marginLeft: theme.spacing(1),
  },
  messageFrame: {
    paddingLeft: "3em",
    paddingTop: "1.5em",
  },
  message: {
    wordWrap: "break-word",
  },
});

const useStyles = makeStyles(styles);

function Message(props) {
  const classes = useStyles();
  const { message, callbacks, profiles } = props;
  const her = profiles[message.userId];
  const hitProfile = callbacks.hitProfile;
  useEffect(()=> {
    if (!her) {
      console.log('hitProfile', message.userId);
      hitProfile(message.userId);
    }    
  }, [message, hitProfile, her]);

  const userName = (her && her.displayName) || message.userName;
  const thumbnails = her && her.profile && her.profile.thumbnails;
  // HACK: Switching the key for ImageUploader to force the mounting a new component.
  return (
    <div className={classes.frame}>
      <Grid container className={classes.userFrame}>
        <ImageUploader key={ thumbnails ? 1 : 2 } imagePath={""} imageThumbnails={thumbnails}
                readOnly={true} displayMode="thumbSmall" inline={true} />
        <Typography variant="caption" className={classes.userName} gutterBottom>
          { userName }
        </Typography>
      </Grid>

      <div className={classes.messageFrame}>
        <Typography gutterBottom className={classes.message}>
        &nbsp;&nbsp;{ message.message }
        </Typography>
      </div>
    </div>
  )
}

Message.propTypes = {
    message: PropTypes.object.isRequired,
    profiles: PropTypes.object.isRequired,
  };
  
export default Message;