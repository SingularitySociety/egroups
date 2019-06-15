import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
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
          <ArticleList {...context}/>
        </div>
        )
    }
}

Articles.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  
export default withStyles(styles)(Articles);