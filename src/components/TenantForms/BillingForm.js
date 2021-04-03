import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import { useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { CheckboxField, FormSection, FormTextField, RadioField, RadioFieldGroup, SubmitButton } from '../Form';
import { StoreContext } from '../../store';
import { withTranslation } from '../../utils/i18n';
import { Box } from '@material-ui/core';

const validationSchema = Yup.object().shape({
  reference: Yup.string().required(),
  isVat: Yup.boolean().required(),
  vatRatio: Yup.mixed().when('isVat', {
    is: true,
    then: Yup.number().moreThan(0).max(100),
  }),
  discount: Yup.number().min(0)
});

const Billing = withTranslation()(observer(({ t, readOnly, onSubmit }) => {
  const store = useContext(StoreContext);

  const initialValues = {
    reference: store.tenant.selected?.reference || '',
    isVat: !!store.tenant.selected?.isVat,
    vatRatio: (store.tenant.selected?.vatRatio * 100) || 0,
    discount: store.tenant.selected?.discount || 0
  };

  const _onSubmit = async billing => {
    await onSubmit({
        reference: billing.reference,
        isVat: billing.isVat,
        vatRatio: billing.isVat ? billing.vatRatio / 100 : 0,
        discount: billing.discount
    });
  }

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={_onSubmit}
    >
      {({ isSubmitting, values }) => {
        return (
          <Form autoComplete="off">
            <FormSection label={t('Billing information')}>
              <FormTextField
                label={t('Tenant reference')}
                name="reference"
                disabled={readOnly}
              />
              {store.organization.selected && store.organization.selected.isCompany && (
                <Box display="flex" direction="row" alignItems="flex-end">
                  <CheckboxField
                    name="isVat"
                    //label={t('Subject to VAT')}
                    aria-label={t('Subject to VAT')}
                    disabled={readOnly}
                  />
                  <FormTextField
                    label={t('VAT percentage')}
                    name="vatRatio"
                    disabled={readOnly || !values.isVat}
                  />
                </Box>
              )}
              <FormTextField
                label={t('Discount')}
                name="discount"
                disabled={readOnly}
              />
            </FormSection>
            {!readOnly && (
              <SubmitButton
                size="large"
                label={!isSubmitting ? t('Save') : t('Saving')}
              />
            )}
          </Form>
        )
      }}
    </Formik>
  );
}));

export default Billing;