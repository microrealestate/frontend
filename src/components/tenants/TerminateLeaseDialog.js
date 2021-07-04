import * as Yup from 'yup';
import React, { useContext, useState } from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import { Form, Formik } from 'formik';
import useTranslation from 'next-translate/useTranslation';
import { Box, DialogTitle } from '@material-ui/core';
import { DateField, FormTextField, SubmitButton } from '../Form';
import { StoreContext } from '../../store';
import { toJS } from 'mobx';
import RequestError from '../RequestError';
import moment from 'moment';

const validationSchema = Yup.object().shape({
  terminationDate: Yup.date().required(),
  guarantyPayback: Yup.number().min(0),
});

const TerminateLeaseDialog = ({ open, setOpen }) => {
  const { t } = useTranslation('common');
  const store = useContext(StoreContext);
  const [error, setError] = useState('');

  const initialValues = {
    terminationDate: store.tenant.selected?.terminationDate
      ? moment(store.tenant.selected.terminationDate, 'DD/MM/YYYY')
      : null,
    guarantyPayback: store.tenant.selected?.guarantyPayback,
  };

  const handleClose = () => {
    setOpen(false);
  };

  const _onSubmit = async (tenantPart) => {
    const tenant = {
      ...toJS(store.tenant.selected),
      terminationDate: tenantPart.terminationDate.format('DD/MM/YYYY'),
      guarantyPayback: tenantPart.guarantyPayback || 0,
    };

    const { status, data } = await store.tenant.update(tenant);

    if (status !== 200) {
      switch (status) {
        case 422:
          return setError(t('Tenant name is missing'));
        case 403:
          return setError(t('You are not allowed to update the tenant'));
        case 409:
          return setError(t('The tenant already exists'));
        default:
          return setError(t('Something went wrong'));
      }
    }

    store.tenant.setSelected(data);

    handleClose(false);
  };

  return (
    <Dialog
      maxWidth="sm"
      fullWidth
      open={open}
      onClose={handleClose}
      aria-labelledby="new-tenant-dialog"
    >
      <DialogTitle>
        {t("Terminate {{tenant}}'s lease", {
          tenant: store.tenant.selected.name,
        })}
      </DialogTitle>
      <Box p={1}>
        <RequestError error={error} />
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={_onSubmit}
        >
          {({ isSubmitting }) => {
            return (
              <Form autoComplete="off">
                <DialogContent>
                  <DateField
                    label={t('Termination date')}
                    name="terminationDate"
                    minDate={
                      store.tenant.selected?.beginDate
                        ? moment(store.tenant.selected.beginDate, 'DD/MM/YYYY')
                        : undefined
                    }
                    maxDate={
                      store.tenant.selected?.endDate
                        ? moment(store.tenant.selected.endDate, 'DD/MM/YYYY')
                        : undefined
                    }
                  />
                  <FormTextField
                    label={t('Returned deposit')}
                    name="guarantyPayback"
                  />
                </DialogContent>
                <DialogActions>
                  <Button onClick={handleClose} color="primary">
                    {t('Cancel')}
                  </Button>
                  <SubmitButton
                    label={!isSubmitting ? t('Terminate') : t('Terminating')}
                  />
                </DialogActions>
              </Form>
            );
          }}
        </Formik>
      </Box>
    </Dialog>
  );
};

export default TerminateLeaseDialog;
