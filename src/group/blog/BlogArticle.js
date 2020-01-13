import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Typography, Grid, IconButton, Checkbox } from '@material-ui/core';
import SettingsIcon from '@material-ui/icons/Settings';
import EditIcon from '@material-ui/icons/Edit';
import SaveIcon from '@material-ui/icons/SaveAlt';
import AccessDenied from '../../common/AccessDenied';
import BlogSection from './BlogSection';
import BlogSectionCreator from './BlogSectionCreator';
import { Link } from 'react-router-dom';
import ImageUploader from '../../common/ImageUploader';
import Privileges from '../../const/Privileges';
import { FormattedDate } from 'react-intl';
import { canEditArticle, isPublished } from '../../common/utils';

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
  const [ editingFlags, setEditingFlags ] = useState({});
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
  const updateEditingFlag = (sectionId, mode) => {
    const editingFlagsClone = {...editingFlags};
    editingFlagsClone[sectionId] = mode;
    setEditingFlags(editingFlagsClone);
  };
  const insertMarkdown = async (index) => {
    const doc = await refArticle.collection("sections").add({
      type: "markdown",
      markdown: "",
      created: new Date(),
      author: user.uid,
    });
    updateEditingFlag(doc.id, true);
    spliceSections(index, 0, doc.id);
  };
  const saveMarkdown = async (sectionId, index, markdown, raw) => {
    await refArticle.collection("sections").doc(sectionId).set({
      markdown, 
      raw
    }, {merge:true});
    
    const newArticle = Object.assign({}, article);
    newArticle.updated = new Date();
    setArticle(newArticle);
    await refArticle.set(newArticle, {merge:true});

  };
  const deleteSection = async (sectionId, index) => {
    console.log("deleteSection", sectionId);
    await spliceSections(index, 1);
    await refArticle.collection("sections").doc(sectionId).delete();
  };
  const insertImage = async (index) => {
    console.log("insertImage", index);
    const doc = await refArticle.collection("sections").add({
      type: "image",
      created: new Date(),
      author: user.uid,
      imageSize: 6,
    });
    updateEditingFlag(doc.id, true);
    spliceSections(index, 0, doc.id);
  };
  const onImageUploadSection = async (sectionId, imageUrl) => {
    //console.log("onImageUpload", sectionId, imageUrl);
    await refArticle.collection("sections").doc(sectionId).set({
      hasImage: true, imageUrl
    }, {merge:true});
  };
  const onImageSizeChange = async (sectionId, size) => {
    //console.log("onImageUpload", sectionId, imageUrl);
    await refArticle.collection("sections").doc(sectionId).set({
      imageSize: size
    }, {merge:true});
  };
  const insertVideo = async (index) => {
    console.log("insertVideo", index);
    const doc = await refArticle.collection("sections").add({
      type: "video",
      created: new Date(),
      author: user.uid,
    });
    updateEditingFlag(doc.id, true);
    spliceSections(index, 0, doc.id);
  };
  const onVideoUploadSection = async (sectionId, videoUrl) => {
    // console.log("onVideoUploadSection", sectionId, videoUrl);
    await refArticle.collection("sections").doc(sectionId).set({
      hasVideo: true, videoUrl
    }, {merge:true});
  };
  const insertUrl = async (index) => {
    console.log("insertUrl", index);
    const doc = await refArticle.collection("sections").add({
      type: "url",
      created: new Date(),
      author: user.uid,
    });
    updateEditingFlag(doc.id, true);
    spliceSections(index, 0, doc.id);
  };
  const onUpdateUrlSection = async (sectionId, url) => {
    await refArticle.collection("sections").doc(sectionId).set({
      hasUrl: true, url,
      isNew: true,
      hasData: false,
    }, {merge:true});
  };
  const toggleReadOnly = () => {
    setReadOnly(!readOnly);
  };
  const updatePublished = async (e) => {
    if (!readOnly) {
      await refArticle.set({published: !!e.target.checked}, {merge:true});
      const newArticle = Object.assign({}, article);
      newArticle.published = e.target.checked;
      setArticle(newArticle);
    }
  };
  const context = { pathArticle:refArticle.path };
  if (!article) {
    return "";
  }
  const canEdit = canEditArticle(user, article, privilege, group);
  const canRead = privilege >= article.read;
  if (!canRead || error) {
    return <AccessDenied />;
  }
  if (!resources) {
    return "";
  }

  const frameClass = canEdit ? classes.editorFrame : classes.readerFrame;
  const editMode = canEdit && !readOnly;
  const userName = (her && her.displayName) || "...";
  const thumbnails = her && her.profile && her.profile.thumbnails;
  const published = isPublished(article);
  
  return (
    <div className={frameClass}>
      <Grid container>
        <Grid item xs={canEdit ? 9 : 12}>
            <Typography component="h1" variant="h1" gutterBottom className={classes.title}>
            {article.title}
          </Typography>
        </Grid>
        {
          canEdit && 
            <Grid item xs={3}>
              <IconButton size="small" onClick={toggleReadOnly}>
                {readOnly ? <EditIcon /> : <SaveIcon/> }
              </IconButton>
              <IconButton size="small" component={Link} to={`/g/${group.groupName}/${arp.leaf}/${article.articleId}/settings`}>
                <SettingsIcon />
              </IconButton>
              <Checkbox checked={published} onChange={(e) => {updatePublished(e);}}/>
              Published
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
        <BlogSectionCreator index={ 0 } {...context}
                            insertImage={insertImage} insertMarkdown={insertMarkdown}
                            insertVideo={insertVideo} insertUrl={insertUrl} />
      }
      {
        article.sections.map((sectionId, index)=>{
          if (resources[sectionId]) {
            const editing = (editingFlags||{})[sectionId];
            return <div key={sectionId}>
                     <BlogSection {...props}
                                  index={index} sectionId={sectionId} deleteSection={deleteSection}
                                  editing={editing} updateEditingFlag={updateEditingFlag}
                                  resource={resources[sectionId]} readOnly={!editMode} saveMarkdown={saveMarkdown}
                                  onImageUploadSection={onImageUploadSection} onVideoUploadSection={onVideoUploadSection}
                                  onImageSizeChange={onImageSizeChange}
                                  onUpdateUrlSection={onUpdateUrlSection}
                                  {...context} />
                     { editMode && <BlogSectionCreator
                                     index={ index+1 } {...context}
                                     insertImage={insertImage} insertMarkdown={insertMarkdown}
                                     insertVideo={insertVideo} insertUrl={insertUrl}
                                   /> }
            </div>;
          } else {
            return <div key={sectionId}/>;
          }
        })
      }
    </div>
  );
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
