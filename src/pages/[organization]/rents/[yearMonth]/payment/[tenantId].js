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

const emptyPayment = { paymentAmount: '', paymentType: '', paymentReference: '' };

const PaymentForm = withTranslation()(({ t, rent }) => {
  const store = useContext(StoreContext);
  const router = useRouter();
  const onSubmit = async (values, actions) => {
    console.log(values)
  }

  const initialValues = {
    payments: rent.payments.length ? rent.payments.map(({amount, date, type, reference}) => {
      return {
        paymentAmount: amount === 0 ? '' : amount,
        paymentDate: date ? moment(date, 'DD/MM/YYYY') : undefined,
        paymentType: type,
        paymentReference: reference || ''
      }
    }) : [emptyPayment],
    extracharge: rent.extracharge !== 0 ? rent.extracharge : '',
    noteextracharge: rent.noteextracharge || '',
    promo: rent.promo !== 0 ? rent.promo : '',
    notepromo: rent.notepromo || '',
    description: rent.description || ''
  };

  // console.log(JSON.parse(JSON.stringify(rent)))

  const validationSchema = Yup.object().shape({
    // name: Yup.string()
    //   .required('Required'),
    // isCompany: Yup.boolean()
    //   .required('Required'),
    // company: Yup.mixed().when('isCompany', {
    //   is: true,
    //   then: Yup.string().required(),
    //   otherwise: Yup.string()
    // }),
    // // company: Yup.string().required(),
    // email: Yup.mixed().when('isCompany', {
    //   is: true,
    //   then: Yup.string().email().required(),
    //   otherwise: Yup.string().email()
    // })
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
                              name={`payments[${index}].paymentAmount`}
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <DateField
                              label={t('Date')}
                              name={`payments[${index}].paymentDate`}
                            />
                          </Grid>
                        </Grid>
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <SelectField
                              label={t('Type')}
                              name={`payments[${index}].paymentType`}
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
                              name={`payments[${index}].paymentReference`}
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
            <FormSection label={t('Additional cost')} defaultExpanded={!!(extracharge && extracharge !== 0)}>
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

            <FormSection label={t('Discount')} defaultExpanded={!!(promo && promo !== 0)}>
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

            <FormSection label={t('Internal description')} defaultExpanded={!!description}>
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
                    onClick={() => router.push(`/${store.organization.selected.name}/rents/${store.rent.period}`)}
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
              <NumberFormat align="right" variant="h4" value={store.rent.selected.totalToPay} />
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
      return { statusCode: 404 };
    }
    store.rent.setPeriod(rentPeriod);
    await store.rent.fetch();

    const selectedRent = store.rent.items.find(({ occupant: { _id } }) => _id === tenantId);
    if (!selectedRent) {
      return { statusCode: 404 };
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