import { Box, Paper, Typography } from '@material-ui/core';
import { getStoreInstance, StoreContext } from '../store';
import { isServer, redirect } from '../utils';
import React, { useContext, useState } from 'react';

import Landlord from '../components/organization/LandlordForm';
import { observer } from 'mobx-react-lite';
import Page from '../components/Page';
import RequestError from '../components/RequestError';
import { toJS } from 'mobx';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { withAuthentication } from '../components/Authentication';

const FirstAccess = observer(() => {
  const { t } = useTranslation('common');
  const [error, setError] = useState('');
  const store = useContext(StoreContext);
  const router = useRouter();

  const onSubmit = async (organization) => {
    try {
      setError('');

      // set current user as administrator of the org
      organization.members = [
        {
          name: `${store.user.firstName} ${store.user.lastName}`,
          email: store.user.email,
          role: 'administrator',
          registered: true,
        },
      ];

      const { status, data } = await store.organization.create(organization);
      if (status !== 200) {
        switch (status) {
          default:
            setError(t('Something went wrong'));
            return;
        }
      }
      store.organization.setSelected(data, store.user);
      store.organization.setItems([data]);
    } catch (error) {
      console.error(error);
      setError(t('Something went wrong'));
    }
  };

  const onSubmitted = () => {
    router.push(
      `/${store.organization.selected.locale}/${store.organization.selected.name}/dashboard`
    );
  };

  return !store.organization.selected?.name ? (
    <Page maxWidth="sm">
      <Box py={2}>
        <Typography component="h1" variant="h4" align="center">
          {t('Welcome {{firstName}} {{lastName}}!', {
            firstName: store.user.firstName,
            lastName: store.user.lastName,
          })}
        </Typography>
      </Box>
      <Box pb={4}>
        <Typography variant="subtitle2" align="center" color="textSecondary">
          {t('One more step, tell us who will rent the properties')}
        </Typography>
      </Box>
      <Paper>
        <Box px={4} pb={4} pt={2}>
          <RequestError error={error} />
          <Landlord onSubmit={onSubmit} onSubmitted={onSubmitted} />
        </Box>
      </Paper>
    </Page>
  ) : null;
});

FirstAccess.getInitialProps = async (context) => {
  console.log('FirstAccess.getInitialProps');
  const store = isServer() ? context.store : getStoreInstance();

  if (isServer()) {
    if (store.organization.selected?.name) {
      redirect(context, `/${store.organization.selected.name}/dashboard`);
      return {};
    }
  }

  const props = {
    initialState: {
      store: toJS(store),
    },
  };
  return props;
};

export default withAuthentication(FirstAccess);
