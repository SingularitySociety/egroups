import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import MUILink from '@material-ui/core/link';
import { Grid, Typography } from '@material-ui/core';
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
    const { group, item, classes, user } = this.props;
    const imagePath = `groups/${group.groupId}/members/${item.uid}/images/profile`; // BUGBUG: use thumbnails
    const isMe = item.uid === user.uid;
    const thumbnails = item.profile && item.profile.thumbnails;
    return (
      <MUILink component={Link} to={`/${group.groupName}/pr/${item.uid}`} className={classes.member}>
        <Grid container>
            <ImageUploader imagePath={imagePath} loadImage={item.hasImage} imageThumbnails={thumbnails}
                readOnly={true} displayMode={"thumbMiddle"} inline={true} />
            <Grid item className={classes.name}>
              <Typography color={ isMe ? "primary" : "inherit"}>{item.displayName}</Typography>
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