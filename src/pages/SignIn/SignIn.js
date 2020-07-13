import React from 'react';
import { useObserver } from 'mobx-react';
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
  const { store, store: { user } } = useStore();
  const classes = useStyles();

  const signIn = async ({ email, password }, actions) => {
    await user.signIn(email, password);
    if (!store.error) {
      await navigate(`${process.env.PUBLIC_URL}/dashboard`, { replace: true });
    }
  };

  const signUp = async event => {
    event.preventDefault();
    await navigate(`${process.env.PUBLIC_URL}/signup`);
  };

  const forgotPassword = async event => {
    event.preventDefault();
    await navigate(`${process.env.PUBLIC_URL}/forgotpassword`);
  };

  return useObserver(() => (
    <main className={classes.main}>
      <div className={classes.pageTitle}>
        <LocationCityIcon fontSize="large" />
        <Typography component="h1" variant="h5">
          {`Sign in to ${window.APP_CONFIG.APP_NAME}`}
        </Typography>
      </div>
      <Paper className={classes.signInPaper}>
        <Collapse className={classes.alert} in={!!store.error}>
          <Alert severity="error">{store.error}</Alert>
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
                />
                <FormTextField
                  label="Password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                />
                <Link href='#' className={classes.forgotPassword} onClick={forgotPassword}>Forgot password?</Link>
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
  ));
};