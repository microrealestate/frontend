import React from 'react';
import { Location, Router, Redirect } from '@reach/router';
import { useObserver } from 'mobx-react';
import SignIn from '../pages/SignIn/SignIn';
import SignUp from '../pages/SignUp/SignUp';
import ForgotPassword from '../pages/ForgotPassword/ForgotPassword';
import ResetPassword from '../pages/ResetPassword/ResetPassword';
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
        const { store, store: { user } } = useStore();
        return (
            <Location>
                {({ location }) => {
                    store.clearError();

                    return (
                        <Router>
                            {user.signedIn ? (
                                <>
                                    <Redirect from="/signin" to="/dashboard" noThrow />
                                    <Redirect from="/signup" to="/dashboard" noThrow />
                                    <Redirect from="/" to="/dashboard" noThrow />
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
                                    <SignUp path="/signup" />
                                    <SignIn path="/signin" />
                                    <ForgotPassword path="/forgotpassword" />
                                    <ResetPassword path="/resetpassword/:resetToken" />
                                    <Redirect from="/*" to="/signin" noThrow />
                                </>
                            )}
                        </Router>
                    );
                }}
            </Location>
        );
    });
};