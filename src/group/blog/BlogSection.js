import React from 'react';
import PropTypes from 'prop-types';
import ImageUploader from '../../common/ImageUploader';
import VideoEditor from '../../common/VideoEditor';
import BlogSectionMarkdown from './BlogSectionMarkdown';

function BlogSection(props) {
  const { sectionId, index, resource, readOnly, pathArticle } = props;
  const { editing, updateEditingFlag } = props;
  const { saveMarkdown } = props;
  
  function onDelete() {
    props.deleteSection(sectionId, index);
  }
  function setEditing(flag) {
    updateEditingFlag(sectionId, flag);
  }
  function onImageUpload(imageUrl) {
    props.onImageUploadSection(sectionId, imageUrl);
  }
  function onVideoUpload(videoUrl) {
    props.onVideoUploadSection(sectionId, videoUrl);
  }

  if (resource.type==="image") {
    if (readOnly && !resource.hasImage) {
      return "";
    }
    const imagePath = `${pathArticle}/${sectionId}`;
    const thumbnails = (resource[sectionId] && resource[sectionId].thumbnails) || resource.thumbnails;
    return (
      <ImageUploader imagePath={imagePath} loadImage={resource.hasImage} imageUrl={resource.imageUrl}
                     imageThumbnails={thumbnails} onImageUpload={onImageUpload}
                     readOnly={readOnly} onDelete={onDelete} displayMode="wide" />
    );
  }
  if (resource.type==="video") {
    return (
      <VideoEditor videoUrl={resource.videoUrl} displayMode="wide" onVideoUpload={onVideoUpload}
                   readOnly={readOnly} onDelete={onDelete} sectionId={sectionId}
                   editing={editing} setEditing={setEditing} />
    );
  }
  if (resource.type==="markdown") {
    return <BlogSectionMarkdown sectionId={sectionId} index={index} resource={resource} readOnly={readOnly}
                                editing={editing} onDelete={onDelete} setEditing={setEditing}
                                saveMarkdown={saveMarkdown} />;
  }
  return <div/>;
}

BlogSection.propTypes = {
  resource: PropTypes.object.isRequired,
  pathArticle: PropTypes.string.isRequired,
};
  
export default BlogSection;
