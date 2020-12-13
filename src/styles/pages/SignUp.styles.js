import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    main: {
        width: '450px',
        display: 'block', // Fix IE 11 issue.
        margin: 'auto'
    },
    pageTitle: {
        marginTop: '80px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
    },
    signUpPaper: {
        marginTop: '20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20px 30px 30px'
    },
    signInPaper: {
        marginTop: '40px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20px'
    },
    alert: {
        width: '100%',
        marginTop: '10px'
    },
    form: {
        width: '100%',
        marginTop: '10px'
    },
    submit: {
        marginTop: '30px'
    }
}))