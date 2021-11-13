import * as Yup from 'yup';

import { Box, DialogTitle } from '@material-ui/core';
import { Form, Formik } from 'formik';
import { FormTextField, SubmitButton } from '../Form';
import React, { useContext, useState } from 'react';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import RequestError from '../RequestError';
import { StoreContext } from '../../store';
import useTranslation from 'next-translate/useTranslation';

const validationSchema = Yup.object().shape({
  name: Yup.string().required(),
});

const initialValues = {
  name: '',
};

const NewLeaseDialog = ({ open, setOpen, onConfirm }) => {
  const { t } = useTranslation('common');
  const store = useContext(StoreContext);
  const [error, setError] = useState('');

  const handleClose = () => {
    setOpen(false);
  };

  const _onSubmit = async (leasePart) => {
    const { status, data } = await store.lease.create(leasePart);
    if (status !== 200) {
      switch (status) {
        case 422:
          return setError(t('Contract name is missing'));
        case 403:
          return setError(t('You are not allowed to create a contract'));
        case 409:
          return setError(t('The contract already exists'));
        default:
          return setError(t('Something went wrong'));
      }
    }

    handleClose(false);
    await onConfirm(data);
  };

  return (
    <Dialog
      maxWidth="sm"
      fullWidth
      open={open}
      onClose={handleClose}
      aria-labelledby="new-contract-dialog"
    >
      <DialogTitle>{t('Create a new contract')}</DialogTitle>
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
                  <FormTextField label={t('Name')} name="name" />
                </DialogContent>
                <DialogActions>
                  <Button onClick={handleClose} color="primary">
                    {t('Cancel')}
                  </Button>
                  <SubmitButton
                    label={!isSubmitting ? t('Create') : t('Creating contract')}
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

export default NewLeaseDialog;
