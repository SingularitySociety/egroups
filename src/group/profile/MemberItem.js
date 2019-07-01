import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import MUILink from '@material-ui/core/link';
import { Grid, Typography } from '@material-ui/core';
import { Link } from 'react-router-dom';
import ImageUploader from '../../common/ImageUploader';


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

const useStyles = makeStyles(styles);

function MemberItem(props) {
  const classes = useStyles();
  const { group, item, user } = props;
  const imagePath = `groups/${group.groupId}/members/${item.uid}/images/profile`; 
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

MemberItem.propTypes = {
  group: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  item: PropTypes.object.isRequired,
};
  
export default MemberItem;