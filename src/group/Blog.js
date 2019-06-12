import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';
//import { FormattedMessage } from 'react-intl';
import BlogSection from './BlogSection';

const styles = theme => ({
});

class Article extends React.Component {
  state = {article:null, sections:[]}
  async componentDidMount() {
    const { db, group, match:{params:{articleId}} } = this.props;
    console.log(articleId);
    const ref = db.doc(`groups/${group.groupId}/articles/${articleId}`);
    const article = (await ref.get()).data();
    this.setState({article});
  }
  render() {
    const { article } = this.state;
    if (!article) {
      return "";
    }
    return (
      <div>
        <Typography component="h2" variant="h5" gutterBottom>
          {article.title}
        </Typography>
        <BlogSection />
      </div>
    )
  }
}

Article.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  
export default withStyles(styles)(Article);