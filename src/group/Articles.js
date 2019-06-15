import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';
import { FormattedMessage } from 'react-intl';
import ArticleList from './ArticleList';

const styles = theme => ({
});

class Articles extends React.Component {
  componentDidMount() {
    const { selectTab } = this.props;
    selectTab("blog");
  }
  render() {
      const { user, db, member, group, history } = this.props;
      const context = { user, group, db, member, history };
      return (
        <div>
          <Typography component="h2" variant="h5" gutterBottom>
            <FormattedMessage id="blog" />
          </Typography>
          <ArticleList {...context}/>
        </div>
        )
    }
}

Articles.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  
export default withStyles(styles)(Articles);