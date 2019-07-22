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
  const { privilege, profiles } = props;
  const pathArticle = `groups/${group.groupId}/${arp.collection}/${articleId}`;
  const pathHistory = `groups/${group.groupId}/members/${user.uid}/private/history`;
  const [ article, err ] = useDocument(db, pathArticle);
  const setTabbar = callbacks.setTabbar;

  useEffect(()=>{
    setTabbar(arp.tabLeaf, `${arp.leaf}/${articleId}`);
  }, [setTabbar, arp, articleId]);

  useEffect(()=>{
    if (user) {
      const articles = {};
      articles[articleId] = { l:new Date() }; // NOT firebase.firestore.FieldValue.serverTimestamp()
      db.doc(pathHistory).set({
        articles
      }, {merge:true})
    }
  },[db, articleId, pathHistory, user]);

  if (err) {
    return <AccessDenied error={err} />
  }
  
  if (!article) {
    return "";
  }
  article.articleId = articleId;
  const context = { user, article, arp, group, privilege, db, profiles, callbacks };
  return <BlogArticle {...context} pathArticle={pathArticle}/>;
}

Blog.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  
export default withStyles(styles)(Blog);