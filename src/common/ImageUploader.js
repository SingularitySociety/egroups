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
  thumbnail: {
    height: "calc(30vmin)",
    width: "calc(30vmin)",
    backgroundPosition: "center",
    backgroundSize: "cover",
    backgroundColor: "lightgray",
    border: "1px lightgray solid",
    borderRadius: "calc(15vmin)",
  }
});

class About extends React.Component {
  state = {imageUrl:null};
  async componentDidMount() {
    const storagRef = firebase.storage().ref();
    this.imageRef = storagRef.child(this.props.imagePath);
    if (this.props.loadImage) {
      const imageUrl = await this.imageRef.getDownloadURL();
      this.setState({imageUrl});
    }
  }
  onFileInput = (e) => {
    const task = this.imageRef.put(e.target.files[0]);
    task.on('state_changed', (snapshot)=>{
      console.log("progress", snapshot);
    }, (error) => {
      console.log("failed");
    }, async () => {
      const imageUrl = await task.snapshot.ref.getDownloadURL();
      this.props.onImageUpload(imageUrl);
      this.setState({imageUrl});
    })
  }    
  render() {
    const { classes } = this.props;
    const { imageUrl } = this.state;
    const imageStyle = imageUrl ? { backgroundImage:`url("${imageUrl}")` } : {};
    return (<Grid container className={classes.root} spacing={1} justify="center">
        <Grid item className={classes.thumbnail} style={imageStyle} />
        <Grid item>
          <Button variant="contained" component="label">
              Upload Image
              <input type="file" accept="image/*" style={{ display: "none" }} onChange={this.onFileInput} />
          </Button>
        </Grid>
      </Grid>)
  }
}

About.propTypes = {
    classes: PropTypes.object.isRequired,
    imagePath: PropTypes.string.isRequired,
    onImageUpload: PropTypes.func.isRequired,
  };
  
export default withStyles(styles)(About);