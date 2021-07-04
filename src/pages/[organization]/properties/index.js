import { useRouter } from 'next/router';
import { Children, useCallback, useContext, useMemo, useState } from 'react';
import { toJS } from 'mobx';
import { observer } from 'mobx-react-lite';
import {
  Box,
  Button,
  makeStyles,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  withStyles,
} from '@material-ui/core';

import { getStoreInstance, StoreContext } from '../../../store';
import useTranslation from 'next-translate/useTranslation';
import Page from '../../../components/Page';
import { withAuthentication } from '../../../components/Authentication';
import RequestError from '../../../components/RequestError';
import { isServer } from '../../../utils';
import { NumberFormat } from '../../../utils/numberformat';
import SearchFilterBar from '../../../components/SearchFilterBar';
import PropertyAvatar from '../../../components/properties/PropertyAvatar';
import NewPropertyDialog from '../../../components/properties/NewPropertyDialog';

const useStyles = makeStyles((theme) => ({
  vacant: {
    color: theme.palette.success.dark,
  },
}));

const StyledTableRow = withStyles(() => ({
  root: {
    cursor: 'pointer',
  },
}))(TableRow);

const Properties = observer(() => {
  const { t } = useTranslation('common');
  const store = useContext(StoreContext);
  const [openNewPropertyDialog, setOpenNewPropertyDialog] = useState(false);
  const [error /* setError*/] = useState('');
  const router = useRouter();
  const classes = useStyles();

  const filters = useMemo(
    () => [
      { id: '', label: t('All') },
      { id: 'vacant', label: t('Vacant') },
      { id: 'occupied', label: t('Occupied') },
    ],
    []
  );

  const onSearch = useCallback((status, searchText) => {
    store.property.setFilters({ status, searchText });
  }, []);

  const onNewProperty = useCallback(() => {
    setOpenNewPropertyDialog(true);
  }, []);

  const onCreateProperty = useCallback(async (property) => {
    store.property.setSelected(property);
    await router.push(
      `/${store.organization.selected.name}/properties/${property._id}`
    );
  }, []);

  const onClick = useCallback(async (property) => {
    store.property.setSelected(property);
    await router.push(
      `/${store.organization.selected.name}/properties/${property._id}`
    );
  }, []);

  return (
    <Page
      PrimaryToolbar={
        <Typography color="textSecondary" variant="h5" noWrap>
          {t('Properties')}
        </Typography>
      }
      SecondaryToolbar={
        <Box display="flex">
          <Box mr={1} flexGrow={1}>
            <SearchFilterBar
              filters={filters}
              defaultValue={store.property.filters}
              onSearch={onSearch}
            />
          </Box>
          <Box>
            <Button variant="contained" onClick={onNewProperty}>
              {t('New property')}
            </Button>
          </Box>
        </Box>
      }
    >
      <RequestError error={error} />
      <Paper variant="outlined" square>
        <Table aria-label="property table">
          <TableHead>
            <TableRow>
              <TableCell align="center" padding="checkbox"></TableCell>
              <TableCell>
                <Typography>{t('Property')}</Typography>
              </TableCell>
              <TableCell>
                <Typography>{t('Location')}</Typography>
              </TableCell>
              <TableCell align="right">
                <Typography>{t('Rent')}</Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Children.toArray(
              store.property.filteredItems.map((property) => {
                return (
                  <StyledTableRow hover onClick={() => onClick(property)}>
                    <TableCell align="center">
                      <PropertyAvatar
                        type={property.type}
                        status={property.status}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography noWrap>{property.name}</Typography>
                      <Typography noWrap>{property.description}</Typography>
                      <Typography
                        variant="caption"
                        color="textSecondary"
                        component="div"
                        className={
                          property.status === 'vacant' ? classes.vacant : null
                        }
                      >
                        {property.status === 'vacant'
                          ? t('Vacant')
                          : t('Occupied by {{tenant}}', {
                              tenant: property.occupantLabel,
                            })}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {property.address && (
                        <>
                          <Typography>{property.address.street1}</Typography>
                          {property.address.street2 && (
                            <Typography>{property.address.street2}</Typography>
                          )}
                          <Typography>
                            {property.address.zipCode} {property.address.city}
                          </Typography>
                          <Typography>
                            {property.address.state
                              ? `${property.address.state} `
                              : ''}
                            {property.address.country}
                          </Typography>
                        </>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <NumberFormat value={property.price} />
                    </TableCell>
                  </StyledTableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Paper>
      <NewPropertyDialog
        open={openNewPropertyDialog}
        setOpen={setOpenNewPropertyDialog}
        onConfirm={onCreateProperty}
      />
    </Page>
  );
});

Properties.getInitialProps = async (context) => {
  console.log('Properties.getInitialProps');
  const store = isServer() ? context.store : getStoreInstance();

  const { status } = await store.property.fetch();
  if (status !== 200) {
    return { error: { statusCode: status } };
  }

  return {
    initialState: {
      store: toJS(store),
    },
  };
};

export default withAuthentication(Properties);
