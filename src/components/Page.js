import {
  AppBar,
  Box,
  Container,
  Grid,
  IconButton,
  Toolbar,
  Tooltip,
  Typography,
  useScrollTrigger,
} from '@material-ui/core';
import {
  cloneElement,
  memo,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import getConfig from 'next/config';
import Loading from './Loading';
import { observer } from 'mobx-react-lite';
import OrganizationSwitcher from './organization/OrganizationSwitcher';
import PowerSettingsNewIcon from '@material-ui/icons/PowerSettingsNew';
import { StoreContext } from '../store';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

const {
  publicRuntimeConfig: { DEMO_MODE, APP_NAME, BASE_PATH },
} = getConfig();

const Demonstrationbar = memo(function Demonstrationbar() {
  const { t } = useTranslation('common');
  return DEMO_MODE ? (
    <Box color="primary.contrastText" bgcolor="success.dark">
      <Typography variant="button" component="div" align="center">
        {t('Demonstration mode')}
      </Typography>
    </Box>
  ) : null;
});

const MainToolbar = memo(function MainToolbar() {
  const { t } = useTranslation('common');
  const store = useContext(StoreContext);

  const signOut = useCallback(async (event) => {
    event.preventDefault();
    await store.user.signOut();
    window.location.assign(BASE_PATH); // will be redirected to /signin
  }, []);

  return (
    <Box
      width="100%"
      display="flex"
      alignItems="center"
      justifyContent="space-between"
    >
      <Typography variant="h5">{APP_NAME}</Typography>
      <Box display="flex" alignItems="center">
        {!!(store.organization.items && store.organization.items.length) && (
          <OrganizationSwitcher />
        )}
        <Tooltip title={t('Sign out')} aria-label="sign out">
          <IconButton aria-label="sign out" onClick={signOut} color="default">
            <PowerSettingsNewIcon />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
});

const ElevationScroll = memo(({ children }) => {
  const trigger = useScrollTrigger({
    disableHysteresis: true,
  });

  return cloneElement(children, {
    elevation: trigger ? 4 : 0,
    style: !trigger
      ? {
          backgroundColor: 'transparent',
        }
      : null,
  });
});

const Page = observer(
  ({ children, PrimaryToolbar, SecondaryToolbar, maxWidth = 'lg' }) => {
    console.log('Page functional component');
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

      router.events.on('routeChangeStart', routeChangeStart);
      router.events.on('routeChangeComplete', routeChangeComplete);

      return () => {
        router.events.off('routeChangeStart', routeChangeStart);
        router.events.off('routeChangeComplete', routeChangeComplete);
      };
    }, []);

    return (
      <>
        <Demonstrationbar />
        {store.user.signedIn && (
          <Toolbar>
            <MainToolbar />
          </Toolbar>
        )}
        {!loading && (PrimaryToolbar || SecondaryToolbar) && (
          <ElevationScroll>
            <AppBar position="sticky">
              <Toolbar>
                <Grid
                  container
                  alignItems="center"
                  justifyContent="space-between"
                  wrap="nowrap"
                  spacing={5}
                >
                  <Grid item>{PrimaryToolbar}</Grid>
                  <Grid item>{SecondaryToolbar}</Grid>
                </Grid>
              </Toolbar>
            </AppBar>
          </ElevationScroll>
        )}
        <Box mt={!loading && (PrimaryToolbar || SecondaryToolbar) ? 4 : 0}>
          <Container maxWidth={maxWidth}>
            {loading || store.appLoading ? <Loading /> : children}
          </Container>
        </Box>
      </>
    );
  }
);

export default memo(Page);
