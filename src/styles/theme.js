import { createMuiTheme } from '@material-ui/core/styles';
import { whiteColor, blackColor, grayColor, successColor, infoColor, primaryColor } from './styles';

// Create a theme instance.
const theme = createMuiTheme({
    palette: {
        primary: {
            light: primaryColor[0],
            main: primaryColor[1],
            dark: primaryColor[2],
            contrastText: whiteColor
        },
        success: {
            light: successColor[0],
            main: successColor[1],
            dark: successColor[2],
            contrastText: 'rgba(0, 0, 0, 0.87)'
        },
        backgroundColor: grayColor[10]
    },
    overrides: {
        MuiInputAdornment:{
            root:{
                color: grayColor[7]
            },
        },
        MuiButton: {
            root:{
                color: grayColor[7]
            },
            containedPrimary: {
                color: whiteColor,
                '&.Mui-selected': {
                    backgroundColor: '#7a1e89'
                }
            },
        },
        MuiInput: {
            root:{
                color: grayColor[7]
            }
        },
        MuiAppBar: {
            colorPrimary: {
                color: grayColor[2],
                backgroundColor: whiteColor
            }
        },
        MuiDrawer: {
            paper: {
                backgroundColor: blackColor,
                //opacity: 0.8,
                overflowX: 'hidden'
            }
        },
        MuiStepIcon: {
            root: {
                '&$completed': {
                    color: successColor[2]
                }
            }
        }
    }
});

export default theme;