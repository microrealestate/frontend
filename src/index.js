import React, { Suspense } from 'react';
import ReactDOM from 'react-dom';
import { Provider as StoreProvider } from 'mobx-react';
// import { CssBaseline } from '@material-ui/core';
// import { MuiThemeProvider } from '@material-ui/core/styles';
// import theme from './theme';
import Loading from './components/Loading';
import AppRouter from './components/AppRouter';
import Store from './store';
import './styles/styles.css';

Store.create().then(store => {
    ReactDOM.render((
        <StoreProvider store={store} >
            {/* <CssBaseline /> */}
            {/* <MuiThemeProvider theme={theme}> */}
                <Suspense default={<Loading />}>
                    <AppRouter />
                </Suspense>
            {/* </MuiThemeProvider> */}
        </StoreProvider>
    ), document.getElementById('root'));
});
