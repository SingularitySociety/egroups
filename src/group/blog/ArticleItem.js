import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import LockIcon from '@material-ui/icons/Lock';
import { Grid, Paper } from '@material-ui/core';
import SubjectIcon from '@material-ui/icons/Subject';
import MUILink from '@material-ui/core/link';
import { Link } from 'react-router-dom';
import Privileges from '../../const/Privileges';

const styles = theme => ({
  item: {
    marginBottom: theme.spacing(1),
    paddingTop: theme.spacing(1),
    paddingLeft: theme.spacing(1),
  },
  read: {
    color: "#000000",
  },
  unread: {
    color: "#000000",
    fontWeight: "bold",
  },
});

class ArticleItem extends React.Component {
  render() {
    const { classes, article, group, history, arp } = this.props;
    //console.log(article);
    let className = classes.unread;
    if (!article.updated || !history) {
      console.log("case 1");
      className = classes.read;
    } else if (history.articles) {
      console.log("case 2");
      const access = history.articles[article.articleId];
      if (access && access.l > article.updated) {
        className = classes.read;
      }
    }
    return (
      <Paper className={classes.item}>
        <MUILink component={Link} 
          to={`/${group.groupName}/${arp.leaf}/${article.articleId}`}>
          <Grid container >
            <Grid item><SubjectIcon /></Grid>
            <Grid item xs={7} className={className}>
              { article.title }
            </Grid>
            <Grid item xs={1}>
              { article.read !== Privileges.guest  && <LockIcon fontSize="small" color="disabled"/> }
            </Grid>
            <Grid item xs={4}>
            </Grid>
          </Grid>
        </MUILink>
      </Paper>
    )
  }
}

ArticleItem.propTypes = {
    classes: PropTypes.object.isRequired,
    arp: PropTypes.object.isRequired,
  };
  
export default withStyles(styles)(ArticleItem);