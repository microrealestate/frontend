import moment from 'moment';
import { useContext, useState } from 'react';
import { useObserver } from 'mobx-react-lite'
import { toJS } from 'mobx';
import { withTranslation } from 'next-i18next';
import { Box, Breadcrumbs, Divider, Grid, Hidden, Paper, Tab, Tabs, Typography } from '@material-ui/core';
import HistoryIcon from '@material-ui/icons/History';
import ReceiptIcon from '@material-ui/icons/Receipt';
import SubjectIcon from '@material-ui/icons/Subject';

import Page from '../../../components/Page'
import { withAuthentication } from '../../../components/Authentication'
import { getStoreInstance, StoreContext } from '../../../store';
import { isServer } from '../../../utils';
import Link from '../../../components/Link';
import FullScreenDialogButton from '../../../components/FullScreenDialogButton';
import RequestError from '../../../components/RequestError';
import PaymentHistory from '../../../components/PaymentHistory';
import { TabPanel } from '../../../components/Tabs';
import { CardRow, DashboardCard } from '../../../components/Cards';
import { NumberFormat } from '../../../utils/numberformat';

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

const ContractOverview = withTranslation()(({ t, tenant }) => {
  return (
    <>
      <CardRow>
        <Typography
          color="textSecondary"
          noWrap
        >
          {t('Type')}
        </Typography>
        <Typography
          color="textSecondary"
          noWrap
        >
          {tenant.contract}
        </Typography>
      </CardRow>
      <CardRow>
        <Typography
          color="textSecondary"
          noWrap
        >
          {t('Status')}
        </Typography>
        <Typography
          color="textSecondary"
          noWrap
        >
          {tenant.terminated ? t('Terminated') : t('In progress')}
        </Typography>
      </CardRow>
      <CardRow>
        <Typography
          color="textSecondary"
          noWrap
        >
          {t('Start date')}
        </Typography>
        <Typography
          color="textSecondary"
          noWrap
        >
          {moment(tenant.beginDate, 'DD/MM/YYYY').format('L')}
        </Typography>
      </CardRow>
      <CardRow>
        <Typography
          color="textSecondary"
          noWrap
        >
          {t('End date')}
        </Typography>
        <Typography
          color="textSecondary"
          noWrap
        >
          {moment(tenant.terminationDate || tenant.endDate, 'DD/MM/YYYY').format('L')}
        </Typography>
      </CardRow>
      <CardRow>
        <Typography
          color="textSecondary"
          noWrap
        >
          {t('Deposit')}
        </Typography>
        <NumberFormat
          color="textSecondary"
          value={tenant.guaranty}
          noWrap
        />
      </CardRow>
    </>
  );
});

const RentOverview = withTranslation()(({ t, tenant }) => {
  return (
    <>
      <NumberFormat align="right" variant="h5" value={tenant.total} />
      <Box py={1}>
        <Divider />
      </Box>
      <CardRow>
        <Typography
          color="textSecondary"
          noWrap
        >
          {t('Base')}
        </Typography>
        <NumberFormat
          color="textSecondary"
          value={tenant.rental}
          noWrap
        />
      </CardRow>
      <CardRow>
        <Typography
          color="textSecondary"
          noWrap
        >
          {t('Expenses')}
        </Typography>
        <NumberFormat
          color="textSecondary"
          value={tenant.expenses}
          noWrap
        />
      </CardRow>
      <CardRow>
        <Typography
          color="textSecondary"
          noWrap
        >
          {t('Discount')}
        </Typography>
        <NumberFormat
          color="textSecondary"
          value={tenant.discount ? tenant.discount * -1 : tenant.discount}
          noWrap
        />
      </CardRow>
      {tenant.isVat && (
        <>
          <Box pb={1}>
            <Divider />
          </Box>
          <CardRow>
            <Typography
              color="textSecondary"
              noWrap
            >
              {t('Pre-tax total')}
            </Typography>
            <NumberFormat
              color="textSecondary"
              value={tenant.preTaxTotal}
              noWrap
            />
          </CardRow>
          <CardRow>
            <Typography
              color="textSecondary"
              noWrap
            >
              {t('V.A.T.')}
            </Typography>
            <NumberFormat
              color="textSecondary"
              value={tenant.vat}
              noWrap
            />
          </CardRow>
        </>
      )}
      <Box pb={1}>
        <Divider />
      </Box>
      <CardRow>
        <Typography
          color="textSecondary"
          noWrap
        >
          {t('Total')}
        </Typography>
        <NumberFormat
          color="textSecondary"
          value={tenant.total}
          noWrap
        />
      </CardRow>

    </>
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
          <Paper>
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
          </Paper>
        </Grid>
        <Hidden smDown>
          <Grid item md={4}>
            <Box pb={2}>
              <DashboardCard
                Icon={SubjectIcon}
                title={t('Contract')}
              >
                <ContractOverview tenant={store.tenant.selected} />
              </DashboardCard>
            </Box>
            <DashboardCard
              Icon={ReceiptIcon}
              title={t('Rental')}
            >
              <RentOverview tenant={store.tenant.selected} />
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