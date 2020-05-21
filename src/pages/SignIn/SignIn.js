import React, { useState } from 'react';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import Collapse from '@material-ui/core/Collapse';
import Alert from '@material-ui/lab/Alert';
import Button from '@material-ui/core/Button';
import Link from '@material-ui/core/Link';
import LocationCityIcon from '@material-ui/icons/LocationCity';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { useStore } from '../../store';
import WebSite from '../WebSite';
import { FormTextField } from '../../components/Form';

import { useStyles } from './SignIn.styles';

const initialValues = {
  email: '',
  password: ''
};

const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email')
    .required('Required'),
  password: Yup.string()
    .required('Required')
});

export default props => {
  const { navigate } = props;
  const { store: { user } } = useStore();
  const [signInError, setSignInError] = useState(false);
  const classes = useStyles();

  const signIn = async ({ email, password }, actions) => {
    try {
      await user.signIn(email, password);
    } catch (error) {
      console.error(error);
    }
    if (user.signedIn) {
      setSignInError(false);
      await navigate('/app/admin');
    } else {
      setSignInError(true);
    }
  };

  const signUp = async event => {
    event.preventDefault();
    await navigate('/app/signup');
  };

  return (
    <WebSite {...props}>
      <main className={classes.main}>
        <div className={classes.pageTitle}>
          <LocationCityIcon fontSize="large" />
          <Typography component="h1" variant="h5">
            {`Sign in to ${window.APP_CONFIG.APP_NAME}`}
          </Typography>
        </div>
        <Paper className={classes.signInPaper}>
          <Collapse className={classes.alert} in={signInError}>
            <Alert severity="error">Incorrect email or password.</Alert>
          </Collapse>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={signIn}
          >
            {({ isValid }) => {
              return (
                <Form className={classes.form}>
                  <FormTextField
                    label="Email Address"
                    name="email"
                    autoComplete="email"
                    autoFocus={true}
                  />
                  <FormTextField
                    label="Password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                  />
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    className={classes.submit}
                    color="primary"
                    disabled={!isValid}
                  >
                    Sign in
                  </Button>
                </Form>
              )
            }}
          </Formik>
        </Paper>
        <Paper className={classes.signUpPaper}>
          <div>
            {`New to ${window.APP_CONFIG.APP_NAME}? `}
            <Link href="#" onClick={signUp}>
              Create an account
              </Link>
              .
            </div>
        </Paper>
      </main>
    </WebSite>
  );
};