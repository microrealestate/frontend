import moment from 'moment';
import { Children, memo, useCallback, useContext, useMemo, useState } from 'react';
import { observer } from 'mobx-react-lite'
import { toJS } from 'mobx';
import { withTranslation } from 'next-i18next';
import { Accordion, AccordionDetails, AccordionSummary, Box, Breadcrumbs, Divider, Grid, Hidden, List, ListItem, Paper, Tab, Tabs, Typography, withStyles } from '@material-ui/core';
import ReceiptIcon from '@material-ui/icons/Receipt';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import SendIcon from '@material-ui/icons/Send';
import HistoryIcon from '@material-ui/icons/History';

import Page from '../../../../components/Page'
import { withAuthentication } from '../../../../components/Authentication'
import { getStoreInstance, StoreContext } from '../../../../store';
import { isServer } from '../../../../utils';
import { CardRow, DashboardCard } from '../../../../components/Cards';
import { NumberFormat } from '../../../../utils/numberformat';
import Link from '../../../../components/Link';
import SendRentEmailMenu from '../../../../components/rents/SendRentEmailMenu';
import FullScreenDialogButton from '../../../../components/FullScreenDialogButton';
import RequestError from '../../../../components/RequestError';
import DownloadLink from '../../../../components/DownloadLink';
import RentHistory from '../../../../components/rents/RentHistory';
import { useRouter } from 'next/router';
import BalanceBar from '../../../../components/rents/BalanceBar';
import { TabPanel } from '../../../../components/Tabs';
import PaymentForm from '../../../../components/payment/PaymentForm';
import AdditionalCostDiscountForm from '../../../../components/payment/AdditionalCostDiscountForm';
import InternalNoteForm from '../../../../components/payment/InternalNoteForm';

const BreadcrumbBar = memo(withTranslation()(({ t, backPath }) => {
  const store = useContext(StoreContext);

  return (
    <Breadcrumbs aria-label="breadcrumb">
      <Link color="inherit" href={backPath}>
        {t('Rents of {{date}}', { date: store.rent._period.format('MMM YYYY') })}
      </Link>
      <Typography variant="h6" noWrap>{store.rent.selected.occupant.name}</Typography>
    </Breadcrumbs>
  );
}));

const FormSection = memo(({ label, children, ...props }) => {
  return (
    <Accordion {...props}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="panel1a-content"
        id="panel1a-header"
      >
        <Typography>{label}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Box width="100%">
          {Children.toArray(children).map((child, index) => (
            <Grid key={index} item>{child}</Grid>
          ))}
        </Box>
      </AccordionDetails>
    </Accordion>
  );
});

const StyledListItem = withStyles(theme => ({
  root: {
    paddingLeft: 0,
    paddingRight: 0
  }
}))(ListItem);

const _rentDetails = rent => {
  const turnToNegative = amount => amount !== 0 ? amount * (-1) : 0;

  return {
    balance: turnToNegative(rent.balance),
    newBalance: rent.newBalance,
    additionalCosts: turnToNegative(rent.extracharge),
    rent: turnToNegative(rent.totalWithoutBalanceAmount + rent.promo - rent.extracharge),
    discount: rent.promo,
    payment: rent.payment,
    totalAmount: rent.totalAmount
  };
};

export const PaymentBalance = withTranslation()(({ t }) => {
  const store = useContext(StoreContext);
  const rentDetails = useMemo(() => _rentDetails(store.rent.selected), [store.rent.selected]);

  return (
    <>
      <CardRow>
        <Typography
          color="textSecondary"
          noWrap
        >
          {t('Prev. balance')}
        </Typography>
        <NumberFormat
          color="textSecondary"
          value={rentDetails.balance}
          noWrap
          withColor
        />
      </CardRow>
      <CardRow>
        <Typography
          color="textSecondary"
          noWrap
        >
          {t('Rent')}
        </Typography>
        <NumberFormat
          color="textSecondary"
          value={rentDetails.rent}
          noWrap
        />
      </CardRow>
      <CardRow>
        <Typography
          color="textSecondary"
          noWrap
        >
          {t('Additional costs')}
        </Typography>
        <NumberFormat
          color="textSecondary"
          value={rentDetails.additionalCosts}
          noWrap
        />
      </CardRow>
      <CardRow pb={1.5}>
        <Typography
          color="textSecondary"
          noWrap
        >
          {t('Discount')}
        </Typography>
        <NumberFormat
          color="textSecondary"
          value={rentDetails.discount}
          noWrap
        />
      </CardRow>
      <Divider />
      <CardRow pt={1.5}>
        <Typography
          color="textSecondary"
          noWrap
        >
          {t('Total to pay')}
        </Typography>
        <NumberFormat
          color="textSecondary"
          value={rentDetails.totalAmount}
          noWrap
        />
      </CardRow>
      <CardRow pb={1.5}>
        <Typography
          color="textSecondary"
          noWrap
        >
          {t('Payments')}
        </Typography>
        <NumberFormat
          color="textSecondary"
          value={rentDetails.payment}
          noWrap
          withColor
        />
      </CardRow>
      <Divider />
      <CardRow pt={1.5}>
        <Typography
          color="textSecondary"
          noWrap
        >
          {rentDetails.newBalance < 0 ? t('Debit balance') : t('Credit balance')}
        </Typography>
        <NumberFormat
          color="textSecondary"
          value={rentDetails.newBalance}
          noWrap
          withColor
        />
      </CardRow>
    </>
  );
});


const RentPayment = withTranslation()(observer(({ t }) => {
  console.log('RentPayment functional component')
  const store = useContext(StoreContext);
  const router = useRouter();
  const [error, setError] = useState('');
  const [tabSelected, setTabSelected] = useState(0);

  const backPath = useMemo(() => {
    let backPath = `/${store.organization.selected.name}/rents/${store.rent.period}`;
    if (store.rent.filters.searchText || store.rent.filters.status) {
      backPath = `${backPath}?search=${encodeURIComponent(store.rent.filters.searchText)}&status=${encodeURIComponent(store.rent.filters.status)}`
    }
    return backPath;
  }, []);

  const onTabChange = useCallback((event, newValue) => {
    setTabSelected(newValue);
  }, []);

  const onSubmit = useCallback(async paymentPart => {
      const { term } = router.query;

      const payment = {
        _id: store.rent.selected._id,
        month: store.rent.selected.month,
        year: store.rent.selected.year,
        payments: toJS(store.rent.selected.payments),
        extracharge: store.rent.selected.extracharge,
        noteextracharge: store.rent.selected.noteextracharge,
        promo: store.rent.selected.promo,
        notepromo: store.rent.selected.notepromo,
        description: store.rent.selected.description,
        ...paymentPart
      }

      try {
        await store.rent.pay(term, payment);
      } catch (error) {
        //TODO manage errors
        console.error(error);
      }
  }, []);

  return (
    <Page
      PrimaryToolbar={
        <BreadcrumbBar backPath={backPath} />
      }
      SecondaryToolbar={
        <Box display="flex" width="100%" align="right">
          <Box mr={1.5}>
            <FullScreenDialogButton
              variant="contained"
              buttonLabel={t('Rents')}
              startIcon={<HistoryIcon />}
              dialogTitle={t('Rents history')}
              cancelButtonLabel={t('Close')}
              showCancel
            >
              <RentHistory tenantId={store.rent.selected.occupant._id} />
            </FullScreenDialogButton>
          </Box>
          <SendRentEmailMenu
            tenantIds={[store.rent.selected.occupant._id]}
            terms={[store.rent.selected.term]}
            period={store.rent._period}
            variant="contained"
            startIcon={<SendIcon />}
          />
        </Box>
      }
    >
      <RequestError error={error} />
      <Grid container spacing={5}>
        <Grid item sm={12} md={8}>
          <Paper>
            <Tabs
              variant="scrollable"
              value={tabSelected}
              onChange={onTabChange}
              aria-label="Property tabs"
            >
              <Tab label={t('Payments')} />
              <Tab label={t('Additional cost and discount')} />
              <Tab label={t('Internal note')} />
            </Tabs>
            <TabPanel value={tabSelected} index={0}>
              <PaymentForm onSubmit={onSubmit} />
            </TabPanel>
            <TabPanel value={tabSelected} index={1}>
              <AdditionalCostDiscountForm onSubmit={onSubmit} />
            </TabPanel>
            <TabPanel value={tabSelected} index={2}>
              <InternalNoteForm onSubmit={onSubmit} />
            </TabPanel>
          </Paper>
        </Grid>
        <Hidden smDown>
          <Grid item md={4}>
            <Box pb={4}>
              <DashboardCard
                Icon={ReceiptIcon}
                title={t('Rent')}
              >
                <Box pb={1}>
                  <BalanceBar rent={store.rent.selected} hideTooltip={true} />
                </Box>
                <Divider />
                <Box pt={1}>
                  <PaymentBalance />
                </Box>
              </DashboardCard>
            </Box>
            <DashboardCard
              Icon={SendIcon}
              title={t('Documents sent')}
            >
              {store.rent.selected.emailStatus ? (
                <List>
                  {(store.rent.selected.emailStatus.status?.rentcall) && (
                    <StyledListItem>
                      <DownloadLink
                        label={t('First notice sent on {{datetime}}', { datetime: moment(store.rent.selected.emailStatus.last.rentcall.sentDate).format('L hh:mm') })}
                        url={`/rentcall/${store.rent.selected.occupant._id}/${store.rent.selected.term}`}
                        documentName={`${store.rent.selected.occupant.name}-${t('first notice')}.pdf`}
                        variant="body2"
                        color="textSecondary"
                      />
                    </StyledListItem>
                  )}

                  {(store.rent.selected.emailStatus.status?.rentcall_reminder) && (
                    <StyledListItem>
                      <DownloadLink
                        label={t('Second notice sent on {{datetime}}', { datetime: moment(store.rent.selected.emailStatus.last.rentcall_reminder.sentDate).format('L hh:mm') })}
                        url={`/rentcall_reminder/${store.rent.selected.occupant._id}/${store.rent.selected.term}`}
                        documentName={`${store.rent.selected.occupant.name}-${t('second notice')}.pdf`}
                        variant="body2"
                        color="textSecondary"
                      />
                    </StyledListItem>
                  )}
                  {(store.rent.selected.emailStatus.status?.rentcall_last_reminder) && (
                    <StyledListItem>
                      <DownloadLink
                        label={t('Last notice sent on {{datetime}}', { datetime: moment(store.rent.selected.emailStatus.last.rentcall_last_reminder.sentDate).format('L hh:mm') })}
                        url={`/rentcall_last_reminder/${store.rent.selected.occupant._id}/${store.rent.selected.term}`}
                        documentName={`${store.rent.selected.occupant.name}-${t('last notice')}.pdf`}
                        variant="body2"
                        color="textSecondary"
                      />
                    </StyledListItem>
                  )}
                  {(store.rent.selected.emailStatus.status?.invoice) && (
                    <StyledListItem>
                      <DownloadLink
                        label={t('Receipt sent on {{datetime}}', { datetime: moment(store.rent.selected.emailStatus.last.invoice.sentDate).format('L hh:mm') })}
                        url={`/invoice/${store.rent.selected.occupant._id}/${store.rent.selected.term}`}
                        documentName={`${store.rent.selected.occupant.name}-${t('invoice')}.pdf`}
                        variant="body2"
                        color="textSecondary"
                      />
                    </StyledListItem>
                  )}
                </List>
              ) : (
                <Typography
                  color="textSecondary"
                >
                  {t('No documents sent')}
                </Typography>
              )}
            </DashboardCard>
          </Grid>
        </Hidden>
      </Grid>
    </Page>
  );
}));

RentPayment.getInitialProps = async (context) => {
  console.log('RentPayment.getInitialProps')
  const store = isServer() ? context.store : getStoreInstance();
  const { tenantId, term } = context.query;

  const { status, data } = await store.rent.fetchOneTenantRent(tenantId, term);
  if (status !== 200) {
    return { error: { statusCode: status } };
  }

  store.rent.setSelected(data);

  const props = {
    initialState: {
      store: toJS(store)
    }
  };
  return props;
};

export default withAuthentication(RentPayment);