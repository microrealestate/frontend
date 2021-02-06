import { useState, useContext } from 'react';
import { useObserver } from 'mobx-react-lite';
import { IconButton, Box, Tooltip, Container, Toolbar } from '@material-ui/core';
import PowerSettingsNewIcon from '@material-ui/icons/PowerSettingsNew';

import { withTranslation } from '../utils/i18n';

import OrganizationSwitcher from './OrganizationSwitcher';
import { StoreContext } from '../store';

const MainToolbar = withTranslation()(({ t }) => {
    const store = useContext(StoreContext);
    const [anchorEl, setAnchorEl] = useState();

    const signOut = async event => {
        event.preventDefault();
        await store.user.signOut();
        setAnchorEl(null);
        window.location.assign('/app/signin')
    };

    return (
        <Box display="flex" justifyContent="flex-end">
            {store.organization.items && store.organization.items.length && (
                <OrganizationSwitcher />
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

const Page = ({ children, PrimaryToolbar, SecondaryToolbar, maxWidth = 'lg' }) => {
    console.log('Page functional component')
    const store = useContext(StoreContext);

    return useObserver(() => {
        const displayToolbars = store.user.signedIn;

        return (
            <>
                {displayToolbars && (
                    <Toolbar>
                        <Box display="flex" alignItems="center" width="100%">
                            <Box width="100%" flexGrow={1}>
                                {PrimaryToolbar && PrimaryToolbar}
                            </Box>
                            <Box mx={5} flexGrow={0} whiteSpace="nowrap">
                                {SecondaryToolbar && SecondaryToolbar}
                            </Box>
                            <MainToolbar />
                        </Box>
                    </Toolbar>
                )}
                <Container maxWidth={maxWidth}>
                    <Box mt={4}>
                        {children}
                    </Box>
                </Container>
            </>
        )
    });
};

export default Page;