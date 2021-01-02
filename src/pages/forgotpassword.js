import React, { useContext, useState } from 'react';
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

import { withTranslation } from '../utils/i18n';
import { StoreContext } from '../store';
import { useRouter } from 'next/router';
import { Box, Grid } from '@material-ui/core';
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';

const initialValues = {
  email: ''
};

const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email()
    .required()
});

const ForgotPassword = withTranslation()(({ t }) => {
  console.log('ForgotPassword functional component')
  const store = useContext(StoreContext);
  const [emailSent, setEmailSent] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const forgotPassword = async ({ email }) => {
    try {
      const status = await store.user.forgotPassword(email);
      if (status !== 200) {
        switch (status) {
          case 422:
            setError(t('Some fields are missing.'));
            return;
          default:
            setError(t('Something went wrong :('));
            return;
        };
      }
      setEmailSent(email);
    } catch (error) {
      console.error(error);
      setError(t('Something went wrong :('))
    }
  };

  const signIn = event => {
    event.preventDefault();
    router.push('/signin');
  };

  return useObserver(() => (
    <Box m="auto" width={500}>
      <Box mt={10} mb={5}>
        <Box align="center">
          <LocationCityIcon fontSize="large" />
        </Box>
        <Typography component="h1" variant="h5" align="center">
          {t('Reset your password')}
        </Typography>
      </Box>
      <Paper>
        {!emailSent && (
          <Box px={4} pb={4} pt={2}>
            <Box pb={!!error ? 2 : 0} pt={!!error ? 2 : 0}>
              <Collapse in={!!error}>
                <Alert severity="error">{error}</Alert>
              </Collapse>
            </Box>
            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={forgotPassword}
            >
              {({ isSubmitting }) => {
                return (
                  <Form>
                    <FormTextField
                      label={t('Email Address')}
                      name="email"
                      autoComplete="email"
                    />
                    <Box pt={2}>
                      <Grid container spacing={2}>
                        <Grid item>
                          <Button
                            variant="contained"
                            onClick={signIn}
                          >
                            {t('Cancel')}
                          </Button>
                        </Grid>
                        <Grid item>
                          <SubmitButton
                            label={!isSubmitting ? t('Send reset password email') : t('Reseting')}
                          />
                        </Grid>
                      </Grid>
                    </Box>
                  </Form>
                )
              }}
            </Formik>
          </Box>
        )}
        {emailSent && (
          <Box px={4} pb={4} pt={2}>
            <Box color="success.main" align="center">
              <CheckCircleOutlineIcon fontSize="large"/>
            </Box>
            <Box pb={1}>
              <Typography componnent="h2" variant="h6" align="center">{t('Check your email')}</Typography>
            </Box>
            <Typography variant="body2" align="center">{t('An email has been sent to your email address {{email}}.', { email: emailSent })}</Typography>
            <Typography variant="body2" align="center">{t('Follow the directions in the email to reset your password.')}</Typography>
            <Box align="center" pt={2}>
              <Button
                color="primary"
                variant="contained"
                onClick={signIn}
              >
                {t('Done')}
              </Button>
            </Box>
          </Box>
        )}
      </Paper>
    </Box>
  ));
});

export default ForgotPassword;