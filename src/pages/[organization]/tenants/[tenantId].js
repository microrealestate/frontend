import { useContext, useState } from 'react';
import { useObserver } from 'mobx-react-lite'
import { toJS } from 'mobx';
import { withTranslation } from 'next-i18next';
import { Box, Breadcrumbs, Grid, Hidden, Tab, Tabs, Typography } from '@material-ui/core';
import HistoryIcon from '@material-ui/icons/History';

import Page from '../../../components/Page'
import { withAuthentication } from '../../../components/Authentication'
import { getStoreInstance, StoreContext } from '../../../store';
import { isServer } from '../../../utils';
import Link from '../../../components/Link';
import FullScreenDialogButton from '../../../components/FullScreenDialogButton';
import RequestError from '../../../components/RequestError';
import PaymentHistory from '../../../components/PaymentHistory';
import { StyledTab, StyledTabs, TabPanel } from '../../../components/Tabs';
import ReceiptIcon from '@material-ui/icons/Receipt';
import { DashboardCard } from '../../../components/Cards';

const BreadcrumbBar = withTranslation()(({ t, backPath }) => {
  const store = useContext(StoreContext);

  return (
    <Breadcrumbs aria-label="breadcrumb">
      <Link color="inherit" href={backPath}>
        {t('Tenants')}
      </Link>
      <Typography variant="h6" noWrap>{store.tenant.selected.name}</Typography>
    </Breadcrumbs>
  );
});

const Tenant = withTranslation()(({ t }) => {
  console.log('Tenant functional component')
  const store = useContext(StoreContext);
  const [error, setError] = useState('');
  const [tabSelected, setTabSelected] = useState(0);

  const onTabChange = (event, newValue) => {
    setTabSelected(newValue);
  };

  //TODO manage errors

  let backPath = `/${store.organization.selected.name}/tenants`;
  if (store.tenant.filters.searchText || store.tenant.filters.status) {
    backPath = `${backPath}?search=${encodeURIComponent(store.tenant.filters.searchText)}&status=${encodeURIComponent(store.tenant.filters.status)}`
  }

  return useObserver(() => (
    <Page
      PrimaryToolbar={
        <BreadcrumbBar backPath={backPath} />
      }
      SecondaryToolbar={
        <Box display="flex" width="100%" align="right">
          <Box mr={1.5}>
            <FullScreenDialogButton
              variant="contained"
              buttonLabel={t('Payments history')}
              startIcon={<HistoryIcon />}
              dialogTitle={t('Payments history')}
              cancelButtonLabel={t('Close')}
              showCancel
            >
              <PaymentHistory tenantId={store.tenant.selected._id} />
            </FullScreenDialogButton>
          </Box>
        </Box>
      }
    >
      <RequestError error={error} />
      <Grid container spacing={10}>
        <Grid item sm={12} md={8}>
          <Tabs
            variant="scrollable"
            value={tabSelected}
            onChange={onTabChange}
            aria-label="Vertical tabs example"
          >
            <Tab label={t('Tenant')} />
            <Tab label={t('Contract')} />
            <Tab label={t('Billing')} />
          </Tabs>
          <TabPanel value={tabSelected} index={0}>
            <Typography variant="h5">
              {t('Tenant')}
            </Typography>
          </TabPanel>
          <TabPanel value={tabSelected} index={1}>
            <Typography variant="h5">
              {t('Contract')}
            </Typography>
          </TabPanel>
          <TabPanel value={tabSelected} index={2}>
            <Typography variant="h5">
              {t('Billing information')}
            </Typography>
          </TabPanel>
        </Grid>
        <Hidden smDown>
          <Grid item md={4}>
            <DashboardCard
              Icon={ReceiptIcon}
              title={t('Rental')}
            >
            </DashboardCard>
          </Grid>
        </Hidden>
      </Grid>
    </Page>
  ))
});

Tenant.getInitialProps = async (context) => {
  console.log('Tenant.getInitialProps')
  const store = isServer() ? context.store : getStoreInstance();

  if (isServer()) {
    const { tenantId } = context.query;

    const response = await store.tenant.fetchOne(tenantId);
    if (response.status !== 200) {
      // TODO check error code to show a more detail error message
      return { error: { statusCode: 500 } };
    }

    store.tenant.setSelected(response.data);
  }

  const props = {
    initialState: {
      store: toJS(store)
    }
  };
  return props;
};

export default withAuthentication(Tenant);