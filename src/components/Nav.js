import {
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

//import AccountBalanceWalletIcon from '@material-ui/icons/AccountBalanceWallet';
import DashboardIcon from '@material-ui/icons/Dashboard';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import { ListItemIcon } from '@material-ui/core';
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

const Nav = () => {
  const classes = useStyles();
  const { t } = useTranslation('common');
  const [open, setOpen] = useState(false);
  const [openDebounced, setOpenDebounced] = useState(false);
  const store = useContext(StoreContext);

  const router = useRouter();
  const { pathname } = router;

  const menuItems = useMemo(
    () => [
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
        icon: <PeopleIcon />,
      },
      {
        value: t('Properties'),
        pathname: '/properties',
        icon: <VpnKeyIcon />,
      },
      // {
      //   value: t('Accounting'),
      //   pathname: '/accounting',
      //   icon: <AccountBalanceWalletIcon />,
      // },
      {
        value: t('Settings'),
        pathname: '/settings',
        icon: <SettingsIcon />,
      },
    ],
    []
  );

  const triggerOpen = useTimeout(() => {
    setOpenDebounced(open);
  }, 1000);

  useEffect(() => {
    triggerOpen.start();
  }, [open]);

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
          const isSelected = pathname.indexOf(item.pathname) !== -1;

          return (
            <ListItem
              key={nanoid()}
              className={`${classes.item} ${
                isSelected ? classes.itemSelected : ''
              }`}
              button
              selected={isSelected}
              onClick={() => handleMenuClick(item)}
              onMouseEnter={() => setOpen(true)}
              onMouseLeave={() => setOpen(false)}
            >
              <ListItemIcon classes={{ root: classes.itemIcon }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                className={`${classes.itemText} ${
                  openDebounced ? classes.itemTextOpen : classes.itemTextClose
                }`}
                primary={item.value}
              />
            </ListItem>
          );
        })}
      </List>
    </Drawer>
  );
};

export default memo(Nav);
