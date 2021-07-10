import ErrorPage from 'next/error';
import getConfig from 'next/config';
import { useContext, useEffect } from 'react';
import { Observer } from 'mobx-react-lite';
import { toJS } from 'mobx';
import Cookies from 'universal-cookie';
import { getStoreInstance, StoreContext } from '../store';
import { isServer, redirect } from '../utils';

const {
  publicRuntimeConfig: { BASE_PATH },
} = getConfig();

export function withAuthentication(PageComponent) {
  const WithAuth = (pageProps) => {
    console.log('WithAuth functional component');
    const store = useContext(StoreContext);

    useEffect(() => {
      if (pageProps.error?.statusCode === 403) {
        window.location.assign(BASE_PATH); // will be redirected to /signin
      }
    }, []);

    if (pageProps.error) {
      if (pageProps.error.statusCode === 403) {
        return null;
      }

      return <ErrorPage statusCode={pageProps.error.statusCode} />;
    }

    return (
      <Observer>
        {() => (store.user.signedIn ? <PageComponent {...pageProps} /> : null)}
      </Observer>
    );
  };

  WithAuth.getInitialProps = async (context) => {
    console.log('WithAuth.getInitialProps');
    const store = getStoreInstance();
    context.store = store;
    if (isServer()) {
      const cookies = new Cookies(context.req.headers.cookie);
      const refreshToken = cookies.get('refreshToken');
      if (!refreshToken) {
        console.log('no refresh token redirecting to /signin');
        redirect(context, '/signin');
        return {};
      }

      // TODO not refresh token when it is not expired
      console.log('Force refresh token');
      // const result = await store.user.refreshTokens(context);
      // if (result.status > 399) {
      //     return {
      //         error: {
      //             statusCode: result.status,
      //             error: buildFetchError(result.error)
      //         }
      //     };
      // }
      await store.user.refreshTokens(context);
      if (!store.user.signedIn) {
        console.log('current refresh token invalid redirecting to /signin');
        redirect(context, '/signin');
        return {};
      }

      try {
        await store.organization.fetch();
        if (store.organization.items.length) {
          const organizationName = context.query.organization;
          if (organizationName) {
            store.organization.setSelected(
              store.organization.items.find(
                (org) => org.name === organizationName
              ),
              store.user
            );
          } else {
            store.organization.setSelected(
              store.organization.items[0],
              store.user
            );
          }
          if (!store.organization.selected) {
            return {
              error: {
                statusCode: 404,
              },
            };
          }
        }
      } catch (error) {
        if (error.response?.status === 403) {
          console.log('current refresh token invalid redirecting to /signin');
          redirect(context, '/signin');
          return {};
        }
        console.error(error);
        return {
          error: {
            statusCode: 500,
            //error: buildFetchError(error)
          },
        };
      }
    }

    const initialProps = PageComponent.getInitialProps
      ? await PageComponent.getInitialProps(context)
      : { initialState: { store: toJS(store) } };

    if (isServer() && initialProps.error?.statusCode === 403) {
      console.log('current refresh token invalid redirecting to /signin');
      redirect(context, '/signin');
      return {};
    }

    return initialProps;
  };
  return WithAuth;
}
