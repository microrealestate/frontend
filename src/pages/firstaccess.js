import React, { useContext, useState } from 'react';
import { useRouter } from 'next/router';
import { observer } from 'mobx-react-lite';
import { toJS } from 'mobx';
import { Typography, Box, Paper } from '@material-ui/core';

import { withTranslation } from '../utils/i18n';
import { withAuthentication } from '../components/Authentication';
import { getStoreInstance, StoreContext } from '../store';
import Page from '../components/Page';
import { isServer, redirect } from '../utils';
import RequestError from '../components/RequestError';
import Landlord from '../components/organization/LandlordForm';

const FirstAccess = withTranslation()(
  observer(({ t }) => {
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
        router.push(`${store.organization.selected.name}/dashboard`);
      } catch (error) {
        console.error(error);
        setError(t('Something went wrong'));
      }
    };

    return (
      <Page maxWidth="sm">
        <Box paddingTop={2} paddingBottom={2}>
          <Typography component="h1" variant="h4" align="center">
            {t('Welcome {{firstName}} {{lastName}}!', {
              firstName: store.user.firstName,
              lastName: store.user.lastName,
            })}
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
            <Landlord onSubmit={onSubmit} />
          </Box>
        </Paper>
      </Page>
    );
  })
);

FirstAccess.getInitialProps = async (context) => {
  console.log('FirstAccess.getInitialProps');
  const store = isServer() ? context.store : getStoreInstance();

  if (isServer()) {
    if (store.organization.items) {
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
