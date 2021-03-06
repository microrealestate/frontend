import _ from 'lodash';
import moment from 'moment';
import { Children, useContext, useState } from 'react';
import { useObserver } from 'mobx-react-lite'
import { toJS } from 'mobx';
import { useRouter } from 'next/router';
import { withTranslation } from 'next-i18next';
import { FieldArray, Form, Formik } from 'formik';
import * as Yup from 'yup';
import { Accordion, AccordionDetails, AccordionSummary, Box, Breadcrumbs, Button, Divider, Grid, Hidden, List, ListItem, Typography, withStyles } from '@material-ui/core';
import ReceiptIcon from '@material-ui/icons/Receipt';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import SendIcon from '@material-ui/icons/Send';
import HistoryIcon from '@material-ui/icons/History';

import Page from '../../../../../components/Page'
import { withAuthentication } from '../../../../../components/Authentication'
import { getStoreInstance, StoreContext } from '../../../../../store';
import { isServer } from '../../../../../utils';
import { DateField, FormTextField, SelectField, SubmitButton } from '../../../../../components/Form';
import { CardRow, DashboardCard } from '../../../../../components/Cards';
import { NumberFormat } from '../../../../../utils/numberformat';
import Link from '../../../../../components/Link';
import SendRentEmailMenu from '../../../../../components/SendRentEmailMenu';
import FullScreenDialogButton from '../../../../../components/FullScreenDialogButton';
import RequestError from '../../../../../components/RequestError';
import DownloadLink from '../../../../../components/DownloadLink';
import PaymentHistory from '../../../../../components/PaymentHistory';

const BreadcrumbBar = withTranslation()(({ t, backPath }) => {
  const store = useContext(StoreContext);

  return (
    <Breadcrumbs aria-label="breadcrumb">
      <Link color="inherit" href={backPath}>
        {t('Rents of {{date}}', { date: store.rent._period.format('MMM YYYY') })}
      </Link>
      <Typography variant="h6" noWrap>{store.rent.selected.occupant.name}</Typography>
    </Breadcrumbs>
  );
});

const FormSection = ({ label, children, ...props }) => {
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
}

const emptyPayment = { amount: '', date: moment(), type: 'cash', reference: '' };

const PaymentForm = withTranslation()(({ t, rent, backPath }) => {
  const store = useContext(StoreContext);
  const router = useRouter();

  const onSubmit = async (values, actions) => {
    // clone to avoid changing the form fields
    const clonedValues = _.cloneDeep(values);

    // Save only payments
    clonedValues.payments = clonedValues.payments.filter(({ amount }) => amount > 0).map(payment => {
      // convert moment into string for the DB
      payment.date = payment.date.format('DD/MM/YYYY');
      return payment;
    });
    clonedValues.month = rent.month;
    clonedValues.year = rent.year;
    clonedValues._id = rent._id;
    try {
      await store.rent.pay(clonedValues);

      // clean fields if empty amounts were saved
      if (clonedValues.payments.length === 0) {
        values.payments = [emptyPayment];
      }
      if (!clonedValues.extracharge || clonedValues.extracharge === '0') {
        values.extracharge = '';
        values.noteextracharge = '';
      }
      if (!clonedValues.promo || clonedValues.promo === '0') {
        values.promo = '';
        values.notepromo = '';
      }
    } catch (error) {
      console.error(error);
    }
  }

  const onClose = async () => {
    await router.push(backPath);
  }

  const initialValues = {
    payments: rent.payments.length ? rent.payments.map(({ amount, date, type, reference }) => {
      return {
        amount: amount === 0 ? '' : amount,
        date: date ? moment(date, 'DD/MM/YYYY') : undefined,
        type: type,
        reference: reference || ''
      }
    }) : [emptyPayment],
    extracharge: rent.extracharge !== 0 ? rent.extracharge : '',
    noteextracharge: rent.noteextracharge || '',
    promo: rent.promo !== 0 ? rent.promo : '',
    notepromo: rent.notepromo || '',
    description: rent.description || ''
  };

  const validationSchema = Yup.object().shape({
    payments: Yup.array().of(
      Yup.object().shape({
        amount: Yup.number().min(0),
        date: Yup.mixed().when('amount', {
          is: val => val > 0,
          then: Yup.date().required()
        }),
        type: Yup.string().required(),
        reference: Yup.mixed().when('type', {
          is: val => val !== 'cash',
          then: Yup.string().required()
        })
      })),
    extracharge: Yup.number().min(0),
    noteextracharge: Yup.mixed().when('extracharge', {
      is: val => val > 0,
      then: Yup.string().required(),
    }),
    promo: Yup.number().min(0),
    notepromo: Yup.mixed().when('promo', {
      is: val => val > 0,
      then: Yup.string().required(),
    }),
    description: Yup.string()
  });

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
    >
      {({ isSubmitting, values: { payments, extracharge, noteextracharge, promo, notepromo, description } }) => {
        return (
          <Form autoComplete="off">

            <FormSection label={t('Payments')} defaultExpanded>
              <FieldArray
                name="payments"
                render={arrayHelpers => (
                  <div>
                    {payments.map((payment, index) => (
                      <Box key={index}>
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <FormTextField
                              label={t('Amount')}
                              name={`payments[${index}].amount`}
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <DateField
                              label={t('Date')}
                              name={`payments[${index}].date`}
                            />
                          </Grid>
                        </Grid>
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <SelectField
                              label={t('Type')}
                              name={`payments[${index}].type`}
                              values={[
                                { id: 'cheque', label: t('Cheque'), value: 'cheque' },
                                { id: 'cash', label: t('Cash'), value: 'cash' },
                                { id: 'levy', label: t('Levy'), value: 'levy' },
                                { id: 'transfer', label: t('Transfer'), value: 'transfer' }
                              ]}
                            />
                          </Grid>

                          <Grid item xs={6}>
                            <FormTextField
                              label={t('Reference')}
                              name={`payments[${index}].reference`}
                            />
                          </Grid>
                        </Grid>
                        { payments.length > 1 && (
                          <Box pb={2} display="flex" justifyContent="flex-end">
                            <Button
                              // variant="contained"
                              color="primary"
                              size="small"
                              onClick={() => arrayHelpers.remove(index)}
                            >
                              {t('Remove payment')}
                            </Button>
                          </Box>
                        )}
                      </Box>
                    ))}
                    <Box display="flex" justifyContent="space-between">
                      <SubmitButton
                        size="small"
                        label={!isSubmitting ? t('Save') : t('Saving')}
                      />
                      <Button
                        // variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => arrayHelpers.push(emptyPayment)}
                      >
                        {t('Add payment')}
                      </Button>
                    </Box>
                  </div>
                )}
              />
            </FormSection>
            <FormSection label={t('Additional cost')} defaultExpanded={!!initialValues.extracharge}>
              <FormTextField
                label={t('Amount')}
                name="extracharge"
                value={extracharge}
              />
              <FormTextField
                label={t('Description')}
                name="noteextracharge"
                value={noteextracharge}
                multiline
                rows={3}
              />
              <SubmitButton
                size="small"
                label={!isSubmitting ? t('Save') : t('Saving')}
              />
            </FormSection>

            <FormSection label={t('Discount')} defaultExpanded={!!initialValues.promo}>
              <FormTextField
                label={t('Discount')}
                name="promo"
                value={promo}
              />
              <FormTextField
                label={t('Description')}
                name="notepromo"
                value={notepromo}
                multiline
                rows={3}
              />
              <SubmitButton
                size="small"
                label={!isSubmitting ? t('Save') : t('Saving')}
              />
            </FormSection>

            <FormSection label={t('Internal description')} defaultExpanded={!!initialValues.description}>
              <FormTextField
                label={t('Description')}
                name="description"
                value={description}
                multiline
                rows={3}
              />
              <SubmitButton
                size="small"
                label={!isSubmitting ? t('Save') : t('Saving')}
              />
            </FormSection>
            <Box
              pt={2}
            >
              <Button
                variant="contained"
                size="large"
                onClick={onClose}
              >
                {t('Close')}
              </Button>
            </Box>
          </Form>
        )
      }}
    </Formik>
  )
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

export const PaymentBalance = withTranslation()(({ t, rent }) => {
  const rentDetails = _rentDetails(rent);

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
      <CardRow>
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
      <CardRow>
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
  )
});


const RentPayment = withTranslation()(({ t }) => {
  console.log('RentPayment functional component')
  const store = useContext(StoreContext);
  const [error, setError] = useState('');

  //TODO manage errors

  let backPath = `/${store.organization.selected.name}/rents/${store.rent.period}`;
  if (store.rent.filters.searchText || store.rent.filters.status) {
    backPath = `${backPath}?search=${encodeURIComponent(store.rent.filters.searchText)}&status=${encodeURIComponent(store.rent.filters.status)}`
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
              <PaymentHistory tenantId={store.rent.selected.occupant._id} />
            </FullScreenDialogButton>
          </Box>
          <SendRentEmailMenu
            tenantIds={[store.rent.selected.occupant._id]}
            period={store.rent._period}
            variant="contained"
            startIcon={<SendIcon />}
          />
        </Box>
      }
    >
      <RequestError error={error} />
      <Grid container spacing={10}>
        <Grid item sm={12} md={8}>
          <PaymentForm rent={store.rent.selected} backPath={backPath} />
        </Grid>
        <Hidden smDown>
          <Grid item md={4}>
            <Box pb={4}>
              <DashboardCard
                Icon={ReceiptIcon}
                title={t('Rent of {{monthYear}}', { monthYear: store.rent._period.format('MMMM YYYY') })}
              >
                <Box pb={1}>
                  <NumberFormat align="right" variant="h5" value={store.rent.selected.totalAmount > 0 ? store.rent.selected.totalAmount : 0} />
                </Box>
                <Divider />
                <Box pt={1}>
                  <PaymentBalance rent={store.rent.selected} />
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
  ))
});

RentPayment.getInitialProps = async (context) => {
  console.log('RentPayment.getInitialProps')
  const store = isServer() ? context.store : getStoreInstance();

  if (isServer()) {
    const { yearMonth, tenantId } = context.query;
    const rentPeriod = moment(yearMonth, 'YYYY.MM', true);
    if (!rentPeriod.isValid()) {
      return { error: { statusCode: 404 } };
    }

    store.rent.setPeriod(rentPeriod);
    const response = await store.rent.fetchOneTenantRent(tenantId);
    if (response.status !== 200) {
      // TODO check error code to show a more detail error message
      return { error: { statusCode: 500 } };
    }

    store.rent.setSelected(response.data);
  }

  const props = {
    initialState: {
      store: toJS(store)
    }
  };
  return props;
};

export default withAuthentication(RentPayment);