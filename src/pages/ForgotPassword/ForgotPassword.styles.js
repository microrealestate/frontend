import { makeStyles } from '@material-ui/core/styles';

export const useStyles = () => {

    return makeStyles({
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
      forgotPasswordPaper: {
        marginTop: '20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20px 30px 30px'
      },
      form: {
        width: '100%',
        marginTop: '10px'
      },
      formActions: {
        display: 'flex',
        marginTop: '30px',
        '& > *': {
          margin: '10px'
        }
      }
    })();
};