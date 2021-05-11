import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import { withTranslation } from 'next-i18next';
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { observer } from 'mobx-react-lite';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
  Switch,
  TableHead,
  Tooltip,
  Typography,
} from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';

import { FormTextField, SubmitButton, SelectField, FormSection } from '../Form';
import { StoreContext } from '../../store';
import ConfirmDialog from '../ConfirmDialog';

const timeRanges = ['days', 'weeks', 'months', 'years'];

const initialValues = {
  name: '',
  description: '',
  numberOfTerms: '',
  timeRange: '',
  active: true,
  system: false,
};

const FormDialog = withTranslation()(({ t, open, setOpen, onSubmit }) => {
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
    async (leaseType) => {
      await onSubmit(leaseType);
      handleClose();
    },
    [onSubmit]
  );

  const validationSchema = useMemo(
    () =>
      Yup.object().shape({
        name: Yup.string()
          .notOneOf(
            store.leaseType.items
              .filter(({ name }) => open?.name !== name)
              .map(({ name }) => name)
          )
          .required(),
        description: Yup.string(),
        numberOfTerms: Yup.number().integer().min(0),
        timeRange: Yup.string().required(),
        active: Yup.boolean().required(),
      }),
    [store.leaseType.items]
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
                  {addMode ? t('Add lease type') : t('Update lease type')}
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
                      <Grid item xs={12}>
                        <FormTextField
                          label={t('Description')}
                          name="description"
                          multiline
                          rows={3}
                        />
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

const LeaseTypes = withTranslation()(
  observer(({ t, setError }) => {
    const store = useContext(StoreContext);
    const [leaseTypeToEdit, setLeaseTypeToEdit] = useState(false);
    const [leaseTypeToRemove, setLeaseTypeToRemove] = useState(false);

    const onAddUpdateLeaseType = useCallback(
      async (leaseType) => {
        setError('');

        let status;
        if (!leaseType._id) {
          const response = await store.leaseType.create(leaseType);
          status = response.status;
        } else {
          const response = await store.leaseType.update(leaseType);
          status = response.status;
        }

        if (status !== 200) {
          switch (status) {
            case 422:
              return setError(t('Some fields are missing.'));
            case 403:
              return setError(t('You are not allowed to update the lease.'));
            case 404:
              return setError(t('Lease is not found.'));
            case 409:
              return setError(t('The lease already exists.'));
            default:
              return setError(t('Something went wrong'));
          }
        }
      },
      [setError]
    );

    const onRemoveLeaseType = useCallback(
      async (leaseType) => {
        const { status } = await store.leaseType.delete([leaseType._id]);
        if (status !== 200) {
          switch (status) {
            case 422:
              return setError(
                t('One lease is used by tenants. It cannot be removed.')
              );
            case 403:
              return setError(t('You are not allowed to update the lease.'));
            default:
              return setError(t('Something went wrong'));
          }
        }
      },
      [setError]
    );

    const onLeaseTypeChange = useCallback(
      async (active, leaseType) => {
        leaseType.active = active;
        const { status } = await store.leaseType.update(leaseType);

        if (status !== 200) {
          switch (status) {
            case 422:
              return setError(t('Some fields are missing.'));
            case 403:
              return setError(t('You are not allowed to update the lease.'));
            case 404:
              return setError(t('Lease is not found.'));
            case 409:
              return setError(t('The lease already exists.'));
            default:
              return setError(t('Something went wrong'));
          }
        }
      },
      [setError]
    );

    return (
      <FormSection label={t('Manage lease types')}>
        <Box py={2}>
          <FormDialog
            open={leaseTypeToEdit}
            setOpen={setLeaseTypeToEdit}
            onSubmit={onAddUpdateLeaseType}
          />
        </Box>
        <Paper variant="outlined" square>
          <Table aria-label="lease type table">
            <TableHead>
              <TableRow>
                <TableCell>
                  <Typography>{t('Contract')}</Typography>
                </TableCell>
                <TableCell>
                  <Typography>{t('Description')}</Typography>
                </TableCell>
                <TableCell>
                  <Typography>{t('Number of terms')}</Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography>{t('Active')}</Typography>
                </TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {React.Children.toArray(
                (store.leaseType.items || []).map((leaseType) => {
                  return (
                    <TableRow size="small">
                      <TableCell>
                        {leaseType.system ? (
                          <Typography noWrap>{t(leaseType.name)}</Typography>
                        ) : (
                          <Typography noWrap>{leaseType.name}</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {leaseType.system ? (
                          <Typography>{t(leaseType.description)}</Typography>
                        ) : (
                          <Typography>{leaseType.description}</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {leaseType.system || !leaseType.numberOfTerms ? (
                          <Typography noWrap>{t('Custom')}</Typography>
                        ) : (
                          <Typography noWrap>
                            {t('{{numberOfTerms}} {{timeRange}}', {
                              numberOfTerms: leaseType.numberOfTerms,
                              timeRange: leaseType.timeRange,
                            })}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Switch
                          color={leaseType.active ? 'primary' : 'default'}
                          checked={leaseType.active}
                          onChange={(evt) =>
                            onLeaseTypeChange(evt.target.checked, leaseType)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        {!leaseType.system && (
                          <Box whiteSpace="nowrap">
                            <IconButton
                              aria-label="edit"
                              onClick={() => setLeaseTypeToEdit(leaseType)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <Tooltip
                              title={
                                leaseType.usedByTenants
                                  ? t(
                                      'Lease currently used in tenant contracts'
                                    )
                                  : ''
                              }
                            >
                              <span>
                                <IconButton
                                  aria-label="delete"
                                  onClick={() =>
                                    setLeaseTypeToRemove(leaseType)
                                  }
                                  disabled={leaseType.usedByTenants}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                          </Box>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
          <ConfirmDialog
            open={leaseTypeToRemove}
            setOpen={setLeaseTypeToRemove}
            onConfirm={onRemoveLeaseType}
          >
            <Typography>{t('Are you sure to remove this lease?')}</Typography>
            <Box py={2}>
              <Typography variant="h6" align="center">
                {leaseTypeToRemove.name}
              </Typography>
            </Box>
          </ConfirmDialog>
        </Paper>
      </FormSection>
    );
  })
);

export default LeaseTypes;
