import React, { useEffect } from 'react';
import ProcessingPage from './ProcessingPage';

// This module performs an "instruction" after the login,
// such as posting a high score (when the user play before login). 
// This is done by redirecting to "/login/cmd/{encoded}", 
// where the encoded is an encoded "instruction" (a Json object). 
function Decoder(props) {
  const { user, match:{params:{encoded}} } = props;

  useEffect(() => {
    const str = decodeURIComponent(encoded);
    console.log(str);
    const params = JSON.parse(str);

    // App specific code should be written here. This is just a sample. 
    if (params.cmd === "redirect") {
      const { path } = params; 
      window.location.pathname = path;
    }
  }, [encoded]);

  return <ProcessingPage user={user} />
}

export default Decoder;