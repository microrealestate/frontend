import React, { useContext } from 'react';
import { useObserver } from 'mobx-react-lite';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import Collapse from '@material-ui/core/Collapse';
import Alert from '@material-ui/lab/Alert';
import Button from '@material-ui/core/Button';
import LocationCityIcon from '@material-ui/icons/LocationCity';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { FormTextField, SubmitButton } from '../components/Form';

import { useStyles } from '../styles/pages/ForgotPassword.styles';
import { withTranslation } from '../utils/i18n';
import { StoreContext } from '../store';
import { useRouter } from 'next/router';

const initialValues = {
  email: ''
};

const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email')
    .required('Required')
});

const ForgotPassword = withTranslation()(({ t }) => {
  const store = useContext(StoreContext);
  const classes = useStyles();
  const router = useRouter();

  const forgotPassword = async ({ email }, actions) => {
    try {
      await store.user.forgotPassword(email);
      router.push('/resetpassword');
    } catch (error) {
      console.error(error);
    }
  };

  const signIn = event => {
    event.preventDefault();
    router.push('/signin');
  };

  return useObserver(() => (
    <div className={classes.main}>
      <div className={classes.pageTitle}>
        <LocationCityIcon fontSize="large" />
        <Typography component="h1" variant="h5">
          Reset your password
        </Typography>
      </div>
      <Paper className={classes.forgotPasswordPaper}>
        <Collapse className={classes.alert} in={!!store.error}>
          <Alert severity="error">{store.error}</Alert>
        </Collapse>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={forgotPassword}
        >
          {({ isSubmitting }) => {
            return (
              <Form className={classes.form}>
                <FormTextField
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                />
                <div className={classes.formActions}>
                  <Button
                    variant="contained"
                    onClick={signIn}
                  >
                    Cancel
                  </Button>
                  <SubmitButton
                    label={!isSubmitting ? t('Send reset password email') : t('Reseting')}
                  />
                </div>
              </Form>
            )
          }}
        </Formik>
      </Paper>
    </div>
  ));
});

export default ForgotPassword;