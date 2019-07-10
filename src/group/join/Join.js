import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Typography, Button } from '@material-ui/core';
import { Redirect } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import PleaseLogin from './PleaseLogin';

const styles = theme => ({
    login: {
        marginTop: theme.spacing(9),
    },
    button: {
        margin: theme.spacing(1)
    }
});

function Join(props) {
  const { db, user, group, callbacks, classes, member } = props;
  const setTabbar = callbacks.setTabbar;
  const [error, setError] = useState(null);
  useEffect(()=>{
    setTabbar("join");
  }, [setTabbar]);

  const handleJoin = async () => {
    const refMember = db.doc(`groups/${group.groupId}/members/${user.uid}`);
    try {
        await refMember.set({ 
            created: new Date(), // firebase.firestore.FieldValue.serverTimestamp(),
            displayName: user.displayName,
            userId: user.uid,
            email: user.email || "",
            groupId: group.groupId,
        }, {merge:true});
        await refMember.collection("private").doc("history").set({
            // empty object
        }, {merge:true});
        callbacks.memberDidUpdate();
        //window.location.pathname = "/" + group.groupName;
    } catch(e) {
        console.log(e);
        setError("Unable to Join"); // BUGBUG
    }
  }

  const title = <Typography component="h2" variant="h6" gutterBottom>
                  <FormattedMessage id="application" />
                </Typography>;
  if (!user) {
      return <PleaseLogin />;
  }
  if (member) {
      console.log("Become a member or already a member. Redireting to the group home.");
      return <Redirect to={"/" + group.groupName} />
  }
  if (!(group && group.open)) {
      return <div>
          {title}
          <Typography>
            <FormattedMessage id="join.closed" />
          </Typography>
          <Button variant="contained" onClick={handleJoin} className={classes.button}>Try to Join</Button>
          {
              error && <p style={{color:"red"}}>{error}</p>
          }
      </div>

  }
  return <div>
          {title}
          <Typography>
            <FormattedMessage id="join.open" />
          </Typography>
          <Button variant="contained" color="primary" onClick={handleJoin} className={classes.button}><FormattedMessage id="join" /></Button>
          {
              error && <p style={{color:"red"}}>{error}</p>
          }
      </div>
}

Join.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  
export default withStyles(styles)(Join);