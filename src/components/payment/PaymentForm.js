import moment from 'moment';
import * as Yup from 'yup';
import { FieldArray, Form, Formik } from 'formik';
import { Children, useCallback, useContext, useMemo } from 'react';
import { withTranslation } from "../../utils/i18n";
import { Box, Button, Grid } from '@material-ui/core';
import { DateField, FormSection, FormTextField, SelectField, SubmitButton } from '../Form';
import { StoreContext } from '../../store';

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
    })).min(1)
});

const emptyPayment = { amount: '', date: moment(), type: 'cash', reference: '' };

const PaymentForm = withTranslation()(({ t, onSubmit }) => {
  const store = useContext(StoreContext);

  const initialValues = useMemo(() => ({
    payments: store.rent.selected.payments.length ? store.rent.selected.payments.map(({ amount, date, type, reference }) => {
      return {
        amount: amount === 0 ? '' : amount,
        date: date ? moment(date, 'DD/MM/YYYY') : null,
        type: type,
        reference: reference || ''
      }
    }) : [emptyPayment],
  }), [store.rent.selected]);

  const _onSubmit = useCallback(async values => {
    const clonedValues = _.cloneDeep(values);

    const paymentPart = {
      payments: clonedValues.payments
        .filter(({ amount }) => amount > 0)
        .map(payment => {
          // convert moment into string for the DB
          payment.date = payment.date.format('DD/MM/YYYY');
          if (payment.type === 'cash') {
            delete payment.reference;
          }
          return payment;
        })
    };
    try {
      await onSubmit(paymentPart);
    } finally {
      // clean fields if empty amounts were saved
      if (clonedValues.payments.length === 0) {
        values.payments = [emptyPayment];
      }
    }
  }, []);

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={_onSubmit}
    >
      {({ isSubmitting, values: { payments, extracharge, noteextracharge, promo, notepromo, description } }) => {
        return (
          <Form autoComplete="off">
            <FormSection label={t('Payments')}>
              <FieldArray
                name="payments"
                render={arrayHelpers => (
                  <div>
                    {Children.toArray(payments.map((payment, index) => (
                      <>
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
                              minDate={store.rent._period.startOf('month').toISOString()}
                              maxDate={store.rent._period.endOf('month').toISOString()}
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
                          {(payments[index].type !== 'cash') && (
                            <Grid item xs={6}>
                              <FormTextField
                                label={t('Reference')}
                                name={`payments[${index}].reference`}
                              />
                            </Grid>
                          )}
                        </Grid>
                        <Box pb={2} display="flex" justifyContent={payments.length === index + 1 ? 'space-between' : 'flex-end'}>
                          {(payments.length === index + 1) && (
                            <Button
                              // variant="contained"
                              color="primary"
                              size="small"
                              onClick={() => arrayHelpers.push(emptyPayment)}
                            >
                              {t('Add payment')}
                            </Button>
                          )}
                          {payments.length > 1 && (
                            <Button
                              // variant="contained"
                              color="primary"
                              size="small"
                              onClick={() => arrayHelpers.remove(index)}
                            >
                              {t('Remove payment')}
                            </Button>
                          )}
                        </Box>
                      </>
                    )))}
                  </div>
                )}
              />
            </FormSection>
            <SubmitButton
              label={!isSubmitting ? t('Save') : t('Saving')}
            />
          </Form>
        )
      }}
    </Formik>
  )
});

export default PaymentForm;

//   const PaymentForm = withTranslation()(({ t }) => {
//     const store = useContext(StoreContext);
//     const router = useRouter();

//     const onSubmit = useCallback(async (values, actions) => {
//       const { term } = router.query;
//       // clone to avoid changing the form fields
//       const clonedValues = _.cloneDeep(values);

//       // Save only payments
//       clonedValues.payments = clonedValues.payments.filter(({ amount }) => amount > 0).map(payment => {
//         // convert moment into string for the DB
//         payment.date = payment.date.format('DD/MM/YYYY');
//         if (payment.type === 'cash') {
//           delete payment.reference;
//         }
//         return payment;
//       });
//       clonedValues.month = store.rent.selected.month;
//       clonedValues.year = store.rent.selected.year;
//       clonedValues._id = store.rent.selected._id;
//       try {
//         await store.rent.pay(term, clonedValues);

//         // clean fields if empty amounts were saved
//         if (clonedValues.payments.length === 0) {
//           values.payments = [emptyPayment];
//         }
//         if (!clonedValues.extracharge || clonedValues.extracharge === '0') {
//           values.extracharge = '';
//           values.noteextracharge = '';
//         }
//         if (!clonedValues.promo || clonedValues.promo === '0') {
//           values.promo = '';
//           values.notepromo = '';
//         }
//       } catch (error) {
//         console.error(error);
//       }
//     });

//     const initialValues = useMemo(() => ({
//       payments: store.rent.selected.payments.length ? store.rent.selected.payments.map(({ amount, date, type, reference }) => {
//         return {
//           amount: amount === 0 ? '' : amount,
//           date: date ? moment(date, 'DD/MM/YYYY') : null,
//           type: type,
//           reference: reference || ''
//         }
//       }) : [emptyPayment],
//       extracharge: store.rent.selected.extracharge !== 0 ? store.rent.selected.extracharge : '',
//       noteextracharge: store.rent.selected.noteextracharge || '',
//       promo: store.rent.selected.promo !== 0 ? store.rent.selected.promo : '',
//       notepromo: store.rent.selected.notepromo || '',
//       description: store.rent.selected.description || ''
//     }), [store.rent.selected]);

//     return (
//       <Formik
//         initialValues={initialValues}
//         validationSchema={validationSchema}
//         onSubmit={onSubmit}
//       >
//         {({ isSubmitting, values: { payments, extracharge, noteextracharge, promo, notepromo, description } }) => {
//           return (
//             <Form autoComplete="off">

//               <FormSection label={t('Payments')} defaultExpanded>
//                 <FieldArray
//                   name="payments"
//                   render={arrayHelpers => (
//                     <div>
//                       {Children.toArray(payments.map((payment, index) => (
//                         <>
//                           <Grid container spacing={2}>
//                             <Grid item xs={6}>
//                               <FormTextField
//                                 label={t('Amount')}
//                                 name={`payments[${index}].amount`}
//                               />
//                             </Grid>
//                             <Grid item xs={6}>
//                               <DateField
//                                 label={t('Date')}
//                                 name={`payments[${index}].date`}
//                                 minDate={store.rent._period.startOf('month').toISOString()}
//                                 maxDate={store.rent._period.endOf('month').toISOString()}
//                               />
//                             </Grid>
//                           </Grid>
//                           <Grid container spacing={2}>
//                             <Grid item xs={6}>
//                               <SelectField
//                                 label={t('Type')}
//                                 name={`payments[${index}].type`}
//                                 values={[
//                                   { id: 'cheque', label: t('Cheque'), value: 'cheque' },
//                                   { id: 'cash', label: t('Cash'), value: 'cash' },
//                                   { id: 'levy', label: t('Levy'), value: 'levy' },
//                                   { id: 'transfer', label: t('Transfer'), value: 'transfer' }
//                                 ]}
//                               />
//                             </Grid>
//                             {(payments[index].type !== 'cash') && (
//                               <Grid item xs={6}>
//                                 <FormTextField
//                                   label={t('Reference')}
//                                   name={`payments[${index}].reference`}
//                                 />
//                               </Grid>
//                             )}
//                           </Grid>
//                           { payments.length > 1 && (
//                             <Box pb={2} display="flex" justifyContent="flex-end">
//                               <Button
//                                 // variant="contained"
//                                 color="primary"
//                                 size="small"
//                                 onClick={() => arrayHelpers.remove(index)}
//                               >
//                                 {t('Remove payment')}
//                               </Button>
//                             </Box>
//                           )}
//                         </>
//                       )))}
//                       <Box display="flex" justifyContent="space-between">
//                         <SubmitButton
//                           size="small"
//                           label={!isSubmitting ? t('Save') : t('Saving')}
//                         />
//                         <Button
//                           // variant="contained"
//                           color="primary"
//                           size="small"
//                           onClick={() => arrayHelpers.push(emptyPayment)}
//                         >
//                           {t('Add payment')}
//                         </Button>
//                       </Box>
//                     </div>
//                   )}
//                 />
//               </FormSection>
//               <FormSection label={t('Additional cost')} defaultExpanded={!!initialValues.extracharge}>
//                 <FormTextField
//                   label={t('Amount')}
//                   name="extracharge"
//                   value={extracharge}
//                 />
//                 <FormTextField
//                   label={t('Description')}
//                   name="noteextracharge"
//                   value={noteextracharge}
//                   multiline
//                   rows={3}
//                 />
//                 <SubmitButton
//                   size="small"
//                   label={!isSubmitting ? t('Save') : t('Saving')}
//                 />
//               </FormSection>

//               <FormSection label={t('Discount')} defaultExpanded={!!initialValues.promo}>
//                 <FormTextField
//                   label={t('Discount')}
//                   name="promo"
//                   value={promo}
//                 />
//                 <FormTextField
//                   label={t('Description')}
//                   name="notepromo"
//                   value={notepromo}
//                   multiline
//                   rows={3}
//                 />
//                 <SubmitButton
//                   size="small"
//                   label={!isSubmitting ? t('Save') : t('Saving')}
//                 />
//               </FormSection>

//               <FormSection label={t('Internal note')} defaultExpanded={!!initialValues.description}>
//                 <FormTextField
//                   label={t('Note')}
//                   name="description"
//                   value={description}
//                   multiline
//                   rows={3}
//                 />
//                 <SubmitButton
//                   size="small"
//                   label={!isSubmitting ? t('Save') : t('Saving')}
//                 />
//               </FormSection>
//             </Form>
//           )
//         }}
//       </Formik>
//     )
//   });