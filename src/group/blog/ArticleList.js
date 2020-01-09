import React, {useState, useEffect} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import ArticleItem from './ArticleItem';
import AccessDenied from '../../common/AccessDenied';
import { isPublished } from '../../common/utils';

const styles = theme => ({
});

function ArticleList(props) {
  const { db, group, limit, arp, history } = props;
  const groupId = group.groupId;
  const [list, setList] = useState([]);
  const [error, setError] = useState(null);

  useEffect(()=>{
    let query = db.collection(`groups/${groupId}/${arp.collection}`).orderBy("created", "desc");
    if (limit) {
      query = query.limit(limit);
    }
    const detacher = query.onSnapshot((snapshot) => {
      const list = [];
      snapshot.forEach((doc)=>{
        const article = doc.data();
        article.articleId = doc.id;
        list.push(article);
      });
      setList(list);
    }, (e) => {
      setError(e);
    });
    return detacher;
  }, [db, groupId, arp, limit]);

  const context = { group, history, arp };
  if (error) {
    return <AccessDenied error={error} />;
  }
  const canEdit = false;
  return <div>
           <div>
             {
               list.filter((article) => {
                 return true;
                 // return isPublished(article) || canEdit;
               }).map((article)=>{
                 return <ArticleItem key={article.articleId} article={article} {...context} />;
               })
             }
           </div>
         </div>;
}

ArticleList.propTypes = {
  classes: PropTypes.object.isRequired,
  arp: PropTypes.object.isRequired,
};
  
export default withStyles(styles)(ArticleList);
