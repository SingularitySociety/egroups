import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import LockIcon from '@material-ui/icons/Lock';
import LockOpenIcon from '@material-ui/icons/LockOpen';

const useStyles = makeStyles(theme => ({
  button: {
    marginRight: theme.spacing(1),
  },
  locked: {
    //display: "none",
    visibility: "hidden",
  },
  unlocked: {
    padding: theme.spacing(1),
  }
}));

export default function LockedArea(props) {
  const classes = useStyles();
  const [locked, setLocked] = useState(true);
  const { children, label } = props;

  return (
    <div>
      <IconButton onClick={()=>{setLocked(!locked);}} className={classes.button}>
        { locked ? <LockIcon/> : <LockOpenIcon/> }
      </IconButton>
        { label }
      <div className={classes[locked ? "locked" : "unlocked"]}>
        { children }
      </div>
    </div>
  );
}

