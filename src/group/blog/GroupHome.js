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

import MUILink from '@material-ui/core/link';
import { Link } from 'react-router-dom';

const styles = theme => ({
  welcome: {
    marginTop: theme.spacing(0),
  },
  footerMenu: {
    position: "fixed",
    bottom: "10px",
    width: "100%",
    left: 0,
    "z-index": 10,
  },
  footerFrame: {
    border: "1px solid #ccc",
    "background-color": "#fff",
    width: "80%",
    margin: "auto",
  },
  footerInner: {
    margin: "10px",
    overflow: "hidden",
  },
  footerButton: {
    width: "50%",
    float: "left",
  },
  footerEnrollment: {
    borderRadius: "10px",
    textAlign: "center",
    fontSize: "2rem",
    color: "#fff",
    backgroundColor: "#2196f3",
    padding: "20px"
  },
  footerPrice: {
    textAlign: "center",
    fontSize: "1.5rem",
  },
});

function GroupHome(props) {
  const { group, db, user, callbacks, intl:{messages} } = props;
  const { arp, privilege, profiles, history, classes } = props;
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

  const context = { group, user, db, article, arp, callbacks, privilege, profiles, history };
  //const context = { user, group, db, member, history };

  // todo 会員じゃない場合に表示 && 金額表示
  const path = `/g/${group.groupName}/` 
        + (group.subscription ? "subscribe" : "join");

  return (
    <React.Fragment>
      <div>
        { article && <BlogArticle {...context} pathArticle={pathArticle} />}
        <Typography component="h3" variant="h3">
          <FormattedMessage id="pages" />
        </Typography>
        <ArticleList {...context}/>
      </div>
      <div className={classes.footerMenu}>
        <div className={classes.footerFrame}>
          <div className={classes.footerInner}>
            <div className={classes.footerButton}>
              <div className={classes.footerPrice}>
                月額1000円<br/>
                （税別)
              </div>
            </div>
            <div className={classes.footerButton}>
              <MUILink component={Link}
                       to={path}
              >
                
                <div className={classes.footerEnrollment}>
                  <FormattedMessage id="join" />
                </div>
              </MUILink>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}

GroupHome.propTypes = {
  classes: PropTypes.object.isRequired,
};
  
export default withStyles(styles)(injectIntl(GroupHome));
