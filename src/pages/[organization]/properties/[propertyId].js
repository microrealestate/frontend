import moment from 'moment';
import { Children, memo, useCallback, useContext, useMemo, useState } from 'react';
import { observer } from 'mobx-react-lite'
import { toJS } from 'mobx';
import { withTranslation } from 'next-i18next';
import { Box, Breadcrumbs, Button, Grid, Hidden, List, ListItem, ListItemAvatar, ListItemText, makeStyles, Paper, Tab, Tabs, Typography, withStyles } from '@material-ui/core';
import HistoryIcon from '@material-ui/icons/History';
import DeleteIcon from '@material-ui/icons/Delete';
import WarningIcon from '@material-ui/icons/ReportProblemOutlined';
import VpnKeyIcon from '@material-ui/icons/VpnKey';

import Page from '../../../components/Page'
import { withAuthentication } from '../../../components/Authentication'
import { getStoreInstance, StoreContext } from '../../../store';
import { isServer } from '../../../utils';
import Link from '../../../components/Link';
import RequestError from '../../../components/RequestError';
import { TabPanel } from '../../../components/Tabs';
import { CardRow, DashboardCard } from '../../../components/Cards';
import { NumberFormat } from '../../../utils/numberformat';
import { useRouter } from 'next/router';
import ConfirmDialog from '../../../components/ConfirmDialog';
import PropertyForm from '../../../components/properties/PropertyForm';
import Map from '../../../components/Map';
import TenantAvatar from '../../../components/tenants/TenantAvatar';

const BreadcrumbBar = memo(withTranslation()(({ t, backPath }) => {
  const store = useContext(StoreContext);

  return (
    <Breadcrumbs aria-label="breadcrumb">
      <Link color="inherit" href={backPath}>
        {t('Properties')}
      </Link>
      <Typography variant="h6" noWrap>{store.property.selected.name}</Typography>
    </Breadcrumbs>
  );
}));

const PropertyOverview = withTranslation()(observer(({ t }) => {
  const store = useContext(StoreContext);
  return (
    <>
      <CardRow>
        <Typography
          color="textSecondary"
          noWrap
        >
          {store.property.selected.name}
        </Typography>
        <NumberFormat
          color="textSecondary"
          value={store.property.selected.price}
          noWrap
        />
      </CardRow>
      <Map address={store.property.selected.address} />
    </>
  );
}));

const useStyles = makeStyles((theme) => ({
  root: {
    overflow: 'auto',
    maxHeight: 601,
  }
}));

const OccupancyHistory = withTranslation()(({ t }) => {
  const store = useContext(StoreContext);
  const classes = useStyles();
  return (
    <List className={classes.root}>
      { !!store.property.selected?.occupancyHistory?.length ? (
        Children.toArray(store.property.selected.occupancyHistory.map(occupant => {
          const occupationDates = t('{{beginDate}} to {{endDate}}', {
            beginDate: moment(occupant.beginDate, 'DD/MM/YYYY').format('LL'),
            endDate: moment(occupant.endDate, 'DD/MM/YYYY').format('LL')
          });
          return (
            <ListItem>
              <ListItemAvatar>
                <TenantAvatar tenant={occupant} />
              </ListItemAvatar>
              <ListItemText primary={occupant.name} secondary={occupationDates} />
            </ListItem>
          )
        }))
      ) : (
        <Typography color="textSecondary">{t('Property not rented so far')}</Typography>
      )}
    </List>
  );
});

const Property = withTranslation()(observer(({ t }) => {
  console.log('Property functional component')
  const store = useContext(StoreContext);
  const router = useRouter();
  const [error, setError] = useState('');

  const [tabSelected, setTabSelected] = useState(0);
  const [openConfirmDeleteProperty, setOpenConfirmDeleteProperty] = useState(false);

  const onTabChange = useCallback((event, newValue) => {
    setTabSelected(newValue);
  }, []);

  const backPath = useMemo(() => {
    let backPath = `/${store.organization.selected.name}/properties`;
    if (store.property.filters.searchText || store.property.filters.status) {
      backPath = `${backPath}?search=${encodeURIComponent(store.property.filters.searchText)}&status=${encodeURIComponent(store.property.filters.status)}`
    }
    return backPath;
  }, [store.organization.selected, store.property.filters]);

  const onConfirmDeleteProperty = useCallback(() => {
    setOpenConfirmDeleteProperty(true);
  }, []);

  const onDeleteProperty = useCallback(async () => {
    setError('');

    const { status } = await store.property.delete([store.property.selected._id]);
    if (status !== 200) {
      switch (status) {
        case 422:
          return setError(t('Property cannot be deleted.'));
        case 404:
          return setError(t('Property does not exist.'));
        case 403:
          return setError(t('You are not allowed to delete the Property.'))
        default:
          return setError(t('Something went wrong'));
      };
    }

    await router.push(backPath);
  }, []);

  const onSubmit = useCallback(async (propertyPart) => {
    let property = {
      ...toJS(store.property.selected),
      ...propertyPart,
      price: propertyPart.rent
    };

    setError('');

    if (property._id) {
      const { status, data } = await store.property.update(property);
      if (status !== 200) {
        switch (status) {
          case 422:
            return setError(t('Property name is missing.'));
          case 403:
            return setError(t('You are not allowed to update the property.'))
          default:
            return setError(t('Something went wrong'));
        };
      }
      store.property.setSelected(data);
    } else {
      const { status, data } = await store.property.create(property);
      if (status !== 200) {
        switch (status) {
          case 422:
            return setError(t('Property name is missing.'));
          case 403:
            return setError(t('You are not allowed to create a property.'))
          case 409:
            return setError(t('The property already exists.'))
          default:
            return setError(t('Something went wrong'));
        };
      }
      store.property.setSelected(data);
      await router.push(`/${store.organization.selected.name}/properties/${data._id}`);
    }
  }, []);

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
              startIcon={<DeleteIcon />}
              onClick={onConfirmDeleteProperty}
            >
              {t('Delete')}
            </Button>
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
              aria-label="Property tabs"
            >
              <Tab label={t('Property')} />
            </Tabs>
            <TabPanel value={tabSelected} index={0}>
              <PropertyForm onSubmit={onSubmit} />
            </TabPanel>
          </Paper>
        </Grid>

        <Hidden smDown>
          <Grid item md={4}>
            <Box pb={2}>
              <DashboardCard
                Icon={VpnKeyIcon}
                title={t('Property')}
              >
                <PropertyOverview />
              </DashboardCard>
            </Box>
            <DashboardCard
              Icon={HistoryIcon}
              title={t('Occupancy history')}
            >
              <OccupancyHistory />
            </DashboardCard>
          </Grid>
        </Hidden>

      </Grid>
      <ConfirmDialog
        open={openConfirmDeleteProperty}
        setOpen={setOpenConfirmDeleteProperty}
        onConfirm={onDeleteProperty}
      >
        <Box display="flex" alignItems="center">
          <Box pr={1}>
            <WarningIcon fontSize="large" color="secondary" />
          </Box>
          <Typography variant="h6">{t('Are you sure to definitely remove this property?')}</Typography>
        </Box>
        <Box py={2}>
          <Typography variant="h6" align="center">{store.property.selected.name}</Typography>
        </Box>
      </ConfirmDialog>
    </Page>
  )
}));

Property.getInitialProps = async (context) => {
  console.log('Property.getInitialProps')
  const store = isServer() ? context.store : getStoreInstance();
  const propertyId = isServer() ? context.query.propertyId : store.property.selected._id;

  const response = await store.property.fetch();

  if (response.status !== 200) {
    return { error: { statusCode: response.status } };
  }

  store.property.setSelected(store.property.items.find(({ _id }) => _id === propertyId));

  const props = {
    initialState: {
      store: toJS(store)
    }
  };
  return props;
};

export default withAuthentication(Property);