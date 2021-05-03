import _ from 'lodash';
import moment from 'moment';
import { Children, memo, useCallback, useContext, useState } from 'react';
import { observer } from 'mobx-react-lite'
import { toJS } from 'mobx';
import { Box, Button, Chip, Grid, Hidden, List, ListItem, ListItemAvatar, ListItemText, makeStyles, Paper, Typography } from '@material-ui/core'

import { withAuthentication } from '../../../components/Authentication'
import Page from '../../../components/Page'
import { withTranslation } from '../../../utils/i18n';
import { getStoreInstance, StoreContext } from '../../../store';
import { isServer } from '../../../utils';
import SearchFilterBar from '../../../components/SearchFilterBar';
import { useRouter } from 'next/router';
import NewTenantDialog from '../../../components/TenantForms/NewTenantDialog';
import PropertyIcon from '../../../components/properties/PropertyIcon';
import TenantAvatar from '../../../components/TenantForms/TenantAvatar';

const useStyles = makeStyles((theme) => ({
  avatarInProgress: {
    backgroundColor: theme.palette.success.main
  },
  inProgress: {
    color: theme.palette.success.dark
  },
}));

const Properties = memo(({ tenant }) => {
  return (
    <Box display="flex" height="100%" alignItems="center" flexWrap="wrap">
      {Children.toArray(tenant.properties?.map(({ property }) => {

        return (
          <Box m={0.5}>
            <Chip
              icon={<PropertyIcon type={property.type} color="action" />}
              label={property.name}
            />
          </Box>
        );
      }))}
    </Box>
  );
});

const TenantList = withTranslation()(({ t }) => {
  const store = useContext(StoreContext);
  const router = useRouter();
  const classes = useStyles();

  const onEdit = useCallback(async tenant => {
    store.tenant.setSelected(tenant);
    await router.push(`/${store.organization.selected.name}/tenants/${tenant._id}`);
  }, []);

  return (
    <List
      component="nav"
      aria-labelledby="tenant-list"
    >
      {Children.toArray(store.tenant.filteredItems.map(tenant => {
        return (
          <Paper>
            <ListItem
              button
              style={{
                marginBottom: 20
              }}
              onClick={() => onEdit(tenant)}
            >
              <Hidden smDown>
                <ListItemAvatar>
                  <TenantAvatar tenant={tenant} className={!tenant.terminated ? classes.avatarInProgress : null} />
                </ListItemAvatar>
              </Hidden>
              <ListItemText
                primary={
                  <Grid container spacing={1}>
                    <Grid item xs={12} md={4}>
                      <Typography variant="h5">
                        {tenant.name}
                      </Typography>
                      {tenant.isCompany && (
                        <Typography
                          variant="caption"
                          color="textSecondary"
                          component="div"
                        >
                          {_.startCase(_.capitalize(tenant.manager))}
                        </Typography>
                      )}
                      <Typography
                        variant="caption"
                        color="textSecondary"
                        component="div"
                      >
                        {t('Contract {{contract}} - from {{startDate}} to {{endDate}}', {
                          contract: tenant.contract,
                          startDate: moment(tenant.beginDate, 'DD/MM/YYYY').format('L'),
                          endDate: moment(tenant.terminated ? tenant.terminationDate : tenant.endDate, 'DD/MM/YYYY').format('L')
                        })}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="textSecondary"
                        component="div"
                        className={!tenant.terminated ? classes.inProgress : null}
                      >
                        {tenant.terminated ? t('Terminated') : t('In progress')}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={8}>
                      <Properties tenant={tenant} />
                    </Grid>
                  </Grid>
                }
              />
            </ListItem>
          </Paper>
        )
      }))}
    </List>
  );
});

const Tenants = withTranslation()(observer(({ t }) => {
  const store = useContext(StoreContext);
  const [openNewTenantDialog, setOpenNewTenantDialog] = useState(false);
  const router = useRouter();

  const onSearch = useCallback((status, searchText) => {
    store.tenant.setFilters({ status, searchText });
  }, []);

  const onNewTenant = useCallback(() => {
    setOpenNewTenantDialog(true);
  }, []);

  const onCreateTenant = useCallback(async (tenant) => {
    store.tenant.setSelected(tenant);
    await router.push(`/${store.organization.selected.name}/tenants/${tenant._id}`);
  }, []);

  return (
    <Page
      PrimaryToolbar={
        <Typography color="textSecondary" variant="h5" noWrap>
          {t('Tenants')}
        </Typography>
      }
      SecondaryToolbar={
        <Box display="flex">
          <Box mr={1} flexGrow={1}>
            <SearchFilterBar
              filters={[
                { id: '', label: t('All') },
                { id: 'inprogress', label: t('In progress') },
                { id: 'stopped', label: t('Terminated') },

              ]}
              defaultValue={store.tenant.filters}
              onSearch={onSearch}
            />
          </Box>
          <Box >
            <Button
              variant="contained"
              onClick={onNewTenant}
            >
              {t('New tenant')}
            </Button>
          </Box>
        </Box>
      }
    >
      <TenantList />
      <NewTenantDialog
        open={openNewTenantDialog}
        setOpen={setOpenNewTenantDialog}
        onConfirm={onCreateTenant}
      />
    </Page>
  )
}));

Tenants.getInitialProps = async (context) => {
  console.log('Tenants.getInitialProps')
  const store = isServer() ? context.store : getStoreInstance();

  const { status } = await store.tenant.fetch();
  if (status !== 200) {
    return { error: { statusCode: status } };
  }

  return {
    initialState: {
      store: toJS(store)
    }
  };
};

export default withAuthentication(Tenants);
