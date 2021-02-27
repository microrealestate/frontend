import { useObserver } from 'mobx-react-lite'
import { useContext, useState } from 'react'
import getConfig from 'next/config';
import { withTranslation } from 'next-i18next'
import { Paper, Tab, Tabs, Typography } from '@material-ui/core'

import Page from '../../components/Page'
import { withAuthentication } from '../../components/Authentication'
import OrganizationSettings from '../../components/OrganizationForms/Settings'
import OrganizationBilling from '../../components/OrganizationForms/Billing'
import OrganizationMembers from '../../components/OrganizationForms/Members'
import OrganizationNotification from '../../components/OrganizationForms/Notification'
import RequestError from '../../components/RequestError'
import { TabPanel } from '../../components/Tabs';
import { StoreContext } from '../../store'

const { publicRuntimeConfig: { BASE_PATH } } = getConfig();

const Settings = withTranslation()(({ t }) => {
  const store = useContext(StoreContext);
  const [error, setError] = useState('');
  const [tabSelected, setTabSelected] = useState(0);

  const onTabChange = (event, newValue) => {
    setTabSelected(newValue);
  };

  const onSubmit = async (orgPart) => {
    if (!store.user.isAdministrator) {
      return;
    }

    const previousName = store.organization.selected.name;
    const organization = {
      ...store.organization.selected,
      ...orgPart
    };
    const newName = organization.name;

    setError('');

    const { status, data: updatedOrganization } = await store.organization.update(organization);
    if (status !== 200) {
      switch (status) {
        case 422:
          return setError(t('Some fields are missing.'));
        case 403:
          return setError(t('You are not allowed to update the settings.'))
        case 409:
          return setError(t('The organization name already exists.'))
        default:
          return setError(t('Something went wrong'));
      };
    }

    store.organization.setSelected(updatedOrganization, store.user);
    store.organization.setItems([
      ...store.organization.items.filter(({ _id }) => _id !== updatedOrganization._id),
      updatedOrganization
    ]);

    if (newName !== previousName) {
      window.location.assign(`${BASE_PATH}/${store.organization.selected.name}/settings`);
    }
  }

  return useObserver(() => (
    <Page>
      <RequestError error={error} />
      <Paper>
        <Tabs
          variant="scrollable"
          value={tabSelected}
          onChange={onTabChange}
          aria-label="Vertical tabs example"
        >
          <Tab label={t('Settings')} />
          <Tab label={t('Billing')} />
          <Tab label={t('Manage access')} />
          <Tab label={t('Notifications')} />
        </Tabs>
        <TabPanel value={tabSelected} index={0}>
          <Typography variant="h5">
            {t('Settings')}
            <OrganizationSettings submitLabel={t('Setup settings')} submitFullWidth={false} onSubmit={onSubmit} />
          </Typography>
        </TabPanel>
        <TabPanel value={tabSelected} index={1}>
          <Typography variant="h5">
            {t('Billing information')}
            <OrganizationBilling onSubmit={onSubmit} />
          </Typography>
        </TabPanel>
        <TabPanel value={tabSelected} index={2}>
          <Typography variant="h5">
            {t('Manage access')}
            <OrganizationMembers onSubmit={onSubmit} />
          </Typography>
        </TabPanel>
        <TabPanel value={tabSelected} index={3}>
          <Typography variant="h5">
            {t('Notifications')}
            <OrganizationNotification onSubmit={onSubmit} />
          </Typography>
        </TabPanel>
      </Paper>
    </Page>
  ))
});

export default withAuthentication(Settings);

