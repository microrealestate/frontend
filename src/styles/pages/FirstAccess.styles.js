import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    main: {
        width: '600px',
        display: 'block', // Fix IE 11 issue.
        margin: 'auto'
    },
    paper: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20px 30px 30px'
    },
    form: {
        width: '100%'
    },
    submit: {
        marginTop: '30px'
    }
}));