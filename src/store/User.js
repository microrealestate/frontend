import { decorate, observable, flow, computed } from "mobx";
const jwt = require('jsonwebtoken');

export default class User {
    store;
    token;
    tokenExpiry;

    firstName;
    lastName;

    constructor(store) {
        this.store = store;
    }

    get signedIn() {
        return !!this.token;
    }

    signUp = flow(function* (firstname, lastname, email, password) {
        if (!this.signedIn) {
            try {
                yield this.store.apiRequest.post('/authenticator/signup', {
                    firstname,
                    lastname,
                    email,
                    password
                });
            } catch (error) {
                const status = error.response.status;
                switch (status) {
                    case 422:
                        this.store.setError('Some fields are missing.');
                        break;
                    case 409:
                        this.store.setError('This user is already registered.');
                        break;
                    default:
                        this.store.setError('Something goes wrong :(');
                }
            }
        } else {
            this.store.setError('Cannot add a new user when signed in.');
        }
    });

    signIn = flow(function* (email, password) {
        if (!this.signedIn) {
            try {
                const response = yield this.store.apiRequest.post('/authenticator/signin', {
                    email,
                    password
                });
                const { accessToken } = response.data;
                const { account: { firstname, lastname }, exp } = jwt.decode(accessToken);
                this.firstName = firstname;
                this.lastName = lastname;
                this.tokenExpiry = exp;
                this.token = accessToken;
            } catch (error) {
                const status = error.response.status;
                switch (status) {
                    case 422:
                        this.store.setError('Some fields are missing.');
                        break;
                    case 401:
                        this.store.setError('Incorrect email or password.');
                        break;
                    default:
                        this.store.setError('Something goes wrong :(');
                }
            }
        } else {
            this.store.setError('Cannot sign in a user when already signed in.');
        }
    });

    signOut = flow(function* () {
        try {
            yield this.store.apiRequest.delete('/authenticator/signout');
        } catch (error) {
            console.error(error);
        } finally {
            this.firstName = undefined;
            this.lastName = undefined;
            this.tokenExpiry = undefined
            this.token = undefined;
        }
    });

    refreshTokens = flow(function* () {
        try {
            const response = yield this.store.apiRequest.post('/authenticator/refreshtoken');
            const { accessToken } = response.data;
            const { account: { firstname, lastname }, exp } = jwt.decode(accessToken);
            this.firstName = firstname;
            this.lastName = lastname;
            this.tokenExpiry = exp;
            this.token = accessToken;
        } catch (error) {
            console.error(error);
            this.firstName = undefined;
            this.lastName = undefined;
            this.tokenExpiry = undefined
            this.token = undefined;
        }
    });

    forgotPassword = flow(function* (email) {
        if (!this.signedIn) {
            try {
                yield this.store.apiRequest.post('/authenticator/forgotpassword', {
                    email
                });
            } catch (error) {
                const status = error.response.status;
                switch (status) {
                    case 422:
                        this.store.setError('Some fields are missing.');
                        break;
                    default:
                        this.store.setError('Something goes wrong :(');
                }
            }
        } else {
            this.store.setError('Cannot reset password if user is already signed in.');
        }
    });

    resetPassword = flow(function* (resetToken, password) {
        if (!this.signedIn) {
            try {
                yield this.store.apiRequest.patch('/authenticator/resetpassword', {
                    resetToken,
                    password
                });
            } catch (error) {
                const status = error.response.status;
                switch (status) {
                    case 422:
                        this.store.setError('Some fields are missing.');
                        break;
                    case 403:
                        this.store.setError('Invalid reset link');
                        break;
                    default:
                        this.store.setError('Something goes wrong :(');
                }
            }
        } else {
            this.store.setError('Cannot reset password if user is already signed in.');
        }
    });
};

decorate(User, {
    token: observable,
    firstName: observable,
    lastName: observable,
    signedIn: computed
});
