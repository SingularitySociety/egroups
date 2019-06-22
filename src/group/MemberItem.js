import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import MUILink from '@material-ui/core/link';
import { Link } from 'react-router-dom';
import ImageUploader from '../common/ImageUploader';


const styles = theme => ({
  member: {
    color: "#333",
  }
});

class MemberItem extends React.Component {
  render() {
    const { group, item, classes } = this.props;
    const imagePath = `groups/${group.groupId}/members/${item.uid}/images/profile`;
    return (
      <MUILink component={Link} to={`/${group.groupName}/pr/${item.uid}`} className={classes.member}>
        <ImageUploader imagePath={imagePath} loadImage={item.hasImage} 
                readOnly={true} displayMode={null} onImageUpload={this.onImageUpload} />
        {item.displayName}
      </MUILink>
    )
  }
}

MemberItem.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  
export default withStyles(styles)(MemberItem);