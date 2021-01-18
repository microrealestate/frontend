import React, { useContext, useState } from 'react';
import getConfig from 'next/config'
import { useObserver } from 'mobx-react-lite';
import { Typography, Box, Paper, Collapse } from '@material-ui/core';
import LocationCityIcon from '@material-ui/icons/LocationCity';

import { withTranslation } from '../utils/i18n';
import { withAuthentication } from '../components/Authentication';
import { getStoreInstance, StoreContext } from '../store';
import Page from '../components/Page';
import IconTypography from '../components/IconTypography';
import { useRouter } from 'next/router';
import { isServer, redirect } from '../utils';
import RequestError from '../components/RequestError';
import OrganizationSettings from '../components/OrganizationForms/Settings';

const FirstAccess = withTranslation()(({ t }) => {
  const { publicRuntimeConfig: { APP_NAME } } = getConfig();
  const [error, setError] = useState('');
  const store = useContext(StoreContext);
  const router = useRouter();

  const onSubmit = async (organization) => {
    try {
      setError('');

      // set current user as administrator of the org
      organization.members = [{
        name: `${store.user.firstName} ${store.user.lastName}`,
        email: store.user.email,
        role: 'administrator',
        registered: true
      }];

      const { status, data } = await store.organization.create(organization);
      if (status !== 200) {
        switch (status) {
          default:
            setError(t('Something went wrong :('));
            return;
        };
      }
      store.organization.setSelected(data, store.user);
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
            {t('One more step. Tell us who will rent the properties')}
          </Typography>
        </Box>
        <Paper>
          <Box px={4} pb={4} pt={2}>
            <RequestError error={error} />
            <OrganizationSettings submitLabel={t('Next')} onSubmit={onSubmit} />
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






