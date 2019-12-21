import React, { useEffect } from 'react';
import { Grid } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
  youtubeMovie: {
    margin: "0 auto",
    width: "100%",
//    position: "fixed",
    top: 0,
    bottom: 0,
    minWidth: "150%",
    height: "100%",
    zIndex: -1,
  },
  youtubeMovieContent: {
    paddingTop: "56.25%",
    position: "relative",
    width: "100%",
  },
  youtubeMovieContent: {
    '& > iframe': {
      opacity: "80%",
      zIndex: -1,
      minHeight: "100% !important",
      left: "0",
      position: "absolute",
      top: "0",
      minWidth: "100% !important"
    },
  }
});

function Youtube(props) {
  const { classes } = props;

  useEffect(()=>{
    (async() => {
      let player = null;
      const YT = await (new Promise((resolve) => {
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        var firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        window.onYouTubeIframeAPIReady = () => resolve(window.YT);
      }));
      
      function onPlayerReady(event) {
        event.target.mute();
        event.target.playVideo();
      }
      
      function onPlayerStateChange(e) {
        const ytStatus = e.target.getPlayerState();
        if (ytStatus === YT.PlayerState.ENDED) {
          player.mute();
          player.playVideo();
        }
        if (ytStatus === -1) {
          player.mute();
          player.playVideo();
        }
        console.log(ytStatus);
      }
      player = new YT.Player('player', {
        height: '400',
        width: '640',
        videoId: 'ZDaTBnnfpKM',
        playerVars: {
          playsinline: 1,
          controls: 0,
          autoplay: 1,
          showinfo: 0,
        },
        events: {
          'onReady': onPlayerReady,
          'onStateChange': onPlayerStateChange
        }
      });
    
    })();
  }, []);
  
  return <Grid className={classes.youtubeMovie} item xs={12}>
           <div className={classes.youtubeMovieContent}>
             <div id="player" className={classes.youtubePlayer} />
           </div>
         </Grid>;
}

export default withStyles(styles)(Youtube);

