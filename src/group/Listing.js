import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';

const styles = theme => ({
});

class Listing extends React.Component {
  state = { list:[] };
  componentDidMount() {
    const { db, group, selectTab } = this.props;
    selectTab("listing");
    this.detacher = db.collection(`groups/${group.groupId}/members`).orderBy("lastAccessed", "desc").onSnapshot((snapshot) => {
      const list = [];
      snapshot.forEach((doc)=>{
        list.push(doc.data());
      });
      this.setState({list});
      console.log(list);
    })
  }
  componentWillUnmount() {
    this.detacher();
  }
  render() {
      return (
          <Typography component="h2" variant="h5" gutterBottom>
            "Under Construction"
          </Typography>
        )
  }
}

Listing.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  
export default withStyles(styles)(Listing);