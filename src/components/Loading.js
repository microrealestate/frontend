import React from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';
import { makeStyles } from '@material-ui/styles';

const useStyles = () => makeStyles({
  root: {
    position: 'fixed',
    height: '100%',
    width: '100%',
  },
  progress: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%'
  }
});

export default () => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <div className={classes.progress}>
        <CircularProgress />
      </div>
    </div>
  );
};
