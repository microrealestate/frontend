import { Children, useContext, useState } from 'react';
import { useObserver } from 'mobx-react-lite'
import { useRouter } from 'next/router';
import { withTranslation } from 'next-i18next';
import moment from 'moment';
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
import { DashboardCard } from '../../../../../components/Cards';
import { NumberFormat } from '../../../../../utils/numberformat';
import { PaymentBalance } from '../../../../../components/RentCard';
import Link from '../../../../../components/Link';
import SendRentEmailMenu from '../../../../../components/SendRentEmailMenu';
import FullScreenDialogButton from '../../../../../components/FullScreenDialogButton';
import RequestError from '../../../../../components/RequestError';
import DownloadLink from '../../../../../components/DownloadLink';
import PaymentHistory from '../../../../../components/PaymentHistory';

const BreadcrumbBar = withTranslation()(({ t }) => {
  const store = useContext(StoreContext);


  return useObserver(() => {
    return (
      <Breadcrumbs aria-label="breadcrumb">
        <Link color="inherit" href={`/${store.organization.selected.name}/rents/${store.rent.period}`}>
          {t('Rents of {{date}}', { date: store.rent._period.format('MMM YYYY') })}
        </Link>
        <Typography variant="h6" noWrap>{store.rent.selected.occupant.name}</Typography>
      </Breadcrumbs>
    );
  });
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

const PaymentForm = withTranslation()(({ t, rent }) => {
  const store = useContext(StoreContext);
  const router = useRouter();

  const onSubmit = async (values, actions) => {
    // Save only payments
    values.payments = values.payments.filter(({ amount }) => amount > 0).map(payment => {
      // convert moment into string for the DB
      payment.date = payment.date.format('DD/MM/YYYY');
      return payment;
    });
    values.month = rent.month;
    values.year = rent.year;
    values._id = rent._id;
    try {
      await store.rent.pay(values);
      await router.push(`/${store.organization.selected.name}/rents/${store.rent.period}`);
    } catch (error) {
      console.error(error);
    }
  }

  const onCancel = async () => {
    await router.push(`/${store.organization.selected.name}/rents/${store.rent.period}`);
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
        amount: Yup.number().positive(),
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
    extracharge: Yup.number().positive(),
    noteextracharge: Yup.mixed().when('extracharge', {
      is: val => val > 0,
      then: Yup.string().required(),
    }),
    promo: Yup.number().positive(),
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
                          <Box display="flex" justifyContent="flex-end">
                            <Button
                              variant="contained"
                              size="small"
                              onClick={() => arrayHelpers.remove(index)}
                            >
                              {t('Remove payment')}
                            </Button>
                          </Box>
                        )}
                      </Box>
                    ))}
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => arrayHelpers.push(emptyPayment)}
                    >
                      {t('Add payment')}
                    </Button>
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
            </FormSection>

            <FormSection label={t('Internal description')} defaultExpanded={!!initialValues.description}>
              <FormTextField
                label={t('Description')}
                name="description"
                value={description}
                multiline
                rows={3}
              />
            </FormSection>
            <Box
              pt={2}
            >
              <Grid container spacing={1}>
                <Grid item>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={onCancel}
                  >
                    {t('Cancel')}
                  </Button>
                </Grid>
                <Grid item>
                  <SubmitButton
                    size="large"
                    label={!isSubmitting ? t('Save') : t('Saving')}
                  />
                </Grid>
              </Grid>
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

const RentPayment = withTranslation()(({ t }) => {
  console.log('RentPayment functional component')
  const store = useContext(StoreContext);
  const [error, setError] = useState('');

  //TODO manage errors

  return useObserver(() => (
    <Page
      PrimaryToolbar={
        <BreadcrumbBar />
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
              <PaymentHistory tenantId={store.rent.selected.occupant._id}/>
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
          <PaymentForm rent={store.rent.selected} />
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
    const fetchStatus = await store.rent.fetch();
    if (fetchStatus !== 200) {
      // TODO check error code to show a more detail error message
      return { error: { statusCode: 500 } };
    }

    const selectedRent = store.rent.items.find(({ occupant: { _id } }) => _id === tenantId);
    if (!selectedRent) {
      return { error: { statusCode: 404 } };
    }
    store.rent.setSelected(selectedRent);
  }

  const props = {
    initialState: {
      store: JSON.parse(JSON.stringify(store))
    }
  };
  return props;
};

export default withAuthentication(RentPayment);