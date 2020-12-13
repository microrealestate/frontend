import { fade, makeStyles } from '@material-ui/core/styles';
import { viewHeight } from '../styles';

export const useStyles = makeStyles(theme => ({
  view: {
    overflowY: 'auto',
    overflowX: 'hidden',
    height: viewHeight
  },
  loading: {
    marginLeft: '50%',
    marginTop: 60
  }
}));