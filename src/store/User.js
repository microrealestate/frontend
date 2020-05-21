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

    signUp = flow(function* () {
        if (this.signedIn) {
            yield;
        }
    });

    signIn = flow(function* (email, password) {
        const response = yield this.store.apiRequest.post('/authenticator/signin', {
            email,
            password
        });
        const { accessToken } = response.data;
        const { account: { firstname, lastname }, exp} = jwt.decode(accessToken);
        this.firstName = firstname;
        this.lastName = lastname;
        this.tokenExpiry = exp;
        this.token = accessToken;
    });

    signOut = flow(function* () {
        yield this.store.apiRequest.delete('/authenticator/signout');
        this.firstName = undefined;
        this.lastName = undefined;
        this.tokenExpiry = undefined
        this.token = undefined;
    });

    refreshTokens = flow(function* () {
        const response = yield this.store.apiRequest.post('/authenticator/refreshToken');
        const { accessToken } = response.data;
        const { account: { firstname, lastname }, exp } = jwt.decode(accessToken);
        this.firstName = firstname;
        this.lastName = lastname;
        this.tokenExpiry = exp;
        this.token = accessToken;
    });
};

decorate(User, {
    token: observable,
    firstName: observable,
    lastName: observable,
    signedIn: computed,
});
