import React, { useContext, useState } from 'react';
import getConfig from 'next/config'
import { useObserver } from 'mobx-react-lite';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import { Typography, Box, Paper, Collapse } from '@material-ui/core';
import LocationCityIcon from '@material-ui/icons/LocationCity';

import { FormTextField, SubmitButton, RadioFieldGroup, RadioField, SelectField } from '../components/Form';
import { withTranslation } from '../utils/i18n';
import { withAuthentication } from '../components/Authentication';
import { StoreContext } from '../store';
import Page from '../components/Page';
import IconTypography from '../components/IconTypography';
import Alert from '@material-ui/lab/Alert';
import cc from 'currency-codes';
import getSymbolFromCurrency from 'currency-symbol-map'
import { useRouter } from 'next/router';
import { isServer, redirect } from '../utils';

const initialValues = {
  name: '',
  locale: 'en',
  currency: 'EUR',
  isCompany: 'false',
  company: '',
  email: ''
};

const validationSchema = Yup.object().shape({
  name: Yup.string().required(),
  locale: Yup.string().required(),
  currency: Yup.string().required(),
  isCompany: Yup.string().required(),
  company: Yup.mixed().when('isCompany', {
    is: 'true',
    then: Yup.string().required(),
    otherwise: Yup.string()
  }),
  email: Yup.mixed().when('isCompany', {
    is: 'true',
    then: Yup.string().email().required(),
    otherwise: Yup.string().email()
  })
});

const currencies = cc.data.reduce((acc, { code, currency }) => {
  const symbol = getSymbolFromCurrency(code);
  if (symbol) {
    acc.push({
      code,
      currency,
      symbol
    })
  }
  return acc
}, []).sort((c1, c2) => c1.currency.localeCompare(c2.currency));

const FirstAccess = withTranslation()(({ t }) => {
  const { publicRuntimeConfig: { APP_NAME } } = getConfig();
  const store = useContext(StoreContext);
  const [error, setError] = useState('');
  const router = useRouter();

  const onSubmit = async (organization, actions) => {
    try {
      organization.isCompany = organization.isCompany === 'true';
      const { status, data } = await store.organization.create({
        ...organization,
        company: organization.isCompany ? organization.company : '',
        email: organization.isCompany ? organization.email : store.user.email,
        administrator: store.user.email
      });
      if (status !== 200) {
        switch (status) {
          default:
            setError(t('Something went wrong :('));
            return;
        };
      }
      store.organization.setSelected(data);
      router.push(`${store.organization.selected.name}/dashboard`);
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
            {t('One more step. Tell us who will rent your properties')}
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
                      <SelectField
                        label={t('Language')}
                        name="locale"
                        values={[
                          { id: 'pt-BR', label: 'Brasileiro', value: 'pt-BR' },
                          { id: 'en', label: 'English', value: 'en' },
                          { id: 'fr-FR', label: 'Français (France)', value: 'fr-FR' },
                        ]}
                      />
                      <SelectField
                        label={t('Currency')}
                        name="currency"
                        values={currencies.map(({ code, currency, symbol }) => (
                          { id: code, label: `${currency} (${symbol})`, value: code }
                        ))}
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


FirstAccess.getInitialProps = async (context) => {
  console.log('FirstAccess.getInitialProps')
  const store = isServer() ? context.store : getStoreInstance();

  if (isServer()) {
    if (store.organization.items) {
      redirect(context, `/${store.organization.selected.name}/dashboard`);
      return {};
    }
  }

  const props = {
    initialState: {
      store: JSON.parse(JSON.stringify(store))
    }
  };
  return props;
};



export default withAuthentication(FirstAccess);






