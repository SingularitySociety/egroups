import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import MUILink from '@material-ui/core/link';
import { Grid } from '@material-ui/core';
import { Link } from 'react-router-dom';
import ImageUploader from '../common/ImageUploader';


const styles = theme => ({
  member: {
    marginBottom: theme.spacing(1),
    color: "#333",
  },
  name: {
    marginLeft: theme.spacing(1),
    paddingTop: "1.5em",
  }
});

class MemberItem extends React.Component {
  render() {
    const { group, item, classes } = this.props;
    const imagePath = `groups/${group.groupId}/members/${item.uid}/images/profile`;
    return (
      <MUILink component={Link} to={`/${group.groupName}/pr/${item.uid}`} className={classes.member}>
        <Grid container>
            <ImageUploader imagePath={imagePath} loadImage={item.hasImage} 
                readOnly={true} displayMode={"thumbMiddle"} inline={true} onImageUpload={this.onImageUpload} />
            <Grid item class={classes.name}>
              {item.displayName}
            </Grid>
        </Grid>
      </MUILink>
    )
  }
}

MemberItem.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  
export default withStyles(styles)(MemberItem);