import 'quill/dist/quill.snow.css';
import 'moment/locale/fr';
import 'moment/locale/pt';
import '../components/RichTextEditor/richtexteditor.css';

import * as Yup from 'yup';

import { memo, useEffect } from 'react';

import App from 'next/app';
import Application from '../components/Application';
import CssBaseline from '@material-ui/core/CssBaseline';
import DateFnsUtils from '@date-io/moment';
import Head from 'next/head';
import { InjectStoreContext } from '../store';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import { ThemeProvider } from '@material-ui/core/styles';
import theme from '../styles/theme';

Yup.addMethod(Yup.string, 'emails', function (message) {
  return this.test({
    name: 'emails',
    message: message || '${path} one of the emails is invalid or is not unique',
    test: (value) => {
      if (value == null) {
        return true;
      }
      const schema = Yup.string().email();
      const emails = value.replace(/\s/g, '').split(',');
      return (
        emails.every((email) => schema.isValidSync(email)) &&
        emails.length === new Set(emails).size
      );
    },
  });
});

const MyApp = memo(function MyApp(props) {
  console.log('MyApp functional component');
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
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
      </Head>
      <ThemeProvider theme={theme}>
        {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
        <CssBaseline />
        <InjectStoreContext initialData={pageProps.initialState.store}>
          <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <Application {...pageProps}>
              <Component {...pageProps} />
            </Application>
          </MuiPickersUtilsProvider>
        </InjectStoreContext>
      </ThemeProvider>
    </>
  );
});

MyApp.getInitialProps = async (appContext) => {
  console.log('MyApp.getInitialProps');
  const appProps = await App.getInitialProps(appContext);
  if (!appProps.pageProps.initialState) {
    appProps.pageProps.initialState = {};
  }
  return appProps;
};

export default MyApp;
