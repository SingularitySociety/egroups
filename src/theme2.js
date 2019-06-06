import { createMuiTheme } from '@material-ui/core/styles';
import primary from '@material-ui/core/colors/orange';
import secondary from '@material-ui/core/colors/deepPurple';

export default createMuiTheme({
    typography: {
        useNextVariants: true,
    },
    palette: {
      primary: primary,
      secondary: secondary,
    }
});