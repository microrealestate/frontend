import { useEffect, useState, useRef, useContext, useMemo, useCallback, memo, Children } from 'react';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import DashboardIcon from '@material-ui/icons/Dashboard';
import ReceiptIcon from '@material-ui/icons/Receipt';
import VpnKeyIcon from '@material-ui/icons/VpnKey';
import PeopleIcon from '@material-ui/icons/People';
import SettingsIcon from '@material-ui/icons/Settings';
import AccountBalanceWalletIcon from '@material-ui/icons/AccountBalanceWallet';

import { useStyles } from '../styles/components/Nav.styles';
import { withTranslation } from '../utils/i18n';
import { ListItemIcon } from '@material-ui/core';
import { StoreContext } from '../store';
import { useRouter } from 'next/router';

const Nav = memo(withTranslation()(({ t }) => {
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const [openDebounced, setOpenDebounced] = useState(false);
  const timerRef = useRef();
  const store = useContext(StoreContext);

  const router = useRouter();
  const { pathname } = router;

  const menuItems = useMemo(() => [
    {
      value: t('Dashboard'),
      pathname: '/dashboard',
      icon: <DashboardIcon />,
    },
    {
      value: t('Rents'),
      pathname: '/rents/[yearMonth]',
      icon: <ReceiptIcon />,
    },
    {
      value: t('Tenants'),
      pathname: '/tenants',
      icon: <PeopleIcon />
    },
    {
      value: t('Properties'),
      pathname: '/properties',
      icon: <VpnKeyIcon />
    },
    {
      value: t('Accounting'),
      pathname: '/accounting',
      icon: <AccountBalanceWalletIcon />
    },
    {
      value: t('Settings'),
      pathname: '/settings',
      icon: <SettingsIcon />
    }
  ], []);

  useEffect(() => {
    timerRef.current = setTimeout(() => setOpenDebounced(open), 1000);
    return () => timerRef.current && clearTimeout(timerRef.current);
  }, [open]);

  const handleMenuClick = useCallback(menuItem => {
    timerRef.current && clearTimeout(timerRef.current);
    const pathname = menuItem.pathname.replace('[yearMonth]', store.rent.period);
    router.push(`/${store.organization.selected.name}${pathname}`);
  }, []);

  return (
    <Drawer
      className={`${openDebounced ? classes.drawerOpen : classes.drawerClose}`}
      variant="permanent"
      classes={{ paper: openDebounced ? classes.drawerOpen : classes.drawerClose }}
    >
      <List className={classes.list}>
        {Children.toArray(menuItems.map(item => {
          const isSelected = useMemo(() => pathname.indexOf(item.pathname) !== -1, [pathname]);
          return (
            <ListItem
              className={`${classes.item} ${isSelected ? classes.itemSelected : ''}`}
              button
              selected={isSelected}
              onClick={() => handleMenuClick(item)}
              onMouseOver={() => setOpen(true)}
              onMouseOut={() => setOpen(false)}
            >
              <ListItemIcon classes={{ root: classes.itemIcon }}>{item.icon}</ListItemIcon>
              <ListItemText
                className={`${classes.itemText} ${openDebounced ? classes.itemTextOpen : classes.itemTextClose}`}
                primary={item.value}
              />
            </ListItem>
          );
        }))}
      </List>
    </Drawer>
  );
}));

export default Nav;