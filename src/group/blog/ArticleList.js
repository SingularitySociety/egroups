import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import ArticleItem from './ArticleItem';
import AccessDenied from '../../common/AccessDenied';

const styles = theme => ({
});

class ArticleList extends React.Component {
  state = { list:[] }
  componentDidMount() {
    const { db, group, limit, arp } = this.props;
    let query = db.collection(`groups/${group.groupId}/${arp.collection}`).orderBy("created", "desc");
    if (limit) {
      query = query.limit(limit);
    }
    this.detacher = query.onSnapshot((snapshot) => {
      const list = [];
      snapshot.forEach((doc)=>{
        const article = doc.data();
        article.articleId = doc.id;
        list.push(article);
      });
      this.setState({list});
    }, (e) => {
      this.setState({error:e});
    })
  }
  componentWillUnmount() {
    this.detacher();
  }
  render() {
    const { error } = this.state;
    const { group, history, arp } = this.props;
    const context = { group, history, arp }
    if (error) {
      return <AccessDenied error={error} />
    }
    return <div>
      <div>
        {
          this.state.list.map((article)=>{
            return <ArticleItem key={article.articleId} article={article} {...context} />
          })
        }
      </div>
    </div>
  }
}

ArticleList.propTypes = {
  classes: PropTypes.object.isRequired,
  arp: PropTypes.object.isRequired,
};
  
export default withStyles(styles)(ArticleList);