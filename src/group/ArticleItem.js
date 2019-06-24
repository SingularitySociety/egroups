import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import LockIcon from '@material-ui/icons/Lock';
import { Grid, Paper } from '@material-ui/core';
import MUILink from '@material-ui/core/link';
import { Link } from 'react-router-dom';
import Privileges from '../const/Privileges';

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
    const { classes, article, group, history } = this.props;
    //console.log(article);
    let className = classes.unread;
    if (!article.updated || !history) {
      className = classes.read;
    } else if (history.articles) {
      const access = history.articles[article.articleId];
      if (access && access.l > article.updated) {
        className = classes.read;
      }
    }
    return (
      <Paper className={classes.item}>
        <MUILink component={Link} className={className}
          to={`/${group.groupName}/bl/${article.articleId}`}>
          <Grid container >
            <Grid item xs={7} className={classes.title}>
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
  };
  
export default withStyles(styles)(ArticleItem);