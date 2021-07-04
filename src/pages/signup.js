import React, { useContext, useState } from 'react';
import { observer } from 'mobx-react-lite';
import ErrorPage from 'next/error';
import { useRouter } from 'next/router';
import getConfig from 'next/config';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import { Box, Typography, Paper } from '@material-ui/core';
import LocationCityIcon from '@material-ui/icons/LocationCity';

import { FormTextField, SubmitButton } from '../components/Form';
import useTranslation from 'next-translate/useTranslation';
import { StoreContext } from '../store';
import Link from '../components/Link';
import RequestError from '../components/RequestError';
import Page from '../components/Page';

const {
  publicRuntimeConfig: { APP_NAME, SIGNUP },
} = getConfig();

const initialValues = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
};

const validationSchema = Yup.object().shape({
  firstName: Yup.string().required(),
  lastName: Yup.string().required(),
  email: Yup.string().email().required(),
  password: Yup.string().required(),
});

const SignUp = observer(({ pageError }) => {
  const { t } = useTranslation('common');
  const store = useContext(StoreContext);
  const [error, setError] = useState('');
  const router = useRouter();

  if (pageError) {
    return <ErrorPage statusCode={pageError.statusCode} />;
  }

  const signUp = async ({ firstName, lastName, email, password }) => {
    try {
      setError('');

      const status = await store.user.signUp(
        firstName,
        lastName,
        email,
        password
      );
      if (status !== 200) {
        switch (status) {
          case 422:
            setError(t('Some fields are missing'));
            return;
          case 409:
            setError(t('This user is already registered'));
            return;
          default:
            setError(t('Something went wrong'));
            return;
        }
      }
      router.push('/signin');
    } catch (error) {
      console.error(error);
      setError(t('Something went wrong'));
    }
  };

  return (
    <Page maxWidth="sm">
      <Box mt={10} mb={5}>
        <Box align="center">
          <LocationCityIcon fontSize="large" />
        </Box>
        <Typography component="h1" variant="h5" align="center">
          {t('Sign up to {{APP_NAME}}', { APP_NAME })}
        </Typography>
      </Box>
      <Paper>
        <Box px={4} pb={4} pt={2}>
          <RequestError error={error} />
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={signUp}
          >
            {({ isSubmitting }) => {
              return (
                <Form>
                  <FormTextField label={t('First name')} name="firstName" />
                  <FormTextField label={t('Last name')} name="lastName" />
                  <FormTextField label={t('Email Address')} name="email" />
                  <FormTextField
                    label={t('Password')}
                    name="password"
                    type="password"
                    autoComplete="current-password"
                  />
                  <Box mt={4}>
                    <SubmitButton
                      fullWidth
                      label={!isSubmitting ? t('Agree & Join') : t('Joining')}
                    />
                  </Box>
                </Form>
              );
            }}
          </Formik>
        </Box>
      </Paper>
      <Box mt={4}>
        <Paper>
          <Box px={4} py={2}>
            <Typography variant="body2">
              {t('Already on {{APP_NAME}}?', { APP_NAME })}{' '}
              <Link href="/signin">{t('Sign in')}</Link>.
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Page>
  );
});

SignUp.getInitialProps = async () => {
  console.log('SignUp.getInitialProps');

  if (!SIGNUP) {
    return { pageError: { statusCode: 404 } };
  }

  return {};
};

export default SignUp;
