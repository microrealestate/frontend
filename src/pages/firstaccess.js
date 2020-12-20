import React, { useContext, useState } from 'react';
import getConfig from 'next/config'
import { useObserver } from 'mobx-react-lite';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import { Typography, Box, Paper, Collapse } from '@material-ui/core';
import LocationCityIcon from '@material-ui/icons/LocationCity';

import { FormTextField, SubmitButton, RadioFieldGroup, RadioField } from '../components/Form';
import { withTranslation } from '../utils/i18n';
import { withAuthentication } from '../components/Authentication';
import { StoreContext } from '../store';
import Page from '../components/Page';
import IconTypography from '../components/IconTypography';
import Alert from '@material-ui/lab/Alert';

const initialValues = {
  name: '',
  isCompany: 'false',
  company: '',
  email: ''
};

const validationSchema = Yup.object().shape({
  name: Yup.string()
    .required(),
  isCompany: Yup.string()
    .required(),
  company: Yup.mixed().when('isCompany', {
    is: 'true',
    then: Yup.string().required(),
    otherwise: Yup.string()
  }),
  // company: Yup.string().required(),
  email: Yup.mixed().when('isCompany', {
    is: 'true',
    then: Yup.string().email().required(),
    otherwise: Yup.string().email()
  })
});


const FirstAccess = withTranslation()(({ t }) => {
  const { publicRuntimeConfig: { APP_NAME } } = getConfig();
  const store = useContext(StoreContext);
  const [error, setError] = useState('');

  const onSubmit = async ({ name, isCompany, company, email }, actions) => {
    try {
      await new Promise(res => setTimeout(() => { res() }, 3000));
      //   const status = await store.organization.create({
      //       name,
      //       isCompany,
      //       company: isCompany ? company : '',
      //       email: isCompany ? email : store.user.email,
      //       admin: store.user.email
      //   });
      // if (status !== 200) {
      //   switch (status) {
      //     default:
      //       setError(t('Something went wrong :('));
      //       return;
      //   };
      // }
      //   router.push(`${name}/dashboard`);
    } catch (error) {
      console.error(error);
      setError(t('Something went wrong :('));
    }
  };

  return useObserver(() => (
    <Page
      PrimaryToolbar={
        <IconTypography
          Icon={LocationCityIcon}
          fontSize="large"
          variant="h5"
          color="textSecondary"
          noWrap
        >
          {APP_NAME}
        </IconTypography>
      }
    >
      <Box m="auto" width={500}>
        <Box paddingTop={2} paddingBottom={2}>
          <Typography component="h1" variant="h4" align="center">
            {t('Welcome {{firstName}} {{lastName}}!', { firstName: store.user.firstName, lastName: store.user.lastName })}
          </Typography>
        </Box>
        <Box paddingBottom={4}>
          <Typography variant="subtitle2" align="center" color="textSecondary">
            {t('One more step to tell us who will rent your properties')}
          </Typography>
        </Box>
        <Paper>
          <Box px={4} pb={4} pt={2}>
            <Box pb={!!error ? 2 : 0} pt={!!error ? 2 : 0}>
              <Collapse in={!!error}>
                <Alert severity="error">{error}</Alert>
              </Collapse>
            </Box>
            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={onSubmit}
            >
              {({ values, isSubmitting }) => {
                if (values.isCompany === 'false') {
                  values.company = '';
                  values.email = '';
                }
                return (
                  <Form autoComplete="off">
                    <Box paddingBottom={4}>
                      <FormTextField
                        label={t('Landlord name')}
                        name="name"
                      />
                    </Box>
                    <Box>
                      <RadioFieldGroup
                        aria-label="organization type"
                        label={t('The landlord belongs to')}
                        name="isCompany"
                      >
                        <RadioField value="false" label={`${t('My personal account')} (${store.user.firstName} ${store.user.lastName})`} />
                        <RadioField value="true" label={t('A business or institution')} />
                      </RadioFieldGroup>
                    </Box>
                    {values.isCompany === 'true' && (
                      <Box>
                        <FormTextField
                          label={t('Name of business or institution')}
                          name="company"
                        />
                        <FormTextField
                          label={t('Contact email')}
                          name="email"
                        />
                      </Box>
                    )}
                    <Box paddingTop={4}>
                      <SubmitButton
                        size="large"
                        fullWidth
                        label={!isSubmitting ? t('Next') : t('Submitting')}
                      />
                    </Box>
                  </Form>
                )
              }}
            </Formik>
          </Box>
        </Paper>
      </Box>
    </Page>
  ));
});


export default withAuthentication(FirstAccess);






