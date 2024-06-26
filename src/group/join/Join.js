import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Typography, Button } from '@material-ui/core';
import { Redirect } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import PleaseLogin from './PleaseLogin';
import ResultMessage from '../../common/ResultMessage';
import Processing from '../../common/Processing';

const styles = theme => ({
  login: {
      marginTop: theme.spacing(9),
  },
  button: {
      margin: theme.spacing(1)
  }
});

function Join(props) {
  const { db, user, group, callbacks, classes, privilege } = props;
  const setTabbar = callbacks.setTabbar;
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  useEffect(()=>{
    setTabbar("join");
  }, [setTabbar]);

  const handleJoin = async () => {
    const refMember = db.doc(`groups/${group.groupId}/members/${user.uid}`);
    setError(null);
    setProcessing(true);
    try {
      await refMember.set({ 
          created: new Date(), // firebase.firestore.FieldValue.serverTimestamp(),
          displayName: user.displayName,
          userId: user.uid,
          email: user.email || "",
          groupId: group.groupId,
      }, {merge:true});

      callbacks.memberDidUpdate();
    } catch(e) {
      console.log(e);
      setError(<FormattedMessage id="error.cannot.join" values={{error:e}}/>); 
    }
    setProcessing(false);
  };

  const title = <Typography component="h2" variant="h6" gutterBottom>
                  <FormattedMessage id="application" />
                </Typography>;
  if (!user) {
    return <PleaseLogin group={group}/>;
  }
  if (privilege) {
    console.log("Become a member or already a member. Redireting to the group home.");
    return <Redirect to={`/g/${group.groupName}`} />;
  }
  if (!(group && group.open)) {
    return <div>
        {title}
        <Typography>
          <FormattedMessage id="join.closed" />
        </Typography>
        <Button variant="contained" onClick={handleJoin} className={classes.button}>Try to Join</Button>
        <Processing active={processing} />
        <ResultMessage error={error} />
    </div>;
  }
  return <div>
      {title}
      <Typography>
        <FormattedMessage id="join.open" />
      </Typography>
      <Button variant="contained" color="primary" onClick={handleJoin} className={classes.button}><FormattedMessage id="join" /></Button>
      <Processing active={processing} />
      <ResultMessage error={error} />
  </div>;
}

Join.propTypes = {
  classes: PropTypes.object.isRequired,
};
  
export default withStyles(styles)(Join);
