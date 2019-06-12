import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import * as firebase from "firebase/app";
import "firebase/firestore";
import CreateNew from '../common/CreateNew';
import Article from './Article';
import { FormattedMessage } from 'react-intl';
import Privileges from '../const/Privileges';

const styles = theme => ({
});

class ArticleList extends React.Component {
  state = { list:[] }
  componentDidMount() {
    const { db, group } = this.props;
    this.detacher = db.collection(`groups/${group.groupId}/articles`).orderBy("created", "desc").onSnapshot((snapshot) => {
      console.log("onSnapshot")
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
  createArticle = async (title) => {
    console.log("createArticle:", title)
    const { db, group, user } = this.props;
    db.collection(`groups/${group.groupId}/articles`).add({
      title,
      created: firebase.firestore.FieldValue.serverTimestamp(),
      owner: user.uid,
      read: group.privileges.article.read || Privileges.member, 
      write: group.privileges.article.write || Privileges.member, 
    });
  }
  render() {
    const { member, group, history } = this.props;
    const canCreateNew = !!member && member.privilege 
            >= ((group.privileges && group.privileges.article && group.privileges.article.create) || 2);
    return <div>
      { canCreateNew && <CreateNew createNew={ this.createArticle } 
          action={<FormattedMessage id="create" />} label={<FormattedMessage id="article.name" />}/> }
      <div>
        {
          this.state.list.map((article)=>{
            return <Article key={article.articleId} article={article} group={group} history={history} />
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