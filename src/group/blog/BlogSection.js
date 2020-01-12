import React, {useState, useEffect} from 'react';
import PropTypes from 'prop-types';
import ImageUploader from '../../common/ImageUploader';
import VideoEditor from '../../common/VideoEditor';
import OGPViewer  from '../../common/OGPViewer';
import BlogSectionMarkdown from './BlogSectionMarkdown';

function BlogSection(props) {
  const { sectionId, index, resource, readOnly, pathArticle } = props;
  const { editing, updateEditingFlag } = props;
  const { saveMarkdown } = props;

  const [imageSize, setImageSize] = useState(resource.imageSize || 6);

  function onDelete() {
    props.deleteSection(sectionId, index);
  }
  function setEditing(flag) {
    updateEditingFlag(sectionId, flag);
  }
  function onImageUpload(imageUrl) {
    props.onImageUploadSection(sectionId, imageUrl);
  }
  function onImageSizeChange(size) {
    props.onImageSizeChange(sectionId, size);
  }
  function onVideoUpload(videoUrl) {
    props.onVideoUploadSection(sectionId, videoUrl);
  }
  function onUpdateUrlSection(url) {
    props.onUpdateUrlSection(sectionId, url);
  }
  
  if (resource.type==="image") {
    if (readOnly && !resource.hasImage) {
      return "";
    }
    const imagePath = `${pathArticle}/${sectionId}`;
    const thumbnails = (resource[sectionId] && resource[sectionId].thumbnails) || resource.thumbnails;
    return (
      <ImageUploader imagePath={imagePath} loadImage={resource.hasImage} imageUrl={resource.imageUrl}
                     imageSize={imageSize} setImageSize={setImageSize}
                     imageThumbnails={thumbnails} onImageUpload={onImageUpload}
                     onImageSizeChange={onImageSizeChange}
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
  if (resource.type==="url") {
    return <OGPViewer url={resource.url} resource={resource}
             readOnly={readOnly} onDelete={onDelete} sectionId={sectionId} onUpdateUrlSection={onUpdateUrlSection}
             editing={editing} setEditing={setEditing} />;
  }
  return <div/>;
}

BlogSection.propTypes = {
  resource: PropTypes.object.isRequired,
  pathArticle: PropTypes.string.isRequired,
};
  
export default BlogSection;
