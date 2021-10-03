import * as Yup from 'yup';

import { Box, Button, Grid, Paper, Typography } from '@material-ui/core';
import { Form, Formik } from 'formik';
import { FormTextField, SubmitButton } from '../../components/Form';
import React, { useContext, useState } from 'react';

import LocationCityIcon from '@material-ui/icons/LocationCity';
import { observer } from 'mobx-react-lite';
import Page from '../../components/Page';
import RequestError from '../../components/RequestError';
import { StoreContext } from '../../store';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

const initialValues = {
  password: '',
  confirmationPassword: '',
};

const validationSchema = Yup.object().shape({
  password: Yup.string().required(),
  confirmationPassword: Yup.string()
    .required()
    .oneOf([Yup.ref('password'), null], 'Passwords must match'), // TODO translate this
});

const ResetPassword = observer(() => {
  const { t } = useTranslation('common');
  const store = useContext(StoreContext);
  const [error, setError] = useState('');
  const router = useRouter();

  const { resetToken } = router.query;

  const resetPassword = async ({ password }) => {
    try {
      setError('');

      const status = await store.user.resetPassword(resetToken, password);
      if (status !== 200) {
        switch (status) {
          case 422:
            setError(t('Some fields are missing'));
            return;
          case 403:
            setError(t('Invalid reset link'));
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

  const signIn = (event) => {
    event.preventDefault();
    router.push('/signin');
  };

  return (
    <Page maxWidth="sm">
      <Box mt={10} mb={5}>
        <Box align="center">
          <LocationCityIcon fontSize="large" />
        </Box>
        <Typography component="h1" variant="h5" align="center">
          {t('Reset your password')}
        </Typography>
      </Box>
      <Paper>
        <Box px={4} pb={4} pt={2}>
          <RequestError error={error} />
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={resetPassword}
          >
            {({ isSubmitting }) => {
              return (
                <Form>
                  <FormTextField
                    label={t('New password')}
                    name="password"
                    type="password"
                  />
                  <FormTextField
                    label={t('Confirmation password')}
                    name="confirmationPassword"
                    type="password"
                  />
                  <Box pt={2}>
                    <Grid container spacing={2}>
                      <Grid item>
                        <Button variant="contained" onClick={signIn}>
                          {t('Cancel')}
                        </Button>
                      </Grid>
                      <Grid item>
                        <SubmitButton
                          label={
                            !isSubmitting
                              ? t('Reset my password')
                              : t('Reseting')
                          }
                        />
                      </Grid>
                    </Grid>
                  </Box>
                </Form>
              );
            }}
          </Formik>
        </Box>
      </Paper>
    </Page>
  );
});

export default ResetPassword;
