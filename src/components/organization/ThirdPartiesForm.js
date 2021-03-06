import { useCallback, useContext, useMemo } from 'react';
import { Form, Formik } from 'formik';
import useTranslation from 'next-translate/useTranslation';
import * as Yup from 'yup';
import { observer } from 'mobx-react-lite';
import { Typography } from '@material-ui/core';
import { FormTextField, SubmitButton, FormSection } from '../Form';
import { StoreContext } from '../../store';

const validationSchema = Yup.object().shape({
  apiKey: Yup.string().required(),
  domain: Yup.string().required(),
  fromEmail: Yup.string().email().required(),
  replyToEmail: Yup.string().email().required(),
});

const ThirdPartiesForm = observer(({ onSubmit }) => {
  const { t } = useTranslation('common');
  const store = useContext(StoreContext);

  const initialValues = useMemo(
    () => ({
      apiKey: store.organization.selected.thirdParties?.mailgun?.apiKey || '',
      domain: store.organization.selected.thirdParties?.mailgun?.domain || '',
      fromEmail:
        store.organization.selected.thirdParties?.mailgun?.fromEmail ||
        store.organization.selected?.contacts?.[0].email ||
        '',
      replyToEmail:
        store.organization.selected.thirdParties?.mailgun?.replyToEmail ||
        store.organization.selected?.contacts?.[0].email ||
        '',
    }),
    [store.organization.selected]
  );

  const _onSubmit = useCallback(
    async (settings) => {
      await onSubmit({
        thirdParties: {
          mailgun: {
            ...settings,
            apiKeyUpdated: settings.apiKey !== initialValues.apiKey,
          },
        },
      });
    },
    [onSubmit]
  );

  const allowedRoles = useMemo(
    () => (store.organization.items ? ['administrator'] : null),
    [store.organization.items]
  );

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={_onSubmit}
    >
      {({ values, isSubmitting }) => {
        return (
          <Form autoComplete="off">
            <FormSection label={t('mailgun')}>
              <Typography>
                {t(
                  'Configuration required by the email service used for sending invoices, notices and all kind of communication to the tenants'
                )}
              </Typography>
              <FormTextField
                label={t('API key')}
                name="apiKey"
                type="password"
                showHidePassword={values.apiKey !== initialValues.apiKey}
                onlyRoles={allowedRoles}
              />
              <FormTextField
                label={t('Domain')}
                name="domain"
                onlyRoles={allowedRoles}
              />
              <FormTextField
                label={t('From Email')}
                name="fromEmail"
                onlyRoles={allowedRoles}
              />
              <FormTextField
                label={t('Reply to email')}
                name="replyToEmail"
                onlyRoles={allowedRoles}
              />
            </FormSection>
            <SubmitButton
              size="large"
              label={!isSubmitting ? t('Save') : t('Saving')}
              onlyRoles={allowedRoles}
            />
          </Form>
        );
      }}
    </Formik>
  );
});

export default ThirdPartiesForm;
