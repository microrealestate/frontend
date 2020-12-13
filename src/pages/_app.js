import App from 'next/app'
import { useEffect } from 'react';
import _ from 'lodash';
import Head from 'next/head';
import DateFnsUtils from '@date-io/moment';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import { ThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import Application from '../components/Application';
import { appWithTranslation } from '../utils/i18n';
import { InjectStoreContext } from '../store';


import theme from '../styles/theme';

const MyApp = (props) => {
  console.log('MyApp functional component')
  const { Component, pageProps } = props;

  useEffect(() => {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector('#jss-server-side');
    if (jssStyles) {
      jssStyles.parentElement.removeChild(jssStyles);
    }
  }, []);

  return (
    <>
      <Head>
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
      </Head>
      <ThemeProvider theme={theme}>
        {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
        <CssBaseline />
        <InjectStoreContext initialData={pageProps.initialState.store}>
          <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <Application {...pageProps }>
              <Component {...pageProps } />
            </Application>
          </MuiPickersUtilsProvider>
        </InjectStoreContext>
      </ThemeProvider>
    </>
  );
}

MyApp.getInitialProps = async appContext => {
  console.log('MyApp.getInitialProps')
  const appProps = await App.getInitialProps(appContext);
  if (!appProps.pageProps.initialState) {
    appProps.pageProps.initialState = {};
  }
  console.log(appProps)
  return appProps;
}

export default appWithTranslation(MyApp);
