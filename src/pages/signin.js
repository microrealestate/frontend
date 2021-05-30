import React, { useContext, useState } from 'react';
import { observer } from 'mobx-react-lite';
import getConfig from 'next/config';
import { useRouter } from 'next/router';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import { Box, Paper, Typography } from '@material-ui/core';
import LocationCityIcon from '@material-ui/icons/LocationCity';

import { FormTextField, SubmitButton } from '../components/Form';
import { StoreContext } from '../store';
import { withTranslation } from 'next-i18next';
import Link from '../components/Link';
import RequestError from '../components/RequestError';
import Page from '../components/Page';

const {
  publicRuntimeConfig: { DEMO_MODE, SIGNUP, APP_NAME },
} = getConfig();

const initialValues = {
  email: DEMO_MODE ? 'demo@demo.com' : '',
  password: DEMO_MODE ? 'demo' : '',
};

const validationSchema = Yup.object().shape({
  email: Yup.string().email().required(),
  password: Yup.string().required(),
});

const SignIn = withTranslation()(
  observer(({ t }) => {
    console.log('Signin functional component');
    const store = useContext(StoreContext);
    const [error, setError] = useState('');
    const router = useRouter();

    const signIn = async ({ email, password }) => {
      try {
        setError('');

        const status = await store.user.signIn(email, password);
        if (status !== 200) {
          switch (status) {
            case 422:
              setError(t('Some fields are missing.'));
              return;
            case 401:
              setError(t('Incorrect email or password.'));
              return;
            default:
              setError(t('Something went wrong'));
              return;
          }
        }

        await store.organization.fetch();
        if (store.organization.items.length) {
          if (!store.organization.selected) {
            store.organization.setSelected(
              store.organization.items[0],
              store.user
            );
          }
          router.push(`/${store.organization.selected.name}/dashboard`);
        } else {
          router.push('/firstaccess');
        }
      } catch (error) {
        console.error(error);
        setError(t('Something went wrong'));
      }
    };

    return !store.user.signedIn ? (
      <Page maxWidth="sm">
        <Box mt={10} mb={5}>
          <Box align="center">
            <LocationCityIcon fontSize="large" />
          </Box>
          <Typography component="h1" variant="h5" align="center">
            {t('Sign in to {{APP_NAME}}', { APP_NAME })}
          </Typography>
        </Box>
        <Paper>
          <Box px={4} pb={4} pt={2}>
            <RequestError error={error} />
            <Formik
              enableReinitialize={true}
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={signIn}
            >
              {({ isSubmitting }) => {
                return (
                  <Form>
                    <FormTextField label={t('Email Address')} name="email" />
                    <FormTextField
                      label={t('Password')}
                      name="password"
                      type="password"
                      autoComplete="current-password"
                    />
                    {!DEMO_MODE && (
                      <Typography variant="body2">
                        <Link href="/forgotpassword">
                          {t('Forgot password?')}
                        </Link>
                      </Typography>
                    )}
                    <Box mt={4}>
                      <SubmitButton
                        fullWidth
                        label={!isSubmitting ? t('Sign in') : t('Signing in')}
                      />
                    </Box>
                  </Form>
                );
              }}
            </Formik>
          </Box>
        </Paper>
        {!DEMO_MODE && SIGNUP && (
          <Box mt={4}>
            <Paper>
              <Box px={4} py={2}>
                <Typography variant="body2">
                  {t('New to {{APP_NAME}}?', { APP_NAME })}{' '}
                  <Link href="/signup">{t('Create an account')}</Link>.
                </Typography>
              </Box>
            </Paper>
          </Box>
        )}
      </Page>
    ) : null;
  })
);

export default SignIn;
