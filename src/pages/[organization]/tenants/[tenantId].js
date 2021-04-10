import moment from 'moment';
import { memo, useCallback, useContext, useMemo, useState } from 'react';
import { observer } from 'mobx-react-lite'
import { toJS } from 'mobx';
import { withTranslation } from 'next-i18next';
import { Box, Breadcrumbs, Button, Divider, Grid, Hidden, Paper, Tab, Tabs, Tooltip, Typography, withStyles } from '@material-ui/core';
import HistoryIcon from '@material-ui/icons/History';
import ReceiptIcon from '@material-ui/icons/Receipt';
import SubjectIcon from '@material-ui/icons/Subject';
import DeleteIcon from '@material-ui/icons/Delete';
import StopIcon from '@material-ui/icons/Stop';
import WarningIcon from '@material-ui/icons/ReportProblemOutlined';
import EditIcon from '@material-ui/icons/Edit';

import Page from '../../../components/Page'
import { withAuthentication } from '../../../components/Authentication'
import { getStoreInstance, StoreContext } from '../../../store';
import { isServer } from '../../../utils';
import Link from '../../../components/Link';
import FullScreenDialogButton from '../../../components/FullScreenDialogButton';
import RequestError from '../../../components/RequestError';
import RentHistory from '../../../components/rents/RentHistory';
import { TabPanel } from '../../../components/Tabs';
import { CardRow, DashboardCard } from '../../../components/Cards';
import { NumberFormat } from '../../../utils/numberformat';
import TenantForm from '../../../components/TenantForms/TenantForm';
import BillingForm from '../../../components/TenantForms/BillingForm';
import LeaseContractForm from '../../../components/TenantForms/LeaseContractForm';
import { useRouter } from 'next/router';
import ConfirmDialog from '../../../components/ConfirmDialog';
import TerminateLeaseDialog from '../../../components/TenantForms/TerminateLeaseDialog';

const BreadcrumbBar = memo(withTranslation()(({ t, backPath }) => {
  const store = useContext(StoreContext);

  return (
    <Breadcrumbs aria-label="breadcrumb">
      <Link color="inherit" href={backPath}>
        {t('Tenants')}
      </Link>
      <Typography variant="h6" noWrap>{store.tenant.selected.name}</Typography>
    </Breadcrumbs>
  );
}));

const WarningTypography = withStyles(theme => {
  return {
    root: {
      color: theme.palette.warning.dark
    }
  };
})(Typography);

const ContractOverview = withTranslation()(({ t }) => {
  const store = useContext(StoreContext);
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
          {store.tenant.selected.contract}
        </Typography>
      </CardRow>
      <CardRow>
        <Typography
          color="textSecondary"
          noWrap
        >
          {t('Status')}
        </Typography>
        {store.tenant.selected.terminated ? (
          <WarningTypography
            color="textSecondary"
            noWrap
          >
            {t('Terminated')}
          </WarningTypography>
        ) : (
          <Typography
            color="textSecondary"
            noWrap
          >
            {t('In progress')}
          </Typography>
        )}
      </CardRow>
      {store.tenant.selected.beginDate && (
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
            {useMemo(() => moment(store.tenant.selected.beginDate, 'DD/MM/YYYY').format('L'), [])}
          </Typography>
        </CardRow>
      )}
      {(store.tenant.selected.terminationDate || store.tenant.selected.endDate) && (
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
            {useMemo(() => moment(store.tenant.selected.terminationDate || store.tenant.selected.endDate, 'DD/MM/YYYY').format('L'), [])}
          </Typography>
        </CardRow>
      )}
      <CardRow>
        <Typography
          color="textSecondary"
          noWrap
        >
          {t('Deposit')}
        </Typography>
        <NumberFormat
          color="textSecondary"
          value={store.tenant.selected.guaranty}
          noWrap
        />
      </CardRow>
    </>
  );
});

const RentOverview = withTranslation()(({ t }) => {
  const store = useContext(StoreContext);
  return (
    <>
      <NumberFormat align="right" variant="h5" value={store.tenant.selected.total} />
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
          value={store.tenant.selected.rental}
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
          value={store.tenant.selected.expenses}
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
          value={store.tenant.selected.discount ? store.tenant.selected.discount * -1 : store.tenant.selected.discount}
          noWrap
        />
      </CardRow>
      {store.tenant.selected.isVat && (
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
              value={store.tenant.selected.preTaxTotal}
              noWrap
            />
          </CardRow>
          <CardRow>
            <Typography
              color="textSecondary"
              noWrap
            >
              {t('VAT')}
            </Typography>
            <NumberFormat
              color="textSecondary"
              value={store.tenant.selected.vat}
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
          value={store.tenant.selected.total}
          noWrap
        />
      </CardRow>

    </>
  );
});

const Tenant = withTranslation()(observer(({ t }) => {
  console.log('Tenant functional component')
  const store = useContext(StoreContext);
  const router = useRouter();
  const [readOnly, setReadOnly] = useState(!!(store.tenant.selected.terminated || store.tenant.selected.properties?.length));
  const [error, setError] = useState('');

  const [tabSelected, setTabSelected] = useState(0);
  const [openTerminateLease, setOpenTerminateLease] = useState(false);
  const [openConfirmDeleteTenant, setOpenConfirmDeleteTenant] = useState(false);
  const [openConfirmEditTenant, setOpenConfirmEditTenant] = useState(false);

  const onTabChange = useCallback((event, newValue) => {
    setTabSelected(newValue);
  }, []);

  const backPath = useMemo(() => {
    let backPath = `/${store.organization.selected.name}/tenants`;
    if (store.tenant.filters.searchText || store.tenant.filters.status) {
      backPath = `${backPath}?search=${encodeURIComponent(store.tenant.filters.searchText)}&status=${encodeURIComponent(store.tenant.filters.status)}`
    }
    return backPath;
  }, [store.organization.selected, store.tenant.filters]);

  const onOpenTerminateLease = useCallback(() => {
    setOpenTerminateLease(true);
  }, []);

  const onConfirmDeleteTenant = useCallback(() => {
    setOpenConfirmDeleteTenant(true);
  }, []);

  const onDeleteTenant = useCallback(async () => {
    setError('');

    const { status } = await store.tenant.delete([store.tenant.selected._id]);
    if (status !== 200) {
      switch (status) {
        case 422:
          return setError(t('Tenant cannot be deleted because some rents have been paid.'));
        case 404:
          return setError(t('Tenant does not exist.'));
        case 403:
          return setError(t('You are not allowed to delete the tenant.'))
        default:
          return setError(t('Something went wrong'));
      };
    }

    await router.push(backPath);
  }, []);

  const onConfirmEditTenant = useCallback(() => {
    setOpenConfirmEditTenant(true);
  }, []);

  const onEditTenant = useCallback(async () => {
    setReadOnly(false);
  }, []);

  const onSubmit = useCallback(async (tenantPart) => {
    let tenant = toJS(store.tenant.selected);

    tenant.properties = tenant.properties || [];
    tenant = {
      isCompany: false,
      isVat: false,
      ...tenant,
      properties: tenant.properties.map(({ propertyId, entryDate, exitDate }) => ({ propertyId, entryDate, exitDate })),
      ...tenantPart
    }

    setError('');

    if (tenant._id) {
      const { status, data } = await store.tenant.update(tenant);
      if (status !== 200) {
        switch (status) {
          case 422:
            return setError(t('Tenant name is missing.'));
          case 403:
            return setError(t('You are not allowed to update the tenant.'))
          default:
            return setError(t('Something went wrong'));
        };
      }
      store.tenant.setSelected(data);
    } else {
      const { status, data } = await store.tenant.create(tenant);
      if (status !== 200) {
        switch (status) {
          case 422:
            return setError(t('Tenant name is missing.'));
          case 403:
            return setError(t('You are not allowed to create a tenant.'))
          case 409:
            return setError(t('The tenant already exists.'))
          default:
            return setError(t('Something went wrong'));
        };
      }
      store.tenant.setSelected(data);
      await router.push(`/${store.organization.selected.name}/tenants/${data._id}`);
    }
  }, []);

  const showTerminateLeaseButton = useMemo(() => !!(store.tenant.selected.beginDate && store.tenant.selected.endDate && !store.tenant.selected.terminationDate), []);
  const disableEditButton = useMemo(() => !(!!store.tenant.selected.properties?.length && readOnly), []);

  return (
    <Page
      PrimaryToolbar={
        <BreadcrumbBar backPath={backPath} />
      }
      SecondaryToolbar={
        <Grid container spacing={2}>
          <Grid item>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={onConfirmEditTenant}
              disabled={disableEditButton}
            >
              {t('Edit')}
            </Button>
          </Grid>
          {showTerminateLeaseButton && (
            <Grid item>
              <Button
                variant="contained"
                startIcon={<StopIcon />}
                onClick={onOpenTerminateLease}
                disabled={store.tenant.selected.terminated}
              >
                {t('Terminate')}
              </Button>
            </Grid>
          )}
          <Grid item>
            <Tooltip title={store.tenant.selected.hasPayments ? t('This tenant cannot be deleted because some payments have been recorded.') : ''}>
              <span>
                <Button
                  variant="contained"
                  startIcon={<DeleteIcon />}
                  onClick={onConfirmDeleteTenant}
                  disabled={store.tenant.selected.hasPayments}
                >
                  {t('Delete')}
                </Button>
              </span>
            </Tooltip>
          </Grid>
          <Grid item>
            <Tooltip title={!!!store.tenant.selected.properties ? t('Contract details not filled.') : ''}>
              <span>
                <FullScreenDialogButton
                  variant="contained"
                  buttonLabel={t('Rents')}
                  startIcon={<HistoryIcon />}
                  dialogTitle={t('Rents history')}
                  cancelButtonLabel={t('Close')}
                  showCancel
                  disabled={!!!store.tenant.selected.properties}
                >
                  <RentHistory tenantId={store.tenant.selected._id} />
                </FullScreenDialogButton>
              </span>
            </Tooltip>
          </Grid>
        </Grid>
      }
    >
      < RequestError error={error} />
      <Grid container spacing={5}>
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
              <TenantForm tenant={store.tenant.selected} onSubmit={onSubmit} readOnly={readOnly} />
            </TabPanel>
            <TabPanel value={tabSelected} index={1}>
              <LeaseContractForm tenant={store.tenant.selected} onSubmit={onSubmit} readOnly={readOnly} />
            </TabPanel>
            <TabPanel value={tabSelected} index={2}>
              <BillingForm tenant={store.tenant.selected} onSubmit={onSubmit} readOnly={readOnly} />
            </TabPanel>
          </Paper>
        </Grid>
        {!!store.tenant.selected.properties && (
          <Hidden smDown>
            <Grid item md={4}>
              <Box pb={2}>
                <DashboardCard
                  Icon={SubjectIcon}
                  title={t('Lease')}
                >
                  <ContractOverview />
                </DashboardCard>
              </Box>
              <DashboardCard
                Icon={ReceiptIcon}
                title={t('Rental')}
              >
                <RentOverview />
              </DashboardCard>
            </Grid>
          </Hidden>
        )}
      </Grid>
      <TerminateLeaseDialog
        open={openTerminateLease}
        setOpen={setOpenTerminateLease}
      />
      <ConfirmDialog
        open={openConfirmEditTenant}
        setOpen={setOpenConfirmEditTenant}
        onConfirm={onEditTenant}
      >
        <Box display="flex" alignItems="center">
          <Box pr={1}>
            <WarningIcon fontSize="large" color="secondary" />
          </Box>
          <Typography variant="h6">
            {store.tenant.selected.terminated ? t('Lease terminated on {{terminationDate}}', {
              terminationDate: moment(store.tenant.selected.terminationDate, 'DD/MM/YYYY').format('LL')
            }) : t('Lease is in progress')}
          </Typography>
        </Box>
        <Box py={2}>
          <Typography variant="body2">
            {t('Modifying this information might break the contract signed with the tenant.')}
          </Typography>
        </Box>
        <Typography variant="body2">
          {t('Continue editing?')}
        </Typography>
      </ConfirmDialog>
      <ConfirmDialog
        open={openConfirmDeleteTenant}
        setOpen={setOpenConfirmDeleteTenant}
        onConfirm={onDeleteTenant}
      >
        <Box display="flex" alignItems="center">
          <Box pr={1}>
            <WarningIcon fontSize="large" color="secondary" />
          </Box>
          <Typography variant="h6">{t('Are you sure to definitely remove this tenant?')}</Typography>
        </Box>
        <Box py={2}>
          <Typography variant="h6" align="center">{store.tenant.selected.name}</Typography>
        </Box>
      </ConfirmDialog>
    </Page>
  )
}));

Tenant.getInitialProps = async (context) => {
  console.log('Tenant.getInitialProps')
  const store = isServer() ? context.store : getStoreInstance();
  const tenantId = isServer() ? context.query.tenantId : store.tenant.selected._id;

  const responses = await Promise.all([
    store.tenant.fetchOne(tenantId),
    store.property.fetch(),
    store.leaseType.fetch()
  ]);

  const statuses = responses.map(({ status }) => status);

  if (statuses.every(status => status !== 200)) {
    return { error: { statusCode: statuses.find(status => status !== 200) } };
  }

  store.tenant.setSelected(responses[0].data);

  const props = {
    initialState: {
      store: toJS(store)
    }
  };
  return props;
};

export default withAuthentication(Tenant);