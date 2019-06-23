import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Button, Grid } from '@material-ui/core';
import * as firebase from "firebase/app";
import "firebase/storage";

const styles = theme => ({
  root: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
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
});

class ImageViewer extends React.Component {
  state = {imageUrl:null};
  async componentDidMount() {
    const { imagePath, loadImage, imageUrl, imageThumbnails } = this.props;
    console.log(imageUrl, imagePath, imageThumbnails);
    const storagRef = firebase.storage().ref();
    this.imageRef = storagRef.child(imagePath);

    if (imageThumbnails && imageThumbnails[1200]) {
      console.log("Use thumbnail");
      this.setState({imageUrl: imageThumbnails[1200]});
      return;
    }
    if (imageUrl) {
      this.setState({imageUrl});
      return;
    }
    if (loadImage) {
      console.log(imagePath);
      const imageUrl = await this.imageRef.getDownloadURL();
      this.setState({imageUrl});
    }
  }
  onFileInput = (e) => {
    const task = this.imageRef.put(e.target.files[0]);
    task.on('state_changed', (snapshot)=>{
      console.log("progress", snapshot);
    }, (error) => {
      console.log("failed", error);
    }, async () => {
      // Accordign to the document, this download URL is valid until you explicitly reveke it,
      // and it is accessible by anybody (no security). The security is at this getDownloadURL() level. 
      // It is fine to cache this URL in the database because we put a security around the database.
      const imageUrl = await task.snapshot.ref.getDownloadURL();
      this.props.onImageUpload(imageUrl);
      this.setState({imageUrl});
    })
  }    
  render() {
    const { classes, readOnly, displayMode, inline, onImageUpload } = this.props;
    const { imageUrl } = this.state;
    const imageStyle = imageUrl ? { backgroundImage:`url("${imageUrl}")` } : {};
    const imageElement = imageUrl ? ((displayMode === "wide") ? (
        <Grid item>
          <img src={imageUrl} className={classes[displayMode]} alt="blog article" />
        </Grid>
      ) : <Grid item className={classes[displayMode || "thumbLarge"]} style={imageStyle} />) : "";
    if (inline) {
      return imageElement;
    }
    return (<Grid container className={classes.root} spacing={1} justify="center">
        { imageElement }
        {
          !readOnly && onImageUpload &&
            <Grid item>
            <Button variant="contained" component="label">
                Upload Image
                <input type="file" accept="image/*" style={{ display: "none" }} onChange={this.onFileInput} />
            </Button>
        </Grid>

        }
      </Grid>)
  }
}

ImageViewer.propTypes = {
    classes: PropTypes.object.isRequired,
    imagePath: PropTypes.string.isRequired,
  };
  
export default withStyles(styles)(ImageViewer);