import React, { useCallback, useContext, useState } from 'react';
import useTranslation from 'next-translate/useTranslation';
import { observer } from 'mobx-react-lite';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import {
  Badge,
  Box,
  Button,
  IconButton,
  Paper,
  Switch,
  TableHead,
  Tooltip,
  Typography,
} from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import DescriptionIcon from '@material-ui/icons/Description';

import { FormSection } from '../Form';
import { StoreContext } from '../../store';
import ConfirmDialog from '../ConfirmDialog';
import ContractDialog from './ContractDialog';
import LeaseForm from './LeaseForm';

const Leases = observer(({ setError }) => {
  const { t } = useTranslation('common');
  const store = useContext(StoreContext);
  const [editLease, setEditLease] = useState(false);
  const [editContract, setEditContract] = useState(false);
  const [removeLease, setRemoveLease] = useState(false);

  const onLeaseAddUpdate = useCallback(
    async (lease) => {
      setError('');

      let status;
      if (!lease._id) {
        const response = await store.lease.create(lease);
        status = response.status;
      } else {
        const response = await store.lease.update(lease);
        status = response.status;
      }

      if (status !== 200) {
        switch (status) {
          case 422:
            return setError(t('Some fields are missing'));
          case 403:
            return setError(t('You are not allowed to update the lease'));
          case 404:
            return setError(t('Lease is not found'));
          case 409:
            return setError(t('The lease already exists'));
          default:
            return setError(t('Something went wrong'));
        }
      }
    },
    [setError]
  );

  const onLeaseRemove = useCallback(
    async (lease) => {
      const { status } = await store.lease.delete([lease._id]);
      if (status !== 200) {
        switch (status) {
          case 422:
            return setError(
              t('One lease is used by tenants, it cannot be removed')
            );
          case 403:
            return setError(t('You are not allowed to update the lease'));
          default:
            return setError(t('Something went wrong'));
        }
      }
    },
    [setError]
  );

  const onLeaseChange = useCallback(
    async (active, lease) => {
      lease.active = active;
      const { status } = await store.lease.update(lease);

      if (status !== 200) {
        switch (status) {
          case 422:
            return setError(t('Some fields are missing'));
          case 403:
            return setError(t('You are not allowed to update the lease'));
          case 404:
            return setError(t('Lease is not found'));
          case 409:
            return setError(t('The lease already exists'));
          default:
            return setError(t('Something went wrong'));
        }
      }
    },
    [setError]
  );

  return (
    <FormSection label={t('Manage leases')}>
      <Box py={2}>
        <LeaseForm
          open={editLease}
          setOpen={setEditLease}
          onSubmit={onLeaseAddUpdate}
        />
      </Box>
      <Paper variant="outlined" square>
        <Table aria-label="lease table">
          <TableHead>
            <TableRow>
              <TableCell>
                <Typography>{t('Contract')}</Typography>
              </TableCell>
              <TableCell>
                <Typography>{t('Number of terms')}</Typography>
              </TableCell>
              <TableCell>
                <Typography>{t('Description')}</Typography>
              </TableCell>
              <TableCell>
                <Typography>{t('Contract')}</Typography>
              </TableCell>
              <TableCell align="center">
                <Typography>{t('Active')}</Typography>
              </TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {React.Children.toArray(
              (store.lease.items || []).map((lease) => {
                return (
                  <TableRow size="small">
                    <TableCell>
                      {lease.system ? (
                        <Typography noWrap>{t(lease.name)}</Typography>
                      ) : (
                        <Button
                          href="#"
                          color="primary"
                          onClick={(event) => {
                            setEditLease(lease);
                            event.preventDefault();
                          }}
                        >
                          <Typography noWrap>{lease.name}</Typography>
                        </Button>
                      )}
                    </TableCell>
                    <TableCell>
                      {lease.system || !lease.numberOfTerms ? (
                        <Typography noWrap>{t('Custom')}</Typography>
                      ) : (
                        <Typography noWrap>
                          {t('{{numberOfTerms}} {{timeRange}}', {
                            numberOfTerms: lease.numberOfTerms,
                            timeRange: lease.timeRange,
                          })}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {lease.system ? (
                        <Typography>{t(lease.description)}</Typography>
                      ) : (
                        <Typography>{lease.description}</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        aria-label="contract"
                        onClick={() => setEditContract(lease)}
                        // disabled={}
                      >
                        <Tooltip
                          title={t('Contract not set')}
                          disableHoverListener={!!lease.templateId}
                        >
                          <Badge
                            color="secondary"
                            variant="dot"
                            overlap="circle"
                            invisible={!!lease.templateId}
                          >
                            <DescriptionIcon />
                          </Badge>
                        </Tooltip>
                      </IconButton>
                    </TableCell>
                    <TableCell align="center">
                      <Switch
                        color={lease.active ? 'primary' : 'default'}
                        checked={lease.active}
                        onChange={(evt) =>
                          onLeaseChange(evt.target.checked, lease)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      {!lease.system && (
                        <Tooltip
                          title={
                            lease.usedByTenants
                              ? t('Lease currently used in tenant contracts')
                              : ''
                          }
                        >
                          <span>
                            <IconButton
                              aria-label="delete"
                              onClick={() => setRemoveLease(lease)}
                              disabled={lease.usedByTenants}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </span>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
        <ContractDialog
          open={editContract}
          setOpen={setEditContract}
          onSubmit={onLeaseAddUpdate}
        />
        <ConfirmDialog
          open={removeLease}
          setOpen={setRemoveLease}
          onConfirm={onLeaseRemove}
        >
          <Typography>{t('Are you sure to remove this lease?')}</Typography>
          <Box py={2}>
            <Typography variant="h6" align="center">
              {removeLease.name}
            </Typography>
          </Box>
        </ConfirmDialog>
      </Paper>
    </FormSection>
  );
});

export default Leases;
