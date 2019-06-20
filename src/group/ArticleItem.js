import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Grid } from '@material-ui/core';
import MUILink from '@material-ui/core/link';
import { Link } from 'react-router-dom';


const styles = theme => ({
  read: {
    color: "#000000",
  },
  unread: {
    color: "#000000",
    fontWeight: "bold",
  }
});

class ArticleItem extends React.Component {
  render() {
    const { classes, article, group, history } = this.props;
    console.log(article);
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
      <Grid container >
        <Grid item>
          <MUILink component={Link} className={className}
            to={`/${group.groupName}/bl/${article.articleId}`}>
          { article.title }
          </MUILink>
        </Grid>
      </Grid>
    )
  }
}

ArticleItem.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  
export default withStyles(styles)(ArticleItem);