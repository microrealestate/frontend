import React from 'react';
import { Router, Redirect } from '@reach/router';
import { useObserver } from 'mobx-react';
import SignIn from '../pages/SignIn/SignIn';
import NotFound from '../pages/NotFound';
import WebSite from '../pages/WebSite';
import Accounting from '../pages/restricted/Accounting';
import App from '../pages/restricted/App/App';
import Dashboard from '../pages/restricted/Dashboard';
import Landlord from '../pages/restricted/Landlord';
import Estates from '../pages/restricted/Estates';
import Rents from '../pages/restricted/Rents';
import Tenants from '../pages/restricted/Tenants';
import { useStore } from '../store';

export default props => {
    const { store: { user } } = useStore();

    return useObserver(() => (
        <Router basepath="/app">
            <WebSite path="/" />
            {user.signedIn && (
                <Redirect from="/signin" to="/app/admin/dashboard" noThrow />
            )}
            {!user.signedIn && (
                <SignIn path="signin" />
            )}
            {user.signedIn ? (
                <App path="/admin">
                    <Redirect from="/" to="/app/admin/dashboard" noThrow />
                    <Dashboard path="dashboard" />
                    <Rents path="rents" />
                    <Tenants path="tenants" />
                    <Estates path="estates" />
                    <Accounting path="accounting" />
                    <Landlord path="landlord" />
                    <NotFound default />
                </App>
            ) : (
                <Redirect from="/admin/*" to="/app/signin" noThrow />
            )}
            <NotFound default />
        </Router>
    ));
};