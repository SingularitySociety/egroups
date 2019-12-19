import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import ArticleList from './ArticleList';
import * as firebase from "firebase/app";
import "firebase/firestore";
import CreateNew from '../../common/CreateNew';
import Privileges from '../../const/Privileges';
import { FormattedMessage } from 'react-intl';
import { Grid } from '@material-ui/core';
import { Redirect } from 'react-router-dom';

const styles = theme => ({
});

function Articles(props) {
  const { db, group, user, callbacks, arp, privilege, history } = props;
  const setTabbar = callbacks.setTabbar;
  const [redirect, setRedirect] = useState(null);

  useEffect(()=>{
    setTabbar(arp.tabRoot);
  }, [setTabbar, arp]);

  const createArticle = async (title) => {
    console.log(arp);
    const doc = await db.collection(`groups/${group.groupId}/${arp.collection}`).add({
      title,
      created: firebase.firestore.FieldValue.serverTimestamp(),
      owner: user.uid,
      read: group.privileges[arp.tabLeaf].read, 
      comment: group.privileges[arp.tabLeaf].comment, 
      sections: [], // ordered list of sectionIds
    });
    setRedirect(`/g/${group.groupName}/${arp.leaf}/${doc.id}`);
  };

  if (redirect) {
    return <Redirect to={redirect} />;
  }
  const context = { user, group, db, history, arp };
  const canCreateNew = privilege 
        >= ((group.privileges && group.privileges[arp.tabLeaf] && group.privileges[arp.tabLeaf].create) || Privileges.member);
  return (
    <Grid container justify="center" spacing={1}>
      <Grid item xs={12} style={{textAlign:"center"}}>
        { canCreateNew && <CreateNew createNew={ createArticle } 
            action={<FormattedMessage id="create" />} label={<FormattedMessage id={arp.tabLeaf} />}/> }
      </Grid>
      <Grid item xs={12}>
        <ArticleList {...context} />
      </Grid>
    </Grid>
  );
}

Articles.propTypes = {
    classes: PropTypes.object.isRequired,
    arp: PropTypes.object.isRequired,
  };
  
export default withStyles(styles)(Articles);
