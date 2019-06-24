import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import ArticleList from './ArticleList';
import * as firebase from "firebase/app";
import "firebase/firestore";
import CreateNew from '../common/CreateNew';
import Privileges from '../const/Privileges';
import { FormattedMessage } from 'react-intl';
import { Grid } from '@material-ui/core';
import { Redirect } from 'react-router-dom';

const styles = theme => ({
});

class Articles extends React.Component {
  state = {};
  componentDidMount() {
    const { selectTab } = this.props;
    selectTab("articles");
  }
  createArticle = async (title) => {
    const { db, group, user } = this.props;
    const doc = await db.collection(`groups/${group.groupId}/articles`).add({
      title,
      created: firebase.firestore.FieldValue.serverTimestamp(),
      owner: user.uid,
      read: group.privileges.article.read || Privileges.member, 
      comment: group.privileges.article.comment || Privileges.member, 
      sections: [], // ordered list of sectionIds
    });
    this.setState({redirect:`/${group.groupName}/bl/${doc.id}`});
  }
  render() {
      const { user, db, member, group, history } = this.props;
      const { redirect } = this.state;
      if (redirect) {
        return <Redirect to={redirect} />
      }
      const context = { user, group, db, member, history };
      const canCreateNew = !!member && member.privilege 
            >= ((group.privileges && group.privileges.article && group.privileges.article.create) || Privileges.member);
      return (
        <Grid container justify="center" spacing={1}>
          <Grid item xs={12} style={{textAlign:"center"}}>
            { canCreateNew && <CreateNew createNew={ this.createArticle } 
                action={<FormattedMessage id="create" />} label={<FormattedMessage id="article" />}/> }
          </Grid>
          <Grid item xs={12}>
            <ArticleList {...context}/>
          </Grid>
        </Grid>
        )
    }
}

Articles.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  
export default withStyles(styles)(Articles);