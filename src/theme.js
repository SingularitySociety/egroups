import { createMuiTheme, responsiveFontSizes } from '@material-ui/core/styles';
import primary from '@material-ui/core/colors/blue';
import secondary from '@material-ui/core/colors/deepPurple';

let theme = createMuiTheme({
    typography: {
        useNextVariants: true,
    },
    palette: {
      primary: primary,
      secondary: secondary,
    }
});

theme = responsiveFontSizes(theme, { factor: 1 });
export default theme;
