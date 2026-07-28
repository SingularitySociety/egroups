import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import AccessDenied from '../../common/AccessDenied';
import BlogArticle from './BlogArticle';
import useDocument from '../../common/useDocument';

const styles = theme => ({
});

function Blog(props) {
  const { match:{params:{articleId}}, callbacks, arp, user, db, group } = props;
  const { privilege, profiles, pageInfo } = props;
  const pathArticle = `groups/${group.groupId}/${arp.collection}/${articleId}`;
  const [ article, err ] = useDocument(db, pathArticle);
  const setTabbar = callbacks.setTabbar;

  useEffect(()=>{
    setTabbar(arp.tabLeaf, `${arp.leaf}/${articleId}`);
  }, [setTabbar, arp, articleId]);

  useEffect(()=>{
    if (user) {
      const articles = {};
      articles[articleId] = { l:new Date() }; // NOT firebase.firestore.FieldValue.serverTimestamp()
      const pathHistory = `groups/${group.groupId}/members/${user.uid}/private/history`;
      db.doc(pathHistory).set({
        articles
      }, {merge:true});
    }
  },[db, articleId, user, group]);

  if (err) {
    return <AccessDenied error={err} />;
  }
  
  if (!article) {
    return "";
  }
  article.articleId = articleId;
  const context = { user, article, arp, group, privilege, db, profiles, callbacks, pageInfo };
  return <BlogArticle {...context} pathArticle={pathArticle}/>;
}

Blog.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  
export default withStyles(styles)(Blog);
