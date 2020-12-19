import moment from 'moment';
import { useContext, useEffect } from 'react';
import { useObserver } from 'mobx-react-lite';
import _ from 'lodash';
import Cookies from 'universal-cookie';
import { getStoreInstance, StoreContext } from '../store';

import { isServer, redirect } from '../utils';
import { i18n } from '../utils/i18n';

const changeLocaleCurency = async (locale = 'en', currency = 'EUR') => {
    moment.locale(locale);
    await i18n.changeLanguage(locale);
};

export function withAuthentication(PageComponent) {
    const WithAuth = (pageProps) => {
        console.log('WithAuth functional component')
        const store = useContext(StoreContext);

        return useObserver(() => {
            changeLocaleCurency(store.user.locale, store.user.currency);
            return store.user.signedIn ? <PageComponent {...pageProps} /> : null;
        });
    };

    WithAuth.getInitialProps = async context => {
        console.log('WithAuth.getInitialProps')
        const store = getStoreInstance();
        context.store = store;
        if (isServer()) {
            const cookies = new Cookies(context.req.headers.cookie);
            const refreshToken = cookies.get('refreshToken');
            if (!refreshToken) {
                console.log('no refresh token redirecting to /signin')
                redirect(context, '/signin');
                return {};
            }

            try {
                await store.user.refreshTokens(context)
            } catch (error) {
                console.log('current refresh token invalid redirecting to /signin')
                redirect(context, '/signin');
                return {};
            }

            try {
                await store.organization.fetch();
                const organizationName = context.query.organization;
                if (organizationName) {
                    store.organization.setSelected(
                        store.organization.items.find(org => org.name === organizationName)
                    );
                }
            } catch (error) {
                console.error(error)
            }
            await changeLocaleCurency(store.user.locale, store.user.currency);
        }

        return PageComponent.getInitialProps ? await PageComponent.getInitialProps(context) : { initialState: { store: JSON.parse(JSON.stringify(store)) } };
    }
    return WithAuth;
}
