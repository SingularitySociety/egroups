import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import MUILink from '@material-ui/core/link';
import { Grid, Typography } from '@material-ui/core';
import { Link } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import ImageUploader from '../../common/ImageUploader';
import { privilegeText } from '../../common/utils';

const styles = theme => ({
  member: {
    marginBottom: theme.spacing(1),
    color: "#333",
  },
  name: {
    marginLeft: theme.spacing(1),
    paddingTop: "1.5em",
  },
  privilege: {
    paddingTop: "1.5em",
    marginLeft: "auto",
    marginBottom: theme.spacing(1),
    marginRight: theme.spacing(1),
  }
});

const useStyles = makeStyles(styles);

function MemberItem(props) {
  const classes = useStyles();
  const { group, item, user } = props;
  const imagePath = `groups/${group.groupId}/members/${item.userId}/images/profile`; 
  const isMe = user && (item.userId === user.uid);
  const thumbnails = item.profile && item.profile.thumbnails;
  const url = isMe ? `/g/${group.groupName}/account` : `/g/${group.groupName}/pr/${item.userId}`;
  return (
    <MUILink component={Link} to={url} className={classes.member}>
      <Grid container>
          <ImageUploader imagePath={imagePath} loadImage={item.hasImage} imageThumbnails={thumbnails}
              readOnly={true} displayMode={"thumbMiddle"} inline={true} />
          <Grid item className={classes.name}>
            <Typography color={ isMe ? "primary" : "inherit"}>{item.displayName}</Typography>
          </Grid>
        <Grid item className={classes.privilege}>
          <Typography color={"secondary"}><FormattedMessage id={privilegeText(item.privilege)} /></Typography>
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
