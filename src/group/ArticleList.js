import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import ArticleItem from './ArticleItem';

const styles = theme => ({
});

class ArticleList extends React.Component {
  state = { list:[] }
  componentDidMount() {
    const { db, group } = this.props;
    this.detacher = db.collection(`groups/${group.groupId}/articles`).orderBy("created", "desc").onSnapshot((snapshot) => {
      //console.log("onSnapshot")
      const list = [];
      snapshot.forEach((doc)=>{
        const article = doc.data();
        article.articleId = doc.id;
        list.push(article);
      });
      this.setState({list});
    })
  }
  componentWillUnmount() {
    this.detacher();
  }
  render() {
    const { group, history } = this.props;
    return <div>
      <div>
        {
          this.state.list.map((article)=>{
            return <ArticleItem key={article.articleId} article={article} group={group} history={history} />
          })
        }
      </div>
    </div>
  }
}

ArticleList.propTypes = {
  classes: PropTypes.object.isRequired,
};
  
export default withStyles(styles)(ArticleList);