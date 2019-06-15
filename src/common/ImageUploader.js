import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Button } from '@material-ui/core';
import * as firebase from "firebase/app";
import "firebase/storage";

const styles = theme => ({
  root: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  thumbnail: {
    height: "calc(30vmin)",
  }
});

class About extends React.Component {
  state = {imageUrl:null};
  async componentDidMount() {
    const storagRef = firebase.storage().ref();
    this.imageRef = storagRef.child(this.props.imagePath);
    const imageUrl = await this.imageRef.getDownloadURL();
    this.setState({imageUrl});
  }
  onFileInput = (e) => {
    const task = this.imageRef.put(e.target.files[0]);
    task.on('state_changed', (snapshot)=>{
      console.log("progress", snapshot.progress);
    }, (error) => {
      console.log("failed");
    }, async () => {
      console.log("success");
      const imageUrl = await task.snapshot.ref.getDownloadURL();
      console.log("url", imageUrl);
      this.props.onImageUpload(imageUrl);
      this.setState({imageUrl});
    })
  }    
  render() {
    const { classes } = this.props;
    const { imageUrl } = this.state;
    return (<div className={classes.root}>
        {
          imageUrl && <img className={classes.thumbnail} alt="profile" src={imageUrl} />
        }
        <Button variant="contained" component="label">
            Upload Image
            <input type="file" accept="image/*" style={{ display: "none" }} onChange={this.onFileInput} />
        </Button>
      </div>)
  }
}

About.propTypes = {
    classes: PropTypes.object.isRequired,
    imagePath: PropTypes.string.isRequired,
    onImageUpload: PropTypes.func.isRequired,
  };
  
export default withStyles(styles)(About);