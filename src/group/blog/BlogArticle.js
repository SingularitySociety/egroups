import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Typography, Grid, IconButton } from '@material-ui/core';
import SettingsIcon from '@material-ui/icons/Settings';
import EditIcon from '@material-ui/icons/Edit';
import AccessDenied from '../../common/AccessDenied';
import BlogSection from './BlogSection';
import { Link } from 'react-router-dom';
import ImageUploader from '../../common/ImageUploader';
import Privileges from '../../const/Privileges';
import { FormattedDate } from 'react-intl';

import useOnCollection from '../../common/useOnCollection';

const styles = theme => ({
  readerFrame: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
  editorFrame: {

  },
  title: {
    fontWeight: "600",
    marginBottom: theme.spacing(2),
    fontSize: "1.4rem",
    '@media (min-width:480px)': {
      fontSize: '1.8rem',
    },
  },
  userFrame: {
    marginBottom: theme.spacing(2),
  },
  userName: {
    //color: "#606060",
    marginLeft: theme.spacing(1),
  },
});

function BlogArticle(props) {
  const { group, arp, user, pathArticle, privilege, classes, db, profiles, callbacks } = props;
  //state = {article:null, sections:[], resouces:null, readOnly:true};
  const [ article, setArticle ] = useState(props.article);
  const [ resources, setResources ] = useState(null);
  const [ resourceArray, error ] = useOnCollection(db, pathArticle ? pathArticle + "/sections" : null);
  const [ readOnly, setReadOnly ] = useState(true);
  const her = profiles[article.owner];
  const hitProfile = callbacks.hitProfile;
  const refArticle = db.doc(pathArticle);

  useEffect(() => {
    if (db && resourceArray) {
      const newData = resourceArray.reduce((ret, current) => {
        ret[current.id] = current;
        return ret;
      }, {});
      setResources(newData);
    }
  }, [db, resourceArray]);
  
  useEffect(() => {
    if (!her && privilege >= Privileges.member) {
      console.log('hitProfile', article.owner);
      hitProfile(article.owner);
    }    
  }, [her, privilege, hitProfile, article.owner]);

  async function spliceSections(index, size, sectionId) {
    const newArticle = Object.assign({}, article);
    console.log(article, newArticle);
    if (sectionId) {
      newArticle.sections.splice(index, size, sectionId);
    } else {
      newArticle.sections.splice(index, size);
    }
    console.log(newArticle.sections.length);
    newArticle.updated = new Date();
    setArticle(newArticle);
    await refArticle.set(newArticle, {merge:true});
  }
  const insertSection = async (resourceId, index, markdown, raw) => {
    const doc = await refArticle.collection("sections").add({
      type: "markdown",
      markdown,
      raw,
      created: new Date(),
      author: user.uid,
    });
    spliceSections(index, 0, doc.id);
  }
  const updateSection = async (resourceId, index, markdown, raw) => {
    await refArticle.collection("sections").doc(resourceId).set({
      markdown, 
      raw
    }, {merge:true})

    const newArticle = Object.assign({}, article);
    newArticle.updated = new Date();
    setArticle(newArticle);
    await refArticle.set(newArticle, {merge:true});

  }
  const deleteSection = async (resourceId, index) => {
    console.log("deleteSection", resourceId);
    await spliceSections(index, 1);
    await refArticle.collection("sections").doc(resourceId).delete();
  }
  const insertImage = async (index) => {
    console.log("insertImage", index);
    const doc = await refArticle.collection("sections").add({
      type: "image",
      created: new Date(),
      author: user.uid,
    });
    spliceSections(index, 0, doc.id);
  }
  const onImageUpload = async (resourceId, imageUrl) => {
    //console.log("onImageUpload", resourceId, imageUrl);
    await refArticle.collection("sections").doc(resourceId).set({
      hasImage: true, imageUrl
    }, {merge:true})
  }
  const toggleReadOnly = () => {
    setReadOnly(!readOnly);
  }

  const context = { pathArticle:refArticle.path };
  if (!article) {
    return "";
  }
  const canEdit = (user && article.owner === user.uid);
  const canRead = privilege >= article.read;
  if (!canRead) {
    return <AccessDenied />
  }
  if (!resources) {
    return "";
  }

  const frameClass = canEdit ? classes.editorFrame : classes.readerFrame;
  const editMode = canEdit && !readOnly;
  const userName = (her && her.displayName) || "...";
  const thumbnails = her && her.profile && her.profile.thumbnails;

  return (
    <div className={frameClass}>
      <Grid container>
        <Grid item xs={canEdit ? 10 : 12}>
            <Typography component="h1" variant="h1" gutterBottom className={classes.title}>
            {article.title}
          </Typography>
        </Grid>
        {
          canEdit && 
          <Grid item xs={2}>
            <IconButton size="small" onClick={toggleReadOnly}>
              <EditIcon />
            </IconButton>
            <IconButton size="small" component={Link} to={`/g/${group.groupName}/${arp.leaf}/${article.articleId}/settings`}>
              <SettingsIcon />
            </IconButton>
          </Grid>
        }
      </Grid>
      {
        privilege >= Privileges.member &&
        <Grid container className={classes.userFrame}>
          <Grid item>
            <ImageUploader key={ thumbnails ? 1 : 2 } imagePath={""} imageThumbnails={thumbnails}
                  readOnly={true} displayMode="thumbSmall" inline={true} />
          </Grid>
          <Grid item className={classes.userName}>
            <Typography variant="caption" gutterBottom>
              { userName }<br/><FormattedDate value={ article.created.toDate() } />
            </Typography>
          </Grid>
        </Grid>
      }
      { editMode && 
        <BlogSection index={ 0 } resource={{}} saveSection={insertSection} insertImage={insertImage} {...context} /> }
      {
        article.sections.map((sectionId, index)=>{
          if (resources[sectionId]) {
            return <div key={sectionId}>
                     <BlogSection index={ index } sectionId={sectionId} resource={ resources[sectionId] } 
                                  saveSection={updateSection} deleteSection={deleteSection} 
                                  insertImage={insertImage} onImageUpload={onImageUpload} 
                                  readOnly={!editMode} {...context} />
                     { editMode && <BlogSection index={ index+1 } resource={{}}
                                                insertImage={insertImage} saveSection={insertSection} {...context} /> }
            </div>;
          } else {
            return <div/>;
          }
        })
      }
    </div>
  )
}

BlogArticle.propTypes = {
    classes: PropTypes.object.isRequired,
    pathArticle: PropTypes.string.isRequired,
    arp: PropTypes.object.isRequired,
    group: PropTypes.object.isRequired,
    profiles: PropTypes.object.isRequired,
    callbacks: PropTypes.object.isRequired,
  };
  
export default withStyles(styles)(BlogArticle);
