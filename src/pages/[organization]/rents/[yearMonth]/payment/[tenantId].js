import moment from 'moment';
import { Accordion, AccordionDetails, AccordionSummary, Box, Breadcrumbs, Button, Divider, Grid, Typography } from '@material-ui/core';
import { useObserver } from 'mobx-react-lite'
import { withTranslation } from 'next-i18next';
import { Children, useContext } from 'react';
import Page from '../../../../../components/Page'

import { withAuthentication } from '../../../../../components/Authentication'
import { getStoreInstance, StoreContext } from '../../../../../store';
import { isServer } from '../../../../../utils';
import { FieldArray, Form, Formik } from 'formik';
import * as Yup from 'yup';
import { DateField, FormTextField, SelectField, SubmitButton } from '../../../../../components/Form';
import DashboardCard from '../../../../../components/DashboardCard';
import { NumberFormat } from '../../../../../utils/numberformat';
import { PaymentBalance } from '../../../../../components/RentCard';
import ReceiptIcon from '@material-ui/icons/Receipt';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Link from '../../../../../components/Link';
import { useRouter } from 'next/router';

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
    } catch(error) {
      console.error(error);
    }
  }

  const onCancel = async () => {
    await router.push(`/${store.organization.selected.name}/rents/${store.rent.period}`);
  }

  const initialValues = {
    payments: rent.payments.length ? rent.payments.map(({amount, date, type, reference}) => {
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
          then:  Yup.string().required()
        })
      })),
      extracharge: Yup.number().positive(),
      noteextracharge:  Yup.mixed().when('extracharge', {
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
      {({ isSubmitting, values: { payments, extracharge, noteextracharge, promo, notepromo, description }}) => {
        return (
          <Form autoComplete="off">

            <FormSection label={t('Payments')} defaultExpanded>
              <FieldArray
                name="payments"
                render={arrayHelpers => (
                  <div>
                    {payments.map(( payment, index) => (
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
              <Grid container spacing={1} justify="flex-end">
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


const RentPayment = withTranslation()(({ t }) => {
  console.log('RentPayment functional component')
  const store = useContext(StoreContext);

  return useObserver(() => (
    <Page
      PrimaryToolbar={
        <BreadcrumbBar />
      }
    >
      <Box py={2}>
        <Typography color="textSecondary" variant="h5">{`${store.rent.selected.occupant.name} - ${store.rent._period.format('MMMM YYYY')}`}</Typography>
      </Box>
      <Grid container spacing={5}>
        <Grid item xs={9}>
          <PaymentForm rent={store.rent.selected} />
        </Grid>
        <Grid item xs={3}>
          <DashboardCard
            Icon={ReceiptIcon}
            title={t('Rent to pay')}
          >
            <Box pb={1}>
              <NumberFormat align="right" variant="h4" value={store.rent.selected.totalToPay > 0 ? store.rent.selected.totalToPay : 0} />
            </Box>
            <Divider />
            <Box pt={1}>
              <PaymentBalance rent={store.rent.selected} />
            </Box>
          </DashboardCard>
        </Grid>
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
    // console.log(JSON.parse(JSON.stringify(store.rent)));
  }

  const props = {
    initialState: {
      store: JSON.parse(JSON.stringify(store))
    }
  };
  return props;
};

export default withAuthentication(RentPayment);