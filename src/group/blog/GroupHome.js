import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import MountDetector from '../../common/MountDetector';
import Privileges from '../../const/Privileges';
import * as firebase from "firebase/app";
import "firebase/firestore";
import BlogArticle from './BlogArticle';
import { injectIntl, FormattedMessage } from 'react-intl';
import ArticleList from './ArticleList';
import { Typography } from '@material-ui/core';

const styles = theme => ({
  welcome: {
    marginTop: theme.spacing(0),
  }
});

function GroupHome(props) {
  const { group, db, user, callbacks, intl:{messages} } = props;
  const { arp, privilege, profiles, history } = props;
  const setTabbar = callbacks.setTabbar;
  const [ article, setArticle ] = useState(null);
  const [ canEdit, setCanEdit ] = useState(false);
  const refArticle = db.doc(`groups/${group.groupId}/pages/${group.homepageId}`);

  useEffect(()=>{
    setTabbar("home");
  }, [setTabbar]);

  const loadArticle = async () => {
    if (group.homepageId) {
      const article = (await refArticle.get()).data();
      article.articleId = group.homepageId;
      setArticle(article);
    }
  }

  const privilegeDidMount = async (privilege) => {
    console.log({privilegeDidMount:privilege});
    if (privilege >= Privileges.admin) {
      setCanEdit(true);
      console.log("isAdmin", group.homepageId);

      // This code is not atomic but it is fine because there is only one owner
      if (!group.homepageId) {
        const doc = await db.collection(`groups/${group.groupId}/pages`).add({
          title: messages["title.welcome"], // BUGBUG: Localize it
          created: firebase.firestore.FieldValue.serverTimestamp(),
          type: "page",
          owner: user.uid,
          read: Privileges.guest, 
          comment: Privileges.admin, 
          sections: [], // ordered list of sectionIds
        });
        await db.doc(`groups/${group.groupId}`).set({
          homepageId: doc.id,
        }, {merge:true});
        group.homepageId = doc.id;
        callbacks.groupDidUpdate();
      }
      loadArticle();
    }
  }

  const privilegeWillUnmount = () => {
  }

  const context = { group, user, db, article, arp, callbacks, privilege, profiles, history }
  //const context = { user, group, db, member, history };
  return (
    <div>
      { privilege > 0 && <MountDetector didMount={privilegeDidMount} willUnmount={privilegeWillUnmount} value={privilege} />}
      { article && <BlogArticle {...context} refArticle={refArticle} />}
      <Typography component="h3" variant="h3">
        <FormattedMessage id="pages" />
      </Typography>
      <ArticleList {...context}/>
    </div>
  )
}

GroupHome.propTypes = {
  classes: PropTypes.object.isRequired,
};
  
export default withStyles(styles)(injectIntl(GroupHome));