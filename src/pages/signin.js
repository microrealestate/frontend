import React, { useContext } from 'react';
import { useObserver } from 'mobx-react-lite';
import getConfig from 'next/config'
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import Collapse from '@material-ui/core/Collapse';
import Alert from '@material-ui/lab/Alert';
import LocationCityIcon from '@material-ui/icons/LocationCity';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { FormTextField, SubmitButton } from '../components/Form';

import { useStyles } from '../styles/pages/SignIn.styles';
import { StoreContext } from '../store'
import { withTranslation } from '../utils/i18n';
import Link from '../components/Link';
import { useRouter } from 'next/router';

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

const SignIn = withTranslation()(({ t }) => {
  console.log('Signin functional component')
  const store = useContext(StoreContext);
  const { publicRuntimeConfig: { APP_NAME } } = getConfig();
  const classes = useStyles();
  const router = useRouter();

  const signIn = async ({ email, password }, actions) => {
    try {
      await store.user.signIn(email, password);
      await store.organization.fetch();
      if (store.organization.items.length) {
        store.organization.setSelected(store.organization.items[0]);
        router.push(`/${store.organization.selected.name}/dashboard`);
      } else {
        router.push('/firstaccess');
      }

    } catch (error) {
      console.error(error);
    }
  };

  return useObserver(() => !store.user.signedIn ? (
      <div className={classes.main}>
        <div className={classes.pageTitle}>
          <LocationCityIcon fontSize="large" />
          <Typography component="h1" variant="h5">
            {t('Sign in to', { APP_NAME })}
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
            {({ isValid, isSubmitting }) => {
              return (
                <Form className={classes.form}>
                  <FormTextField
                    label="Email Address"
                    name="email"
                  />
                  <FormTextField
                    label="Password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                  />
                  <Link href='/forgotpassword' className={classes.forgotPassword}>Forgot password?</Link>
                  <SubmitButton
                    fullWidth
                    className={classes.submit}
                    label={!isSubmitting ? t('Sign in') : t('Signing in')}
                  />
                </Form>
              )
            }}
          </Formik>
        </Paper>
        <Paper className={classes.signUpPaper}>
          <div>
            {`New to ${APP_NAME}? `}
            <Link href="/signup">
              Create an account
                </Link>
                .
              </div>
        </Paper>
      </div>
  ) : null);
});

export default SignIn;