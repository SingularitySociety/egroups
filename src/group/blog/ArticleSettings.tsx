import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import EditableField from '../../common/EditableField';
import DeleteIcon from '@material-ui/icons/Delete';
import { FormGroup, Button, Typography } from '@material-ui/core';
import { FormattedMessage } from 'react-intl';
import { Redirect } from 'react-router-dom';
import LockedArea from '../../common/LockedArea';
import useOnDocument from '../../common/useOnDocument';
import AccessDenied from '../../common/AccessDenied';
import { canEditArticle } from '../../common/utils';

const styles = theme => ({
});

function ArticleSettings(props) {
  const { db, group, arp, user, match:{params:{articleId}}, callbacks, privilege } = props;
  const path = `groups/${group.groupId}/${arp.collection}/${articleId}`;
  const [entity] = useOnDocument(db, path);
  const setTabbar = callbacks.setTabbar;

  useEffect(()=>{
    setTabbar(`${arp.tabLeaf}.settings`, `${arp.leaf}/${articleId}`);
  }, [setTabbar, arp, articleId]);

  const onSave = name => async value => {
    await db.doc(path).set({[name]:value}, {merge:true});
  };
  const onDelete = async () => {
    await db.doc(path).delete();
  };

  if (!entity) {
    if (entity === null) {
      return <Redirect to={`/g/${group.groupName}/${arp.root}`} />;
    }
    return "";
  }
  const canEdit = canEditArticle(user, entity, privilege, group);
  if (!canEdit) {
    return <AccessDenied />;
  }

  const isGroupHomepage = group.homepageId === articleId 
                            && arp.collection === "pages";
  return (
    <div>
      <FormGroup row>
        <EditableField label={<FormattedMessage id="article.title"/>} 
          value={entity.title} onSave={onSave('title')}/>
      </FormGroup>
      {
        isGroupHomepage ?
        <Typography color="textSecondary"><FormattedMessage id="article.is.homepage" /></Typography>
        :
          <LockedArea label={<FormattedMessage id="warning.dangerous" />}>
            <Button variant="contained" onClick={onDelete}>
              <DeleteIcon color="error" />
              <Typography color="error"><FormattedMessage id="destroy.article" /></Typography>
            </Button>
          </LockedArea>
      }
    </div>
  );
}

ArticleSettings.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  
export default withStyles(styles)(ArticleSettings);
