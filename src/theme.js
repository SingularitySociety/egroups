import { createMuiTheme } from '@material-ui/core/styles';
import primary from '@material-ui/core/colors/blue';
import secondary from '@material-ui/core/colors/deepPurple';

export const themeOptions = {
  palette: {
    primary: primary,
    secondary: secondary,
  },
  typography: {
    useNextVariants: true,
    fontsize: {
      fontSize: "0.95rem",
      '@media (min-width:480px)': {
        fontSize: '1.05rem',
      },
    },
    h1: {
      fontSize: "1.4rem",
      '@media (min-width:480px)': {
        fontSize: '1.8rem',
      },
    },
    h2: {
      fontSize: "1.3rem",
      '@media (min-width:480px)': {
        fontSize: '1.6rem',
      },
    },
    h3: {
      fontSize: "1.2rem",
      '@media (min-width:480px)': {
        fontSize: '1.4rem',
      },
    },
    h4: {
      fontSize: "1.1rem",
      '@media (min-width:480px)': {
        fontSize: '1.2rem',
      },
    },
    h5: {
      fontSize: "1.05rem",
      '@media (min-width:480px)': {
        fontSize: '1.1rem',
      },
    },
  }
};
const theme = createMuiTheme(themeOptions);

//theme = responsiveFontSizes(theme, { factor: 1 });
export default theme;
