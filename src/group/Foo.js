import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Grid } from '@material-ui/core';
import { Link } from 'react-router-dom';


const styles = theme => ({
  read: {
    color: "#000000",
    textDecoration: "none",
  },
  unread: {
    color: "#000000",
    fontWeight: "bold",
    textDecoration: "none",
  }
});

class Article extends React.Component {
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
        <Grid item component={Link} to={`/${group.groupName}/bl/${article.articleId}`} className={className}># { article.title }</Grid>
      </Grid>
    )
  }
}

Article.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  
export default withStyles(styles)(Article);