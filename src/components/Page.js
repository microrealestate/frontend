import { useState, useContext } from 'react';
import { useObserver } from 'mobx-react-lite';
import getConfig from 'next/config'
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import PowerSettingsNewIcon from '@material-ui/icons/PowerSettingsNew';
import LocationCityIcon from '@material-ui/icons/LocationCity';

import { withTranslation } from '../utils/i18n';

import OrganizationSwitcher from './OrganizationSwitcher';
import { StoreContext } from '../store';
import { Box, Grid, Tooltip } from '@material-ui/core';
import IconTypography from './IconTypography';


const MainToolbar = withTranslation()(({ t }) => {
    const store = useContext(StoreContext);
    const [anchorEl, setAnchorEl] = useState();
    const { publicRuntimeConfig: { APP_NAME } } = getConfig();

    const signOut = async event => {
        event.preventDefault();
        await store.user.signOut();
        setAnchorEl(null);
        window.location.assign('/app/signin')
    };

    return (
        <Box display="flex" justifyContent="flex-end">
            {store.organization.items && store.organization.items.length ? (
                <OrganizationSwitcher />
            ) : (
                    <IconTypography
                        Icon={LocationCityIcon}
                        fontSize="large"
                        variant="h5"
                        color="textSecondary"
                        noWrap
                    >
                        {APP_NAME}
                    </IconTypography>
                )}
            <Tooltip title={t('Sign out')} aria-label="sign out">
                <IconButton
                    aria-label="sign out"
                    onClick={signOut}
                    color="default"
                >
                    <PowerSettingsNewIcon />
                </IconButton>
            </Tooltip>
        </Box>
    )
});


const Page = ({ children, PrimaryToolbar, SecondaryToolbar }) => {
    console.log('Page functional component')
    const store = useContext(StoreContext);

    return useObserver(() => {
        const displayToolbars = store.user.signedIn;

        return (
            <>
                {displayToolbars && (
                    <Toolbar>
                        <Grid container alignItems="center" wrap="nowrap">
                            <Grid item xs={9}>
                                <Grid container alignItems="center" spacing={2} wrap="nowrap">
                                    {PrimaryToolbar && (
                                        <Grid item xs={SecondaryToolbar ? 6 : 12}>
                                            {PrimaryToolbar}
                                        </Grid>
                                    )}
                                    {SecondaryToolbar && (
                                        <Grid item xs={PrimaryToolbar ? 6 : 12}>
                                            {SecondaryToolbar}
                                        </Grid>
                                    )}
                                </Grid>
                            </Grid>
                            <Grid item xs={3}>
                                <MainToolbar />
                            </Grid>
                        </Grid>
                    </Toolbar>
                )}
                <Box px={3}>
                    {children}
                </Box>
            </>
        )
    });
};

export default Page;