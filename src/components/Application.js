import { useContext } from 'react';
import { useObserver } from 'mobx-react-lite';

import Nav from './Nav'
import { withTranslation } from '../utils/i18n';

import { StoreContext } from '../store';
import { Box } from '@material-ui/core';

const Application = withTranslation()(({ t, children }) => {
    console.log('Application functional component')
    const store = useContext(StoreContext);

    return useObserver(() => {
        const displayNav = store.user.signedIn && store.organization.items && store.organization.items.length;

        return (
            <Box display="flex">
                {displayNav && (
                    <Nav />
                )}
                <Box flexGrow={1}>
                    {children}
                </Box>
            </Box>

        )
    });
});

export default Application;