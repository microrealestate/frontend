import { isClient, isServer } from './index';

import FileDownload from 'js-file-download';
import { Mutex } from 'async-mutex';
import axios from 'axios';
import getConfig from 'next/config';
import { getStoreInstance } from '../store';

const { publicRuntimeConfig, serverRuntimeConfig } = getConfig();
let apiFetch;
let authApiFetch;
const withCredentials = publicRuntimeConfig.CORS_ENABLED;

export const setAccessToken = (accessToken) => {
  apiFetcher();
  if (accessToken) {
    apiFetch.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
  } else if (accessToken === null) {
    delete apiFetch.defaults.headers.common['Authorization'];
  }
};

export const setOrganizationId = (organizationId) => {
  apiFetcher();
  if (organizationId) {
    apiFetch.defaults.headers.organizationId = organizationId;
  } else if (organizationId === null) {
    delete apiFetch.defaults.headers.organizationId;
  }
};

export const setAcceptLanguage = (acceptLanguage) => {
  apiFetcher();
  if (acceptLanguage) {
    apiFetch.defaults.headers['Accept-Language'] = acceptLanguage;
  }
};

export const apiFetcher = () => {
  if (!apiFetch) {
    // create axios instance
    if (isServer()) {
      apiFetch = axios.create({
        baseURL: serverRuntimeConfig.API_URL,
        withCredentials,
      });
    } else {
      apiFetch = axios.create({
        baseURL: publicRuntimeConfig.API_URL,
        withCredentials,
      });
    }

    // add interceptors
    if (process.env.NODE_ENV === 'development') {
      apiFetch.interceptors.request.use(
        function (config) {
          console.log(`${config.method.toUpperCase()} ${config.url}`);
          console.log(config);
          return config;
        },
        function (error) {
          return Promise.reject(error);
        }
      );
    }

    if (isClient()) {
      // Call refreshTokens and retry request if accessToken has expired
      // use mutex to avoid race condition when several requests are done in parallel
      const RTMutex = new Mutex();
      apiFetch.interceptors.response.use(
        (response) => response,
        async (error) => {
          try {
            const store = getStoreInstance();
            const config = error.config;
            if (
              store.user.signedIn &&
              !config._retry &&
              // force refresh token when received 401
              (error.response.status === 401 ||
                // force refresh token when expiration is close to 10s
                // this will let the time to execute all api calls which can be trigger between services
                store.user.tokenExpiry * 1000 - Date.now() < 10000)
            ) {
              config._retry = true;
              if (RTMutex.isLocked()) {
                await RTMutex.waitForUnlock();
              } else {
                await RTMutex.runExclusive(async () => {
                  await store.user.refreshTokens();
                });
              }
              if (store.user.signedIn) {
                config.headers['Authorization'] =
                  apiFetch.defaults.headers.common['Authorization'];
                return apiFetch(config);
              } else {
                return window.location.reload();
              }
            }
          } catch (err) {
            console.error(err);
          }
          return Promise.reject(error);
        },
        { synchronous: true }
      );
    }

    apiFetch.interceptors.response.use(
      (response) => {
        console.log(
          `${response.config.method.toUpperCase()} ${response.config.url} ${
            response.status
          }`
        );
        return response;
      },
      (error) => {
        if (error.config?.method && error.response?.status) {
          console.error(
            `${error.config.method.toUpperCase()} ${error.config.url} ${
              error.response.status
            }`
          );
          return Promise.reject(error);
        }
        console.error(error);
        return Promise.reject({ error });
      }
    );
  }
  return apiFetch;
};

export const authApiFetcher = (cookie) => {
  if (isClient()) {
    return;
  }

  const { serverRuntimeConfig } = getConfig();
  authApiFetch = axios.create({
    baseURL: serverRuntimeConfig.API_URL,
    headers: { cookie },
    withCredentials,
  });

  return authApiFetch;
};

export const buildFetchError = (error) => {
  return {
    error: {
      status: error.response?.status,
      statusText: error.response?.statusText,
      headers: error.response?.headers,
      request: {
        url: error.response?.config?.url,
        method: error.response?.config?.method,
        headers: error.response?.config?.headers,
        baseURL: error.response?.config?.baseURL,
        withCredentials: error.response?.config?.withCredentials,
      },
    },
  };
};

export const downloadDocument = async (endpoint, documentName) => {
  const response = await apiFetcher().get(`/documents${endpoint}`, {
    responseType: 'blob',
  });
  FileDownload(response.data, documentName);
};
