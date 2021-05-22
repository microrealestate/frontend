import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Typography,
} from '@material-ui/core';
import { FormTextField, SubmitButton, SelectField } from '../Form';
import { withTranslation } from 'next-i18next';
import { StoreContext } from '../../store';

const timeRanges = ['days', 'weeks', 'months', 'years'];

const initialValues = {
  name: '',
  description: '',
  numberOfTerms: '',
  timeRange: '',
  active: true,
  system: false,
};

const LeaseForm = withTranslation()(({ t, open, setOpen, onSubmit }) => {
  const store = useContext(StoreContext);
  const [addMode, setAddMode] = useState(true);

  useEffect(() => {
    if (open) {
      setAddMode(!open.name);
    }
  }, [open]);

  const handleClickOpen = useCallback(() => {
    setOpen(initialValues);
  }, [setOpen]);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  const _onSubmit = useCallback(
    async (lease) => {
      await onSubmit(lease);
      handleClose();
    },
    [onSubmit]
  );

  const validationSchema = useMemo(
    () =>
      Yup.object().shape({
        name: Yup.string()
          .notOneOf(
            store.lease.items
              .filter(({ name }) => open?.name !== name)
              .map(({ name }) => name)
          )
          .required(),
        description: Yup.string(),
        numberOfTerms: Yup.number().integer().min(0),
        timeRange: Yup.string().required(),
        active: Yup.boolean().required(),
      }),
    [store.lease.items]
  );

  return (
    <>
      <Button variant="contained" color="primary" onClick={handleClickOpen}>
        {t('Add lease')}
      </Button>
      <Dialog
        open={!!open}
        onClose={handleClose}
        aria-labelledby="form-dialog-title"
      >
        <Formik
          initialValues={open || initialValues}
          validationSchema={validationSchema}
          onSubmit={_onSubmit}
        >
          {({ values, isSubmitting }) => {
            return (
              <Form autoComplete="off">
                <DialogTitle id="form-dialog-title">
                  {addMode ? t('Add lease') : t('Update lease')}
                </DialogTitle>
                <DialogContent>
                  {addMode && (
                    <DialogContentText>
                      {t('Add a new lease to your organization')}
                    </DialogContentText>
                  )}
                  {!addMode && values.usedByTenants && (
                    <Box color="warning.dark">
                      <Typography>
                        {t(
                          'This lease is currently used in tenant contracts, only name and description fields can be updated'
                        )}
                      </Typography>
                    </Box>
                  )}
                  <Box minHeight={100} minWidth={500}>
                    <Grid container spacing={1}>
                      <Grid item xs={12}>
                        <FormTextField label={t('Name')} name="name" />
                      </Grid>
                      <Grid item xs={6}>
                        <FormTextField
                          label={t('Number of terms')}
                          name="numberOfTerms"
                          disabled={values.usedByTenants}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <SelectField
                          label={t('Time range')}
                          name="timeRange"
                          values={timeRanges.map((timeRange) => ({
                            id: timeRange,
                            label: t(timeRange),
                            value: timeRange,
                          }))}
                          disabled={values.usedByTenants}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <FormTextField
                          label={t('Description')}
                          name="description"
                          multiline
                          rows={2}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                </DialogContent>
                <DialogActions>
                  <Button onClick={handleClose}>{t('Cancel')}</Button>
                  <SubmitButton
                    label={
                      !isSubmitting
                        ? addMode
                          ? t('Add')
                          : t('Update')
                        : t('Submitting')
                    }
                  />
                </DialogActions>
              </Form>
            );
          }}
        </Formik>
      </Dialog>
    </>
  );
});

export default LeaseForm;
