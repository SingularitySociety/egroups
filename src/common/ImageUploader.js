import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Grid, IconButton } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import { ExpandLess, ExpandMore } from '@material-ui/icons';
import UploadButton from '@material-ui/icons/CloudUpload';
import * as firebase from "firebase/app";
import "firebase/storage";
import * as blueimpLoadImage from 'blueimp-load-image';
import CircularProgress from '@material-ui/core/CircularProgress';

const styles = theme => ({
  root: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  wideFrame: {
    //backgroundColor: "lightgray",
  },
  wide: {
    width: "100%",
  },
  thumbLarge: {
    height: "12em",
    width: "12em",
    backgroundPosition: "center",
    backgroundSize: "cover",
    backgroundColor: "lightgray",
    border: "1px lightgray solid",
    borderRadius: "6em",
  },
  thumbMiddle: {
    height: "5em",
    width: "5em",
    backgroundPosition: "center",
    backgroundSize: "cover",
    backgroundColor: "lightgray",
    border: "1px lightgray solid",
    borderRadius: "2.5em",
  },
  thumbMiddleCenter: {
    height: "5em",
    width: "5em",
    backgroundPosition: "center",
    backgroundSize: "cover",
    backgroundColor: "lightgray",
    border: "1px lightgray solid",
    borderRadius: "2.5em",
    marginLeft: "auto",
    marginRight: "auto",
    marginTop: "10px",
    marginBottom: "10px",
  },
  thumbSmall: {
    height: "3em",
    width: "3em",
    backgroundPosition: "center",
    backgroundSize: "cover",
    backgroundColor: "lightgray",
    border: "1px lightgray solid",
    borderRadius: "1.5em",
  },
  uploadAreaWide: {
    height: "100px",
    textAlign: "center",
    fontSize: "36px",
    border: "6px dotted #000000",
  },   
  uploadArea: {
    height: "100%",
    width: "100%",
  },  
  uploadAreaOn: {
    backgroundColor: "#aaa",
  },
  uploadAreaOff: {
    // backgroundColor: "blue",
  }
});

function ImageUploader(props) {
  const { imagePath, loadImage, imageUrl, imageThumbnails, displayMode, onImageUpload } = props;
  const { imageSize, setImageSize } = props;
  const { classes, readOnly, inline, onDelete } = props;
  const [ url, setUrl ] = useState(null);
  const [ processing, setProcessing ] = useState(false);
  const [ onDrag, setOnDrag] = useState(false);
  
  useEffect(() => {
    //console.log(imageUrl, imagePath, imageThumbnails);
    const storagRef = firebase.storage().ref();
    const imageRef = storagRef.child(imagePath);
    const thumbnailSize = (displayMode === "wide") ? 1200 : 600;
    
    if (imageThumbnails && imageThumbnails[thumbnailSize]) {
      console.log("Use thumbnail");
      setUrl(imageThumbnails[thumbnailSize]);
      return;
    }
    if (imageUrl) {
      console.log(imageUrl);
      setUrl(imageUrl);
      return;
    }
    if (loadImage) {
      async function getDownloadUrl() {
        const downloadUrl = await imageRef.getDownloadURL();
        setUrl(downloadUrl);
        console.log(imagePath, downloadUrl);
      }
      getDownloadUrl();
    }
  }, [imagePath, displayMode, imageThumbnails, imageUrl, loadImage]);

  const upload = (file) => {
    blueimpLoadImage(file, (canvas) => {
      console.log(canvas);
      canvas.toBlob((blob)=>{
        console.log(blob);
        const storagRef = firebase.storage().ref();
        const imageRef = storagRef.child(imagePath);
        const task = imageRef.put(blob);
        setProcessing(true);
        task.on('state_changed', (snapshot)=>{
          console.log("progress", snapshot);
        }, (error) => {
          console.log("failed", error);
          setProcessing(false);
        }, async () => {
          // Accordign to the document, this download URL is valid until you explicitly reveke it,
          // and it is accessible by anybody (no security). The security is at this getDownloadURL() level. 
          // It is fine to cache this URL in the database because we put a security around the database.
          const downloadUrl = await task.snapshot.ref.getDownloadURL();
          onImageUpload(downloadUrl);
          setUrl(downloadUrl);
          setProcessing(false);
        });
    
      }, file.type);
    }, { canvas:true, maxWidth:1024, maxHeight:1024, orientation:true });
  };
  
  const onDrop = (e) => {
    console.log("onDrop");
    e.preventDefault();

    const file = e.dataTransfer.files[0];
    if (file && file.type.indexOf('image/') >= 0) {
      upload(file);
    }
  };

  const onDragEnter = (e) => {
    setOnDrag(true);
  };
  const onDragLeave = (e) => {
    setOnDrag(false);
  };
  const onDragOver = (e) => {
    e.preventDefault();
  };
  
  const onFileInput = (e) => {
    const file = e.target.files[0];
    upload(file);
  };

  // image size
  // 6,  5,  4, 3, 2, 1      ( n )

  // edit mode
  // 0,  1 , 2, 3, 4, 5 left (6 - n ) spacer
  // 11, 10, 8, 6, 4, 2 center ( 2 * n  : 11 )
  // 0,  0,  1, 2, 3, 4 right  ( 5 - n  : 0 ) write_spacer
  // 1,  1,  1, 1, 1, 1
 
  // normal mode
  // 0,  1 , 2, 3, 4, 5 spacer
  // 12, 10, 8, 6, 4, 2 (2 * n )
  // 0,  1 , 2, 3, 4, 5 spacer 

  // const imageSize = 2; // 6, 5, 4, 3, 2, 1 then
  const size = imageSize || 6;
  const spacer = 6 - size;
  const center = (!readOnly && size === 6) ? 11 : 2 * size;
  const write_spacer = size > 4 ? 0 : 5 - size;
  
  const imageStyle = url ? { backgroundImage:`url("${url}")` } : {};
  const imageElement = (displayMode === "wide") ? (
    <Grid item xs={center} className={ classes.wideFrame }>

      {url || readOnly ? <img src={url} className={classes[displayMode]} alt="place holder" /> : (
        <Grid
          onDragOver={onDragOver}
          onDrop={onDrop}
          onDragEnter={onDragEnter}
          onDragLeave={onDragLeave}
          className={[classes.uploadAreaWide, onDrag ? classes.uploadAreaOn : classes.uploadAreaOff ].join(" ")}
        >
            Drop upload file here.
        </Grid>
      )}
    </Grid>
  ) : (readOnly ? <Grid item className={classes[displayMode || "thumbLarge"]} style={imageStyle} /> :
       <Grid item style={imageStyle}
             onDragOver={onDragOver}
             onDrop={onDrop}
             onDragEnter={onDragEnter}
             onDragLeave={onDragLeave}
             className={[classes[displayMode || "thumbLarge"], onDrag ? classes.uploadAreaOn : classes.uploadAreaOff ].join(" ")}
         />
      );
  if (inline) {
    return imageElement;
  }
  return (<Grid container className={classes.root} spacing={1} justify="center">
            { processing && <CircularProgress style={{position:"absolute", zIndex:1 }}/> }
            { (spacer > 0 ) && <Grid item xs={spacer} /> }
            { imageElement }
            { !readOnly && onImageUpload ? ((write_spacer > 0) && <Grid item xs={write_spacer}/>) : ( (spacer > 0) && <Grid item xs={spacer}/>)  }
            {
              !readOnly && onImageUpload &&
                <Grid item xs={1}>
                  <IconButton size="small" variant="contained" component="label">
                    <UploadButton />
                    <input type="file" accept="image/*" style={{ display: "none" }} onChange={onFileInput} />
                  </IconButton>
                  {props.onImageSizeChange &&
                   <React.Fragment>
                     <ExpandLess onClick={(e) => {
                       const newSize = size + 1;
                       setImageSize(newSize > 6 ? 6 : newSize);
                       props.onImageSizeChange(newSize);
                     }}/><br/>
                     <ExpandMore onClick={(e) => {
                       const newSize = size - 1;
                       setImageSize(newSize < 1 ? 1 : newSize );
                       props.onImageSizeChange(newSize);
                     }}/><br/>
                   </React.Fragment>}
                  {
                    onDelete && 
                      <IconButton size="small" onClick={onDelete}><DeleteIcon /></IconButton>
                  }
                  
                </Grid>
            
            }
    </Grid>);
}

ImageUploader.propTypes = {
  classes: PropTypes.object.isRequired,
  imagePath: PropTypes.string.isRequired,
};
  
export default withStyles(styles)(ImageUploader);
