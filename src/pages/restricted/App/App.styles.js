import { makeStyles } from '@material-ui/core/styles';

import {
    container,
    drawerWidth,
    // transition,
    // boxShadow,
    defaultFont,
    // primaryColor,
    // primaryBoxShadow,
    infoColor,
    // successColor,
    // warningColor,
    // dangerColor,
    whiteColor,
    grayColor,
    blackColor,
    hexToRgb
} from '../../../styles.js';

export const useStyles = () => {

    return makeStyles({
        root: {
            display: 'flex'
        },
        appBar: {
            backgroundColor: 'transparent',
            boxShadow: 'none',
            borderBottom: '0',
            marginBottom: '0',
            position: 'relative',
            width: '100%',
            paddingTop: '10px',
            zIndex: '1029',
            color: grayColor[7],
            border: '0',
            borderRadius: '3px',
            padding: '10px 0',
            transition: 'all 150ms ease 0s',
            minHeight: '50px',
            display: 'block'
        },
        toolbar: {
            ...container,
            minHeight: '50px'
        },
        title: {
            flexGrow: 1,
            ...defaultFont,
            letterSpacing: "unset",
            lineHeight: "30px",
            fontSize: "18px",
            borderRadius: "3px",
            textTransform: "none",
            color: "inherit",
            margin: "0",
        },
        drawer: {
            width: drawerWidth,
            flexShrink: 0
        },
        drawerPaper: {
            width: drawerWidth,
            background: blackColor,
            opacity: '.8'
        },
        logoLink: {
            display: 'flex',
            position: 'relative',
            padding: '15px 15px',
            zIndex: '4',
            '&:after': {
                content: '""',
                position: 'absolute',
                bottom: '0',

                height: '1px',
                right: '15px',
                width: 'calc(100% - 30px)',
                backgroundColor: 'rgba(' + hexToRgb(grayColor[6]) + ', 0.3)'
            },
            '&,&:hover,&:visited': {
                textDecoration: 'none',
                color: whiteColor
            }
        },
        logoIcon: {
            color: infoColor[0]
        },
        logoText: {
            ...defaultFont,
            textTransform: 'uppercase',
            padding: '5px 0 5px 10px',
            display: 'block',
            fontSize: '18px',
            textAlign: 'left',
            fontWeight: '400',
            lineHeight: '30px',

            backgroundColor: 'transparent',

        },
        list: {
            marginTop: '20px',
            paddingLeft: '0',
            paddingTop: '0',
            paddingBottom: '0',
            marginBottom: '0',
            listStyle: 'none',
            position: 'unset'
        },
        item: {
            position: 'relative',
            display: 'block',
            textDecoration: 'none',
            '&:hover,&:focus,&:visited,&': {
                color: whiteColor
            }
        },
        itemSelected: {
            backgroundColor: [infoColor[0], '!important']
        },
        itemLink: {
            width: 'auto',
            transition: 'all 300ms linear',
            margin: '10px 15px 0',
            borderRadius: '3px',
            position: 'relative',
            display: 'block',
            padding: '10px 15px',
            backgroundColor: 'transparent',
            ...defaultFont
        },
        itemIcon: {
            width: '24px',
            height: '30px',
            fontSize: '24px',
            lineHeight: '30px',
            float: 'left',
            marginRight: '15px',
            textAlign: 'center',
            verticalAlign: 'middle',
            color: 'rgba(' + hexToRgb(whiteColor) + ', 0.8)'
        },
        itemText: {
            ...defaultFont,
            margin: '0',
            lineHeight: '30px',
            fontSize: '14px',
            color: whiteColor
        },
        content: {
            flexGrow: 1,
            padding: '15px'
        }
    })();
};