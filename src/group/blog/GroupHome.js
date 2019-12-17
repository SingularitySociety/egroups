import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Privileges from '../../const/Privileges';
import * as firebase from "firebase/app";
import "firebase/firestore";
import BlogArticle from './BlogArticle';
import { injectIntl, FormattedMessage } from 'react-intl';
import ArticleList from './ArticleList';
import { Typography } from '@material-ui/core';
import useDocument from '../../common/useDocument';

const styles = theme => ({
  welcome: {
    marginTop: theme.spacing(0),
  }
});

function GroupHome(props) {
  const { group, db, user, callbacks, intl:{messages} } = props;
  const { arp, privilege, profiles, history } = props;
  const setTabbar = callbacks.setTabbar;
  const pathArticle = group.homepageId && `groups/${group.groupId}/pages/${group.homepageId}`;
  const [ article ] = useDocument(db, pathArticle);
  const groupDidUpdate = callbacks.groupDidUpdate;

  useEffect(()=>{
    setTabbar("home");
  }, [setTabbar]);

  if (article) {
    article.articleId = group.homepageId;
  }

  useEffect(() => {
    if (privilege === Privileges.owner) {
      // This code is not atomic but it is fine because there is only one owner
      if (!group.homepageId) {
        async function createHomePage() {
          console.log("homepage: creating");
          const doc = await db.collection(`groups/${group.groupId}/pages`).add({
            title: messages["title.welcome"], 
            created: firebase.firestore.FieldValue.serverTimestamp(),
            type: "page",
            owner: user.uid,
            read: Privileges.guest, 
            comment: Privileges.admin, 
            sections: [], // ordered list of sectionIds
          });
          console.log("homepage: created");
          await db.doc(`groups/${group.groupId}`).set({
            homepageId: doc.id,
          }, {merge:true});
          groupDidUpdate();
        }
        createHomePage();
      }
    }
  }, [db, group, privilege, user, messages, groupDidUpdate]);

  const context = { group, user, db, article, arp, callbacks, privilege, profiles, history }
  //const context = { user, group, db, member, history };
  return (
    <div>
      { article && <BlogArticle {...context} pathArticle={pathArticle} />}
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
