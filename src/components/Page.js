import { useState, useContext, cloneElement, useEffect } from 'react';
import { useObserver } from 'mobx-react-lite';
import getConfig from 'next/config';
import { IconButton, Box, Tooltip, Container, Toolbar, AppBar, useScrollTrigger, Typography } from '@material-ui/core';
import PowerSettingsNewIcon from '@material-ui/icons/PowerSettingsNew';

import { withTranslation } from '../utils/i18n';
import OrganizationSwitcher from './OrganizationSwitcher';
import { StoreContext } from '../store';
import Loading from './Loading';
import { useRouter } from 'next/router';

const { publicRuntimeConfig: { DEMO_MODE, APP_NAME, BASE_PATH } } = getConfig();

const Demonstrationbar = withTranslation()(({ t }) => {
  return DEMO_MODE ? (
    <Box color="primary.contrastText" bgcolor="success.dark">
      <Typography variant="button" component="div" align="center">{t('Demonstration mode')}</Typography>
    </Box>
  ) : null;
});

const MainToolbar = withTranslation()(({ t }) => {
  const store = useContext(StoreContext);
  const [anchorEl, setAnchorEl] = useState();

  const signOut = async event => {
    event.preventDefault();
    await store.user.signOut();
    setAnchorEl(null);
    window.location.assign(`${BASE_PATH}/signin`);
  };

  return (
    <Box width="100%" display="flex" alignItems="center" justifyContent="space-between">
      <Typography variant="h5">
        {APP_NAME}
      </Typography>
      <Box display="flex" alignItems="center">
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
    </Box>
  )
});

const ElevationScroll = ({ children }) => {
  const trigger = useScrollTrigger({
    disableHysteresis: true
  });

  return cloneElement(children, {
    elevation: trigger ? 4 : 0,
    style: !trigger ? {
      backgroundColor: 'transparent'
    } : null
  });
};

const Page = ({ children, PrimaryToolbar, SecondaryToolbar, maxWidth = 'lg' }) => {
  console.log('Page functional component')
  const store = useContext(StoreContext);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const routeChangeStart = (url, { shallow }) => {
      if (!shallow) {
        setLoading(true);
      }
    };
    const routeChangeComplete = (url, { shallow }) => {
      if (!shallow) {
        setLoading(false);
      }
    };

    router.events.on('routeChangeStart', routeChangeStart)
    router.events.on('routeChangeComplete', routeChangeComplete)

    return () => {
      router.events.off('routeChangeStart', routeChangeStart)
      router.events.off('routeChangeComplete', routeChangeComplete)
    }
  }, []);

  return useObserver(() => {
    const displayToolbars = store.user.signedIn;

    return (
      <>
        <Demonstrationbar />
        {displayToolbars && (
          <Toolbar>
            <MainToolbar />
          </Toolbar>
        )}
        { !loading && (PrimaryToolbar || SecondaryToolbar) && (
          <ElevationScroll>
            <AppBar
              position="sticky"
            >
              <Toolbar>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  width="100%"
                >
                  <Box>
                    {PrimaryToolbar && PrimaryToolbar}
                  </Box>
                  <Box ml={PrimaryToolbar ? 5 : 0} flexGrow={1} whiteSpace="nowrap">
                    {SecondaryToolbar && SecondaryToolbar}
                  </Box>
                </Box>
              </Toolbar>
            </AppBar>
          </ElevationScroll>
        )}
        <Box mt={(!loading && (PrimaryToolbar || SecondaryToolbar)) ? 4 : 0}>
          <Container
            maxWidth={maxWidth}
          >
            {loading || store.appLoading ? (
              <Loading />
            ) : children}
          </Container>
        </Box>
      </>
    )
  });
};

export default Page;