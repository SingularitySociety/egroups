import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import ArticleList from './ArticleList';
import * as firebase from "firebase/app";
import "firebase/firestore";
import CreateNew from '../../common/CreateNew';
import Privileges from '../../const/Privileges';
import { FormattedMessage } from 'react-intl';
import { Grid } from '@material-ui/core';
import { Redirect } from 'react-router-dom';

const styles = theme => ({
});

class Articles extends React.Component {
  state = {};
  componentDidMount() {
    const { callbacks, arp } = this.props;
    callbacks.setTabbar(arp.tabRoot);
  }
  createArticle = async (title) => {
    const { db, group, user, arp } = this.props;
    console.log(arp);
    const doc = await db.collection(`groups/${group.groupId}/${arp.collection}`).add({
      title,
      created: firebase.firestore.FieldValue.serverTimestamp(),
      owner: user.uid,
      read: group.privileges[arp.tabLeaf].read, 
      comment: group.privileges[arp.tabLeaf].comment, 
      sections: [], // ordered list of sectionIds
    });
    this.setState({redirect:`/${group.groupName}/${arp.leaf}/${doc.id}`});
  }
  render() {
      const { user, db, group, history, arp, callbacks } = this.props;
      const { redirect } = this.state;
      if (redirect) {
        return <Redirect to={redirect} />
      }
      const context = { user, group, db, history, arp };
      const canCreateNew = callbacks.memberPrivilege() 
            >= ((group.privileges && group.privileges[arp.tabLeaf] && group.privileges[arp.tabLeaf].create) || Privileges.member);
      return (
        <Grid container justify="center" spacing={1}>
          <Grid item xs={12} style={{textAlign:"center"}}>
            { canCreateNew && <CreateNew createNew={ this.createArticle } 
                action={<FormattedMessage id="create" />} label={<FormattedMessage id={arp.tabLeaf} />}/> }
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
    arp: PropTypes.object.isRequired,
  };
  
export default withStyles(styles)(Articles);