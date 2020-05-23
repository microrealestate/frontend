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

import { useStyles } from './SignUp.styles';

const initialValues = {
  firstName: '',
  lastName: '',
  email: '',
  password: ''
};

const validationSchema = Yup.object().shape({
  firstName: Yup.string()
    .required('Required'),
  lastName: Yup.string()
    .required('Required'),
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

  const signUp = async ({ firstName, lastName, email, password }, actions) => {
      await user.signUp(firstName, lastName, email, password );
      if (!store.error) {
        await navigate('/app/signin');
      }
  };

  const signIn = async event => {
    event.preventDefault();
    await navigate('/app/signin');
  };

  return useObserver(() => (
      <main className={classes.main}>
        <div className={classes.pageTitle}>
          <LocationCityIcon fontSize="large" />
          <Typography component="h1" variant="h5">
            {`Sign up to ${window.APP_CONFIG.APP_NAME}`}
          </Typography>
        </div>
        <Paper className={classes.signUpPaper}>
          <Collapse className={classes.alert} in={!!store.error}>
            <Alert severity="error">{store.error}</Alert>
          </Collapse>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={signUp}
          >
            {({ isValid }) => {
              return (
                <Form className={classes.form}>
                  <FormTextField
                    label="First name"
                    name="firstName"
                    autoComplete="firstName"
                  />
                  <FormTextField
                    label="Last name"
                    name="lastName"
                    autoComplete="lastName"
                  />
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
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    className={classes.submit}
                    color="primary"
                    disabled={!isValid}
                  >
                    Agree & Join
                  </Button>
                </Form>
              )
            }}
          </Formik>
        </Paper>
        <Paper className={classes.signInPaper}>
          <div>
            {`Already on ${window.APP_CONFIG.APP_NAME}? `}
            <Link href="#" onClick={signIn}>
              Sign in
              </Link>
              .
            </div>
        </Paper>
      </main>
  ));
};