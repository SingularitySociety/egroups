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
    paddingTop: "0",
  },
  youtubeMovieContent: {
    '& > iframe': {
      opacity: "80%",
      zIndex: -1,
      height: "100% !important",
      left: "0",
      position: "absolute",
      top: "0",
      width: "100% !important"
    },
  }
});

function Youtube(props) {
  const { classes } = props;

  useEffect(()=>{
    (async() => {
      const YT = await (new Promise((resolve) => {
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        var firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        window.onYouTubeIframeAPIReady = () => resolve(window.YT);
      }));
      
      function onPlayerReady(event) {
        event.target.playVideo();
        event.target.mute();
      }
      
      function onPlayerStateChange(e) {
        const ytStatus = e.target.getPlayerState();
        if (ytStatus == YT.PlayerState.ENDED) {
          YT.playVideo();
          YT.mute();
        }
      }
      function stopVideo() {
        player.stopVideo();
      }
      const player = new YT.Player('player', {
        height: '400',
        width: '640',
        videoId: 'ZDaTBnnfpKM',
        playerVars: {
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
  
  return <Grid className={classes.youtubeMovie} xs={12}>
           <div className={classes.youtubeMovieContent}>
             <div id="player" className={classes.youtubePlayer} />
           </div>
         </Grid>;
}

export default withStyles(styles)(Youtube);

