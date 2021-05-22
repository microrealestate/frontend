import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import { useCallback, useContext, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import cc from 'currency-codes';
import getSymbolFromCurrency from 'currency-symbol-map';
import {
  FormTextField,
  SubmitButton,
  RadioFieldGroup,
  RadioField,
  SelectField,
  FormSection,
} from '../Form';
import { StoreContext } from '../../store';
import { withTranslation } from 'next-i18next';

const validationSchema = Yup.object().shape({
  name: Yup.string().required(),
  locale: Yup.string().required(),
  currency: Yup.string().required(),
  isCompany: Yup.string().required(),
  legalStructure: Yup.mixed().when('isCompany', {
    is: 'true',
    then: Yup.string().required(),
  }),
  company: Yup.mixed().when('isCompany', {
    is: 'true',
    then: Yup.string().required(),
  }),
  ein: Yup.mixed().when('isCompany', {
    is: 'true',
    then: Yup.string().required(),
  }),
  capital: Yup.number().moreThan(0).required(),
});

const currencies = [
  { id: 'none', label: '', value: '' },
  ...cc.data
    .reduce((acc, { code, currency }) => {
      const symbol = getSymbolFromCurrency(code);
      if (symbol) {
        acc.push({
          code,
          currency,
          symbol,
        });
      }
      return acc;
    }, [])
    .sort((c1, c2) => c1.currency.localeCompare(c2.currency))
    .map(({ code, currency, symbol }) => ({
      id: code,
      label: `${currency} (${symbol})`,
      value: code,
    })),
];

const languages = [
  { id: 'none', label: '', value: '' },
  { id: 'pt-BR', label: 'Brasileiro', value: 'pt-BR' },
  { id: 'en', label: 'English', value: 'en' },
  { id: 'fr-FR', label: 'Français (France)', value: 'fr-FR' },
];

const LandlordForm = withTranslation()(
  observer(({ t, onSubmit }) => {
    const store = useContext(StoreContext);

    const initialValues = useMemo(
      () => ({
        name: store.organization.selected?.name,
        locale: store.organization.selected?.locale || '',
        currency: store.organization.selected?.currency || '',
        isCompany: store.organization.selected?.isCompany ? 'true' : 'false',
        legalRepresentative:
          store.organization.selected?.companyInfo?.legalRepresentative || '',
        legalStructure:
          store.organization.selected?.companyInfo?.legalStructure || '',
        company: store.organization.selected?.companyInfo?.name || '',
        ein: store.organization.selected?.companyInfo?.ein || '',
        capital: store.organization.selected?.companyInfo?.capital || '',
      }),
      [store.organization.selected]
    );

    const _onSubmit = useCallback(
      async (settings) => {
        const updatedSettings = {
          name: settings.name,
          isCompany: settings.isCompany === 'true',
          currency: settings.currency,
          locale: settings.locale,
        };

        if (updatedSettings.isCompany) {
          updatedSettings.companyInfo = {
            ...store.organization.selected.companyInfo,
            name: settings.company,
            ein: settings.ein,
            legalRepresentative: settings.legalRepresentative,
            legalStructure: settings.legalStructure,
            capital: settings.capital,
          };
        }

        await onSubmit(updatedSettings);
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
              <FormSection label={t('Landlord information')}>
                <FormTextField
                  label={t('Organization/Landlord name')}
                  name="name"
                  onlyRoles={allowedRoles}
                />
                <SelectField
                  label={t('Language')}
                  name="locale"
                  values={languages}
                  onlyRoles={allowedRoles}
                />
                <SelectField
                  label={t('Currency')}
                  name="currency"
                  values={currencies}
                  onlyRoles={allowedRoles}
                />
                <RadioFieldGroup
                  aria-label="organization type"
                  label={t('The organization/landlord belongs to')}
                  name="isCompany"
                >
                  <RadioField
                    value="false"
                    label={t('A personal account')}
                    onlyRoles={allowedRoles}
                  />
                  <RadioField
                    value="true"
                    label={t('A business or an institution')}
                    onlyRoles={allowedRoles}
                  />
                </RadioFieldGroup>
                {values.isCompany === 'true' && (
                  <>
                    <FormTextField
                      label={t('Legal representative')}
                      name="legalRepresentative"
                      onlyRoles={allowedRoles}
                    />
                    <FormTextField
                      label={t('Legal structure')}
                      name="legalStructure"
                      onlyRoles={allowedRoles}
                    />
                    <FormTextField
                      label={t('Name of business or institution')}
                      name="company"
                      onlyRoles={allowedRoles}
                    />
                    <FormTextField
                      label={t('Employer Identification Number')}
                      name="ein"
                      onlyRoles={allowedRoles}
                    />
                    <FormTextField
                      label={t('Capital')}
                      name="capital"
                      onlyRoles={allowedRoles}
                    />
                  </>
                )}
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
  })
);

export default LandlordForm;
