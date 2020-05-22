import React from 'react';
import { Router, Redirect } from '@reach/router';
import { useObserver } from 'mobx-react';
import SignIn from '../pages/SignIn/SignIn';
import SignUp from '../pages/SignUp/SignUp';
import NotFound from '../pages/NotFound';
import Accounting from '../pages/Accounting';
import App from '../pages/App/App';
import Dashboard from '../pages/Dashboard';
import Landlord from '../pages/Landlord';
import Estates from '../pages/Estates';
import Rents from '../pages/Rents';
import Tenants from '../pages/Tenants';
import { useStore } from '../store';

export default props => {
    return useObserver(() => {
        const { store: { user } } = useStore();
        return (
            <Router basepath="/app">
                {user.signedIn ? (
                    <>
                        <Redirect from="/signin" to="/app/dashboard" noThrow />
                        <Redirect from="/signup" to="/app/dashboard" noThrow />
                        <Redirect from="/" to="/app/dashboard" noThrow />
                        <App path="/">
                            <Dashboard path="/dashboard" />
                            <Rents path="/rents" />
                            <Tenants path="/tenants" />
                            <Estates path="/estates" />
                            <Accounting path="/accounting" />
                            <Landlord path="/landlord" />
                            <NotFound default />
                        </App>
                    </>
                ) : (
                    <>
                        <Redirect from="/" to="/app/signin" noThrow />
                        <SignIn path="/signin" />
                        <SignUp path="/signup" />
                    </>
                )}
                <NotFound default />
            </Router>
        );
    });
};