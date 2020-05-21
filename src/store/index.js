import { useContext } from 'react';
import { decorate, observable, reaction } from "mobx"
import { MobXProviderContext } from 'mobx-react';
import axios from 'axios';

import User from './User';

export default class Store {
    static create = async () => {
        const store = new Store();

        // set/unset the Bearer token
        // trigger refresh token before token expiry date
        let refreshTokenHandle;
        reaction(
            () => store.user.token,
            token => {
                if (token) {
                    store.apiRequest.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                    // trigger refresh in 5 min - 10 seconds (before expiry date)
                    if (refreshTokenHandle) {
                        clearTimeout(refreshTokenHandle);
                    }
                    refreshTokenHandle = setTimeout(async () => {
                        try {
                            await store.user.refreshTokens();
                        } catch (error) {
                            console.error(error);
                            window.location.reload();
                        }
                    }, (store.user.tokenExpiry * 1000) - Date.now() - 10000);
                } else {
                    delete store.apiRequest.defaults.headers.common['Authorization'];
                    if (refreshTokenHandle) {
                        clearTimeout(refreshTokenHandle);
                        refreshTokenHandle = undefined;
                    }
                }
            }
        );

        // refresh token at startup
        try {
            await store.user.refreshTokens();
        } catch (error) {
            console.error(error);
        }

        return store;
    };

    apiRequest = axios.create({
        baseURL: window.APP_CONFIG.API_URL
    });

    user = new User(this);
};
decorate(Store, {
    user: observable
});

export const useStore = () => useContext(MobXProviderContext);
