import { ListItemIcon, Typography } from '@material-ui/core';
import { memo, useCallback, useContext, useMemo, useState } from 'react';

//import AccountBalanceWalletIcon from '@material-ui/icons/AccountBalanceWallet';
import DashboardIcon from '@material-ui/icons/Dashboard';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import PeopleIcon from '@material-ui/icons/People';
import ReceiptIcon from '@material-ui/icons/Receipt';
import SettingsIcon from '@material-ui/icons/Settings';
import { StoreContext } from '../store';
import VpnKeyIcon from '@material-ui/icons/VpnKey';
import { nanoid } from 'nanoid';
import { useRouter } from 'next/router';
import { useStyles } from '../styles/components/Nav.styles';
import { useTimeout } from '../utils/hooks';
import useTranslation from 'next-translate/useTranslation';

const MenuItem = memo(function MenuItem({
  item,
  selected,
  open,
  onMouseEnter,
  onMouseLeave,
  onClick,
}) {
  const classes = useStyles();

  return (
    <ListItem
      className={`${classes.item} ${selected ? classes.itemSelected : ''}`}
      button
      selected={selected}
      onClick={() => onClick(item)}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      data-cy={item.dataCy}
    >
      <ListItemIcon classes={{ root: classes.itemIcon }}>
        {item.icon}
      </ListItemIcon>
      <ListItemText
        className={`${classes.itemText} ${
          open ? classes.itemTextOpen : classes.itemTextClose
        }`}
        primary={<Typography noWrap>{item.value}</Typography>}
      />
    </ListItem>
  );
});

const Nav = () => {
  const classes = useStyles();
  const { t } = useTranslation('common');
  const [openDebounced, setOpenDebounced] = useState(false);
  const store = useContext(StoreContext);

  const router = useRouter();
  const { pathname } = router;

  const menuItems = useMemo(
    () => [
      {
        key: nanoid(),
        value: t('Dashboard'),
        pathname: '/dashboard',
        icon: <DashboardIcon />,
        dataCy: 'dashboardNav',
      },
      {
        key: nanoid(),
        value: t('Rents'),
        pathname: '/rents/[yearMonth]',
        icon: <ReceiptIcon />,
        dataCy: 'rentsNav',
      },
      {
        key: nanoid(),
        value: t('Tenants'),
        pathname: '/tenants',
        icon: <PeopleIcon />,
        dataCy: 'tenantsNav',
      },
      {
        key: nanoid(),
        value: t('Properties'),
        pathname: '/properties',
        icon: <VpnKeyIcon />,
        dataCy: 'propertiesNav',
      },
      // {
      //   value: t('Accounting'),
      //   pathname: '/accounting',
      //   icon: <AccountBalanceWalletIcon />,
      //   dataCy: 'accountingNav'
      // },
      {
        key: nanoid(),
        value: t('Settings'),
        pathname: '/settings',
        icon: <SettingsIcon />,
        dataCy: 'settingsNav',
      },
    ],
    []
  );

  const triggerOpen = useTimeout(() => {
    !openDebounced && setOpenDebounced(true);
  }, 1000);

  const triggerClose = useTimeout(() => {
    openDebounced && setOpenDebounced(false);
  }, 1000);

  const handleMenuClick = useCallback(
    (menuItem) => {
      triggerOpen.clear();
      if (store.organization.selected?.name && store.rent?.period) {
        const pathname = menuItem.pathname.replace(
          '[yearMonth]',
          store.rent.period
        );
        router.push(`/${store.organization.selected.name}${pathname}`);
      }
    },
    [store.organization.selected?.name, store.rent?.period]
  );

  const handleMouseEnter = useCallback(() => {
    triggerClose.clear();
    !openDebounced && triggerOpen.start();
  }, [triggerOpen, triggerClose]);

  const handleMouseLeave = useCallback(() => {
    triggerOpen.clear();
    openDebounced && triggerClose.start();
  }, [triggerOpen, triggerClose]);

  return (
    <Drawer
      className={`${openDebounced ? classes.drawerOpen : classes.drawerClose}`}
      variant="permanent"
      classes={{
        paper: openDebounced ? classes.drawerOpen : classes.drawerClose,
      }}
    >
      <List className={classes.list}>
        {menuItems.map((item) => {
          return (
            <MenuItem
              key={item.key}
              item={item}
              selected={pathname.indexOf(item.pathname) !== -1}
              open={openDebounced}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onClick={handleMenuClick}
            />
          );
        })}
      </List>
    </Drawer>
  );
};

export default memo(Nav);
