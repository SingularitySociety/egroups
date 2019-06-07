import React from 'react';
import { Redirect } from 'react-router-dom';
import Processing from './Processing';

// This module performs an "instruction" after the login,
// such as posting a high score (when the user play before login). 
// This is done by redirecting to "/login/cmd/{encoded}", 
// where the encoded is an encoded "instruction" (a Json object). 
class Decoder extends React.Component {
  state={ redirect:null }

  async componentDidMount() {
    const { user, match:{params:{encoded}} } = this.props;
    const params = JSON.parse(decodeURIComponent(encoded));

    // App specific code should be written here. This is just a sample. 
    if (params.cmd === "redirect") {
      const { path } = params; 
      console.log("redirecting to", path, "as", user.displayName);
      //this.setState({redirect:path});
      window.location.pathname = path;
    }
  }

  render() {
    if (this.state.redirect) {
        return <Redirect to={this.state.redirect} />
    }
    return <Processing user={this.props.user} />
  }
}

export default Decoder;