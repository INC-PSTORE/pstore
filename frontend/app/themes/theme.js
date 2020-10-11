import {createMuiTheme } from '@material-ui/core/styles';


export const theme = createMuiTheme({
  typography: {
    useNextVariants: true,
  },

  palette: {
    type: 'light',
    primary: {
      main:'#fb958b', // customise your main color here
      contrastText: '#fff',
    },
    // secondary: {main:'#673ab7' },

    error: {main:'#ca0909' },

    sand:{main:'#F4DECB'},
    shell:{main:'#F8EEE7'},
    status:{
        danger:'#b71c1c'
    },

    // Used by `getContrastText()` to maximize the contrast between the background and
    // the text.
    contrastThreshold: 3,
    // Used to shift a color's luminance by approximately
    // two indexes within its tonal palette.
    // E.g., shift from Red 500 to Red 300 or Red 700.
    tonalOffset: 0.2,

    // background: {
    //     paper: 'white',
    // },
  },
});