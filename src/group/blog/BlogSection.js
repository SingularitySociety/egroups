import React from 'react';
import PropTypes from 'prop-types';
import ImageUploader from '../../common/ImageUploader';
import VideoEditor from '../../common/VideoEditor';
import BlogSectionMarkdown from './BlogSectionMarkdown';

function BlogSection(props) {
  const { sectionId, index, resource, readOnly, pathArticle } = props;
  const { editing, updateEditingFlag } = props;

  function onDelete() {
    props.deleteSection(sectionId, index);
  }
  function setEditing(flag) {
    updateEditingFlag(sectionId, flag);
  }
  function onImageUpload(imageUrl) {
    props.onImageUpload(sectionId, imageUrl);
  }
  function onVideoUpload(videoUrl) {
    props.onVideoUpload(sectionId, videoUrl);
  }

  const params = {onDelete, setEditing, displayMode: "wide"};
  if (resource.type==="image") {
    if (readOnly && !resource.hasImage) {
      return "";
    }
    const imagePath = `${pathArticle}/${sectionId}`;
    const thumbnails = (resource[sectionId] && resource[sectionId].thumbnails) || resource.thumbnails;
    return (
      <ImageUploader imagePath={imagePath} loadImage={resource.hasImage} imageUrl={resource.imageUrl}
                     imageThumbnails={thumbnails} onImageUpload={onImageUpload} {...params} />
    );
  }
  if (resource.type==="video") {
    return (
      <VideoEditor videoUrl={resource.videoUrl} onVideoUpload={onVideoUpload} {...props} {...params} />
    );
  }
  if (resource.type==="markdown") {
    return <BlogSectionMarkdown {...props} {...params}/>;
  }
  return <div/>;
}

BlogSection.propTypes = {
  resource: PropTypes.object.isRequired,
  pathArticle: PropTypes.string.isRequired,
};
  
export default BlogSection;
