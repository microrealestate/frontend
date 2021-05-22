import * as Yup from 'yup';
import { Form, Formik } from 'formik';
import { useCallback, useContext, useMemo } from 'react';
import { withTranslation } from 'next-i18next';
import { FormSection, FormTextField, SubmitButton } from '../Form';
import { StoreContext } from '../../store';

const validationSchema = Yup.object().shape({
  description: Yup.string(),
});

const InternalNoteForm = withTranslation()(({ t, onSubmit }) => {
  const store = useContext(StoreContext);

  const initialValues = useMemo(
    () => ({
      description: store.rent.selected.description || '',
    }),
    [store.rent.selected]
  );

  const _onSubmit = useCallback(async (values) => {
    const paymentPart = {
      ...values,
    };
    await onSubmit(paymentPart);
  }, []);

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={_onSubmit}
    >
      {({ isSubmitting, values: { description } }) => {
        return (
          <Form autoComplete="off">
            <FormSection
              label={t('Internal note')}
              defaultExpanded={!!initialValues.description}
            >
              <FormTextField
                label={t('Note')}
                name="description"
                value={description}
                multiline
                rows={3}
              />
            </FormSection>
            <SubmitButton label={!isSubmitting ? t('Save') : t('Saving')} />
          </Form>
        );
      }}
    </Formik>
  );
});

export default InternalNoteForm;
