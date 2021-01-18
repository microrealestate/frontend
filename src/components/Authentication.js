import ErrorPage from 'next/error';
import moment from 'moment';
import { useContext } from 'react';
import { useObserver } from 'mobx-react-lite';
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

        if (pageProps.error) {
            return <ErrorPage statusCode={pageProps.error.statusCode} />
        }

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

            // TODO not refresh token when it is not expired
            await store.user.refreshTokens(context);
            if (!store.user.signedIn) {
                console.log('current refresh token invalid redirecting to /signin')
                redirect(context, '/signin');
                return {};
            }

            try {
                await store.organization.fetch();
                if (store.organization.items.length) {
                    const organizationName = context.query.organization;
                    if (organizationName) {
                        store.organization.setSelected(
                            store.organization.items.find(org => org.name === organizationName),
                            store.user
                        );
                    } else {
                        store.organization.setSelected(
                            store.organization.items[0],
                            store.user
                        );
                    }
                    if (!store.organization.selected) {
                        return  {
                            error: {
                                statusCode: 404
                            }
                        };
                    }
                    await changeLocaleCurency(store.organization.selected.locale, store.organization.selected.currency);
                }
            } catch (error) {
                console.error(error)
                return  {
                    error: {
                        statusCode: 500
                    }
                };
            }
        }

        return PageComponent.getInitialProps ? await PageComponent.getInitialProps(context) : { initialState: { store: JSON.parse(JSON.stringify(store)) } };
    }
    return WithAuth;
}
