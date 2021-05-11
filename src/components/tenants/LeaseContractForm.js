import moment from 'moment';
import * as Yup from 'yup';
import { Children, useContext, useMemo, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Box, Button, Grid } from '@material-ui/core';
import {
  FieldArray,
  Form,
  Formik,
  validateYupSchema,
  yupToFormErrors,
} from 'formik';
import {
  FormTextField,
  SubmitButton,
  FormSection,
  DateField,
  DateRangeField,
  SelectField,
} from '../Form';
import { StoreContext } from '../../store';
import { withTranslation } from '../../utils/i18n';

const validationSchema = Yup.object().shape({
  leaseId: Yup.string().required(),
  beginDate: Yup.date().required(),
  endDate: Yup.date().required(),
  terminationDate: Yup.date()
    .min(Yup.ref('beginDate'))
    .max(Yup.ref('endDate'))
    .nullable(),
  properties: Yup.array()
    .of(
      Yup.object().shape({
        _id: Yup.string().required(),
        rent: Yup.number().min(0),
        expense: Yup.object().shape({
          title: Yup.mixed().when('amount', {
            is: (val) => val > 0,
            then: Yup.string().required(),
          }),
          amount: Yup.number().min(0),
        }),
        entryDate: Yup.date()
          .required()
          .test(
            'entryDate',
            'Date not included in the contract date range',
            (value, context) => {
              const beginDate = context.options.context.beginDate;
              if (value && beginDate) {
                return moment(value).isSameOrAfter(beginDate);
              }
              return true;
            }
          ),
        exitDate: Yup.date()
          .min(Yup.ref('entryDate'))
          .required()
          .test(
            'exitDate',
            'Date not included in the contract date range',
            (value, context) => {
              const endDate = context.options.context.endDate;
              if (value && endDate) {
                return moment(value).isSameOrBefore(endDate);
              }
              return true;
            }
          ),
      })
    )
    .min(1),
  guaranty: Yup.number().min(0).required(),
  guarantyPayback: Yup.number().min(0),
});

const emptyExpense = { title: '', amount: '' };

const emptyProperty = {
  _id: '',
  rent: '',
  expense: emptyExpense,
  entryDate: null,
  exitDate: null,
};

const LeaseContractForm = withTranslation()(
  observer(({ t, readOnly, onSubmit }) => {
    const store = useContext(StoreContext);
    const [contractDuration, setContractDuration] = useState();

    const initialValues = useMemo(() => {
      return {
        leaseId: store.tenant.selected?.leaseId || '',
        beginDate: store.tenant.selected?.beginDate
          ? moment(store.tenant.selected.beginDate, 'DD/MM/YYYY').startOf('day')
          : null,
        endDate: store.tenant.selected?.endDate
          ? moment(store.tenant.selected.endDate, 'DD/MM/YYYY').endOf('day')
          : null,
        terminated: !!store.tenant.selected?.terminationDate,
        terminationDate: store.tenant.selected?.terminationDate
          ? moment(store.tenant.selected.terminationDate, 'DD/MM/YYYY').endOf(
              'day'
            )
          : null,
        properties: store.tenant.selected?.properties?.length
          ? store.tenant.selected.properties.map((property) => {
              return {
                _id: property.property._id,
                rent: property.rent || '',
                expense:
                  (property.expenses.length && property.expenses[0]) ||
                  emptyExpense,
                entryDate: property.entryDate
                  ? moment(property.entryDate, 'DD/MM/YYYY')
                  : null,
                exitDate: property.exitDate
                  ? moment(property.exitDate, 'DD/MM/YYYY')
                  : null,
              };
            })
          : [emptyProperty],
        guaranty: store.tenant.selected?.guaranty,
        guarantyPayback: store.tenant.selected?.guarantyPayback,
      };
    }, [store.tenant.selected]);

    const availableLeases = useMemo(() => {
      return store.leaseType.items.map(({ _id, name, active }) => ({
        id: _id,
        value: _id,
        label: name,
        disabled: !active,
      }));
    }, [store.leaseType.items]);

    const availableProperties = useMemo(() => {
      const currentProperties = store.tenant.selected?.properties
        ? store.tenant.selected.properties.map(({ propertyId }) => propertyId)
        : [];
      return [
        { id: 'none', label: '', value: '' },
        ...store.property.items.map(({ _id, name, status, occupantLabel }) => ({
          id: _id,
          value: _id,
          label: t('{{name}} - {{status}}', {
            name,
            status:
              status === 'occupied'
                ? !currentProperties.includes(_id)
                  ? t('occupied by {{tenantName}}', {
                      tenantName: occupantLabel,
                    })
                  : t('occupied by current tenant')
                : t('vacant'),
          }),
          //disabled: selectedPropertyId !== _id && status === 'occupied'
        })),
      ];
    }, [store.property.items]);

    const _onSubmit = async (lease) => {
      await onSubmit({
        leaseId: lease.leaseId,
        frequency: store.leaseType.items.find(
          ({ _id }) => _id === lease.leaseId
        ).timeRange,
        beginDate: lease.beginDate?.format('DD/MM/YYYY'),
        endDate: lease.endDate?.format('DD/MM/YYYY'),
        terminationDate: lease.terminationDate?.format('DD/MM/YYYY'),
        guaranty: lease.guaranty || 0,
        guarantyPayback: lease.guarantyPayback || 0,
        properties: lease.properties
          .filter((property) => !!property._id)
          .map((property) => {
            return {
              propertyId: property._id,
              rent: property.rent,
              expenses: property.expense.title ? [property.expense] : [],
              entryDate: property.entryDate?.format('DD/MM/YYYY'),
              exitDate: property.exitDate?.format('DD/MM/YYYY'),
            };
          }),
      });
    };

    return (
      <Formik
        initialValues={initialValues}
        validate={(value) => {
          try {
            validateYupSchema(value, validationSchema, true, value);
          } catch (err) {
            return yupToFormErrors(err); //for rendering validation errors
          }
          return {};
        }}
        onSubmit={_onSubmit}
      >
        {({ values, isSubmitting, handleChange }) => {
          const onLeaseTypeChange = (evt) => {
            const leaseType = store.leaseType.items.find(
              ({ _id }) => _id === evt.target.value
            );
            if (leaseType && leaseType.numberOfTerms) {
              setContractDuration(
                moment.duration(leaseType.numberOfTerms, leaseType.timeRange)
              );
            } else {
              setContractDuration();
            }
            handleChange(evt);
          };

          return (
            <Form autoComplete="off">
              {values.terminated && (
                <FormSection label={t('Termination')}>
                  <DateField
                    label={t('Termination date')}
                    name="terminationDate"
                    minDate={values.beginDate.toISOString()}
                    maxDate={values.endDate.toISOString()}
                    disabled={readOnly}
                  />
                  <FormTextField
                    label={t('Returned deposit')}
                    name="guarantyPayback"
                    disabled={readOnly}
                  />
                </FormSection>
              )}
              <FormSection label={t('Lease')}>
                <SelectField
                  label={t('Lease Type')}
                  name="leaseId"
                  values={availableLeases}
                  onChange={onLeaseTypeChange}
                  disabled={readOnly}
                />
                <DateRangeField
                  beginLabel={t('Start date')}
                  beginName="beginDate"
                  endLabel={t('End date')}
                  endName="endDate"
                  duration={contractDuration}
                  disabled={readOnly}
                />
                <FormTextField
                  label={t('Deposit')}
                  name="guaranty"
                  disabled={readOnly}
                />
              </FormSection>
              <FormSection label={t('Properties')}>
                <FieldArray
                  name="properties"
                  render={(arrayHelpers) => (
                    <>
                      {Children.toArray(
                        values.properties.map((property, index) => (
                          <>
                            <Grid container spacing={2}>
                              <Grid item xs={12} md={9}>
                                <SelectField
                                  label={t('Property')}
                                  name={`properties[${index}]._id`}
                                  values={availableProperties}
                                  disabled={readOnly}
                                />
                              </Grid>
                              <Grid item xs={12} md={3}>
                                <FormTextField
                                  label={t('Rent')}
                                  name={`properties[${index}].rent`}
                                  disabled={readOnly}
                                />
                              </Grid>
                              <Grid item xs={12} md={9}>
                                <FormTextField
                                  label={t('Expense')}
                                  name={`properties[${index}].expense.title`}
                                  disabled={readOnly}
                                />
                              </Grid>
                              <Grid item xs={12} md={3}>
                                <FormTextField
                                  label={t('Amount')}
                                  name={`properties[${index}].expense.amount`}
                                  disabled={readOnly}
                                />
                              </Grid>
                              <Grid item xs={12}>
                                <DateRangeField
                                  beginLabel={t('Entry date')}
                                  beginName={`properties[${index}].entryDate`}
                                  endLabel={t('Exit date')}
                                  endName={`properties[${index}].exitDate`}
                                  minDate={values?.beginDate}
                                  maxDate={values?.endDate}
                                  disabled={readOnly}
                                />
                              </Grid>
                            </Grid>
                            {!readOnly && values.properties.length > 1 && (
                              <Box
                                pb={2}
                                display="flex"
                                justifyContent="flex-end"
                              >
                                <Button
                                  // variant="contained"
                                  color="primary"
                                  size="small"
                                  onClick={() => arrayHelpers.remove(index)}
                                >
                                  {t('Remove property')}
                                </Button>
                              </Box>
                            )}
                          </>
                        ))
                      )}
                      {!readOnly && (
                        <Box display="flex" justifyContent="space-between">
                          <Button
                            // variant="contained"
                            color="primary"
                            size="small"
                            onClick={() => arrayHelpers.push(emptyProperty)}
                          >
                            {t('Add property')}
                          </Button>
                        </Box>
                      )}
                    </>
                  )}
                />
              </FormSection>
              {!readOnly && (
                <SubmitButton
                  size="large"
                  label={!isSubmitting ? t('Save') : t('Saving')}
                />
              )}
            </Form>
          );
        }}
      </Formik>
    );
  })
);

export default LeaseContractForm;
