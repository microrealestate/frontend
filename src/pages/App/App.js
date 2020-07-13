import React, { useState } from 'react';
import Link from '@material-ui/core/Link';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import IconButton from '@material-ui/core/IconButton';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import ListItemText from '@material-ui/core/ListItemText';
import AccountBoxIcon from '@material-ui/icons/AccountBox';
import LocationCityIcon from '@material-ui/icons/LocationCity';
import DashboardIcon from '@material-ui/icons/Dashboard';
import ReceiptIcon from '@material-ui/icons/Receipt';
import VpnKeyIcon from '@material-ui/icons/VpnKey';
import PeopleIcon from '@material-ui/icons/People';
import PersonIcon from '@material-ui/icons/Person';
import AccountBalanceWalletIcon from '@material-ui/icons/AccountBalanceWallet';
import { useStore } from '../../store';

import { useStyles } from './App.styles';
import NotFound from '../NotFound';

export default props => {
    const { navigate, children, uri, location: { pathname } } = props;
    const { store: { user } } = useStore();
    const [anchorEl, setAnchorEl] = useState();
    const open = Boolean(anchorEl);
    const menuItems = [
        {
            key: 'dashboard',
            value: 'Dashboard',
            pathname: `${uri}/dashboard`,
            icon: <DashboardIcon />,
        },
        {
            key: 'rents',
            value: 'Rents',
            pathname: `${uri}/rents`,
            icon: <ReceiptIcon />,
        },
        {
            key: 'tenants',
            value: 'Tenants',
            pathname: `${uri}/tenants`,
            icon: <PeopleIcon />
        },
        {
            key: 'estates',
            value: 'Estates',
            pathname: `${uri}/estates`,
            icon: <VpnKeyIcon />
        },
        {
            key: 'accounting',
            value: 'Accounting',
            pathname: `${uri}/accounting`,
            icon: <AccountBalanceWalletIcon />
        },
        {
            key: 'landlord',
            value: 'Landlord',
            pathname: `${uri}/landlord`,
            icon: <AccountBoxIcon />
        }
    ];
    const selectedMenu = menuItems.find(menuItem => menuItem.pathname === pathname);

    if (!selectedMenu) {
        return <NotFound />;
    }

    const classes = useStyles();

    const handleMenuClick = async (event, menuItem) => {
        event.preventDefault();
        await navigate(menuItem.key);
    };

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const signOut = async event => {
        event.preventDefault();
        await user.signOut();
        await navigate(process.env.PUBLIC_URL);
        setAnchorEl(null);
    };

    const viewProfile = event => {
        event.preventDefault();
        setAnchorEl(null);
    };

    return (
        <div className={classes.root} path="/">
            <Drawer
                className={classes.drawer}
                variant="permanent"
                classes={{ paper: classes.drawerPaper }}
            >
                <Link className={classes.logoLink} href="#">
                    <LocationCityIcon className={classes.logoIcon} fontSize="large" />
                    <div className={classes.logoText}>
                        {window.APP_CONFIG.APP_NAME}
                    </div>
                </Link>
                <List className={classes.list}>
                    {menuItems.map(item => {
                        const isSelected = selectedMenu && selectedMenu.key === item.key;

                        return (
                            <ListItem
                                className={`${classes.item} ${classes.itemLink} ${isSelected ? classes.itemSelected : ''}`}
                                button
                                key={item.key}
                                selected={isSelected}
                                onClick={event => handleMenuClick(event, item)}>
                                <div className={classes.itemIcon}>{item.icon}</div>
                                <ListItemText className={classes.itemText} primary={item.value} />
                            </ListItem>
                        );
                    })}
                </List>
            </Drawer>
            <main className={classes.content}>
                <AppBar
                    className={classes.appBar}>
                    <Toolbar className={classes.toolbar}>
                        {selectedMenu && selectedMenu.value && (
                            <Typography variant="h6" className={classes.title}>
                                {selectedMenu.value}
                            </Typography>
                        )}
                        <div>
                            <IconButton
                                aria-label="account of current user"
                                aria-controls="menu-appbar"
                                aria-haspopup="true"
                                onClick={handleMenu}
                                color="inherit"
                            >
                                <PersonIcon />
                            </IconButton>
                            <Menu
                                id="menu-appbar"
                                anchorEl={anchorEl}
                                anchorOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                keepMounted
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                open={open}
                                onClose={handleClose}
                            >
                                <MenuItem onClick={viewProfile}>Profile</MenuItem>
                                <MenuItem onClick={signOut}>Sign out</MenuItem>
                            </Menu>
                        </div>
                    </Toolbar>
                </AppBar>
                {children}
            </main>
        </div>
    );
};
