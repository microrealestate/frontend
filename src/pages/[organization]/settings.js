import { toJS } from 'mobx';
import { observer } from 'mobx-react-lite';
import { useCallback, useContext, useState } from 'react';
import getConfig from 'next/config';
import useTranslation from 'next-translate/useTranslation';
import { Paper, Tab, Tabs } from '@material-ui/core';

import Page from '../../components/Page';
import { withAuthentication } from '../../components/Authentication';
import LandlordForm from '../../components/organization/LandlordForm';
import BillingForm from '../../components/organization/BillingForm';
import Members from '../../components/organization/Members';
import Leases from '../../components/organization/Leases';
import RequestError from '../../components/RequestError';
import { TabPanel } from '../../components/Tabs';
import { getStoreInstance, StoreContext } from '../../store';
import { isServer } from '../../utils';
import ThirdPartiesForm from '../../components/organization/ThirdPartiesForm';

const {
  publicRuntimeConfig: { BASE_PATH },
} = getConfig();

const Settings = observer(() => {
  const { t } = useTranslation('common');
  const store = useContext(StoreContext);
  const [error, setError] = useState('');
  const [tabSelected, setTabSelected] = useState(0);

  const onTabChange = useCallback((event, newValue) => {
    setTabSelected(newValue);
  }, []);

  const onSubmit = useCallback(async (orgPart) => {
    if (!store.user.isAdministrator) {
      return;
    }

    const previousName = store.organization.selected.name;
    const organization = {
      ...store.organization.selected,
      ...orgPart,
    };
    const newName = organization.name;

    setError('');

    const { status, data: updatedOrganization } =
      await store.organization.update(organization);
    if (status !== 200) {
      switch (status) {
        case 422:
          return setError(t('Some fields are missing'));
        case 403:
          return setError(t('You are not allowed to update the settings'));
        case 409:
          return setError(t('The organization name already exists'));
        default:
          return setError(t('Something went wrong'));
      }
    }

    store.organization.setSelected(updatedOrganization, store.user);
    store.organization.setItems([
      ...store.organization.items.filter(
        ({ _id }) => _id !== updatedOrganization._id
      ),
      updatedOrganization,
    ]);

    if (newName !== previousName) {
      window.location.assign(
        `${BASE_PATH}/${store.organization.selected.locale}/${store.organization.selected.name}/settings`
      );
    }
  }, []);

  return (
    <Page>
      <RequestError error={error} />
      <Paper>
        <Tabs
          variant="scrollable"
          value={tabSelected}
          onChange={onTabChange}
          aria-label="Vertical tabs example"
        >
          <Tab label={t('Landlord')} />
          <Tab label={t('Billing')} />
          <Tab label={t('Leases')} />
          <Tab label={t('Manage access')} />
          <Tab label={t('Third-parties')} />
        </Tabs>
        <TabPanel value={tabSelected} index={0}>
          <LandlordForm onSubmit={onSubmit} />
        </TabPanel>
        <TabPanel value={tabSelected} index={1}>
          <BillingForm onSubmit={onSubmit} />
        </TabPanel>
        <TabPanel value={tabSelected} index={2}>
          <Leases setError={setError} />
        </TabPanel>
        <TabPanel value={tabSelected} index={3}>
          <Members onSubmit={onSubmit} />
        </TabPanel>
        <TabPanel value={tabSelected} index={4}>
          <ThirdPartiesForm onSubmit={onSubmit} />
        </TabPanel>
      </Paper>
    </Page>
  );
});

Settings.getInitialProps = async (context) => {
  console.log('Settings.getInitialProps');
  const store = isServer() ? context.store : getStoreInstance();

  const { status } = await store.lease.fetch();
  if (status !== 200) {
    return { error: { statusCode: status } };
  }

  return {
    initialState: {
      store: toJS(store),
    },
  };
};

export default withAuthentication(Settings);
