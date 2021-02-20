import { useContext, useState } from 'react';
import { useObserver } from 'mobx-react-lite'
import { reaction, toJS } from 'mobx';
import { useRouter } from 'next/router';
import moment from 'moment';
import { Box, Grid, Hidden, Typography } from '@material-ui/core';
import TrendingDownIcon from '@material-ui/icons/TrendingDown';
import TrendingUpIcon from '@material-ui/icons/TrendingUp';
import ReceiptIcon from '@material-ui/icons/Receipt';

import { StoreContext, getStoreInstance } from '../../../../store'
import { withAuthentication } from '../../../../components/Authentication'
import { isServer } from '../../../../utils';
import { withTranslation } from '../../../../utils/i18n';
import SendIcon from '@material-ui/icons/Send';
import Page from '../../../../components/Page';
import RentCard from '../../../../components/RentCard';

import MonthPicker from '../../../../components/MonthPicker';
import { PageCard } from '../../../../components/Cards';
import { NumberFormat } from '../../../../utils/numberformat';
import FullScreenDialogButton from '../../../../components/FullScreenDialogButton';
import RentTable from '../../../../components/RentTable';
import SearchFilterBar from '../../../../components/SearchFilterBar';

const PeriodToolbar = withTranslation()(({ t, onChange }) => {
  const router = useRouter();
  const rentPeriod = moment(router.query.yearMonth, 'YYYY.MM');
  return (
    <Grid
      container alignItems="center" spacing={2} wrap="nowrap">
      <Grid item>
        <Typography color="textSecondary" variant="h5" noWrap>
          {t('Rents')}
        </Typography>
      </Grid>
      <Grid item>
        <MonthPicker value={rentPeriod} onChange={onChange} />
      </Grid>
    </Grid>
  );
});

const Rents = withTranslation()(({ t }) => {
  console.log('Rents functional component')
  const store = useContext(StoreContext);
  const router = useRouter();

  const onSearch = (status, searchText) => {
    let queryString = '';
    if (searchText || status) {
      queryString = `?search=${encodeURIComponent(searchText)}&status=${encodeURIComponent(status)}`
    }
    router.push(
      `/${store.organization.selected.name}/rents/${store.rent.period}${queryString}`,
      undefined,
      { shallow: true }
    );
    store.rent.setFilters({ status, searchText });
  }

  const onPeriodChange = async period => {
    store.rent.setPeriod(period);
    await router.push(`/${store.organization.selected.name}/rents/${store.rent.period}`);
  }

  const onEdit = async (rent) => {
    store.rent.setSelected(rent);
    await router.push(`/${store.organization.selected.name}/rents/${store.rent.period}/payment/${rent.occupant._id}`);
  };

  return useObserver(() => (
    <Page
      PrimaryToolbar={
        <PeriodToolbar onChange={onPeriodChange} />
      }
      SecondaryToolbar={
        <Box display="flex" alignItems="center">
          <Box flexGrow={1} mr={5}>
            <SearchFilterBar
              filters={[
                { id: '', label: t('All') },
                { id: 'notpaid', label: t('Not paid') },
                { id: 'partiallypaid', label: t('Partially paid') },
                { id: 'paid', label: t('Paid') },

              ]}
              defaultValue={store.rent.filters}
              onSearch={onSearch}
            />
          </Box>
          <Box>
            <FullScreenDialogButton
              variant="contained"
              buttonLabel={t('Send mass emails')}
              startIcon={<SendIcon />}
              dialogTitle={t('Send mass emails')}
              cancelButtonLabel={t('Close')}
              showCancel
            >
              <RentTable />
            </FullScreenDialogButton>
          </Box>
        </Box>
      }
    >
      {!store.rent.filters.searchText && (
        <Hidden smDown>
          <Box pb={5}>
            <Grid container spacing={3}>
              <Grid item xs={4}>
                <PageCard
                  variant="info"
                  Icon={ReceiptIcon}
                  title={t('Rents')}
                  info={t('Rents of {{period}}', { period: store.rent._period.format('MMMM YYYY') })}
                >
                  <Typography align="right" variant="h5">{store.rent.countAll}</Typography>
                </PageCard>
              </Grid>
              <Grid item xs={4}>
                <PageCard
                  variant="success"
                  Icon={TrendingUpIcon}
                  title={t('Paid')}
                  info={t('{{count}} rents paid', { count: store.rent.countPaid + store.rent.countPartiallyPaid })}
                >
                  <NumberFormat align="right" variant="h5" value={store.rent.totalPaid} />
                </PageCard>
              </Grid>
              <Grid item xs={4}>
                <PageCard
                  variant="warning"
                  Icon={TrendingDownIcon}
                  title={t('Not paid')}
                  info={t('{{count}} rents not paid', { count: store.rent.countNotPaid })}
                >
                  <NumberFormat align="right" variant="h5" value={store.rent.totalToPay} />
                </PageCard>
              </Grid>
            </Grid>
          </Box>
        </Hidden>
      )}
      <Grid container spacing={3}>
        {store.rent.filteredItems.map(rent => (
          <Grid key={rent.uid} item xs={12} md={4}>
            <RentCard rent={rent} onEdit={onEdit} />
          </Grid>
        ))}
      </Grid>
    </Page>
  ));
});

Rents.getInitialProps = async (context) => {
  console.log('Rents.getInitialProps')
  const store = isServer() ? context.store : getStoreInstance();

  if (isServer()) {
    const { yearMonth, search, status } = context.query;
    const rentPeriod = moment(yearMonth, 'YYYY.MM', true);
    if (!rentPeriod.isValid()) {
      return { error: { statusCode: 404 } };
    }
    store.rent.setPeriod(rentPeriod);
    store.rent.setFilters({ searchText: search, status });
  }

  const fetchStatus = await store.rent.fetch();
  if (fetchStatus !== 200) {
    // TODO check error code to show a more detail error message
    return { error: { statusCode: 500 } };
  }

  return {
    initialState: {
      store: toJS(store)
    }
  };
};

export default withAuthentication(Rents);
