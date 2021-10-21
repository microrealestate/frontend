import FileDownload from 'js-file-download';
import axios from 'axios';
import getConfig from 'next/config';
import { isServer } from './index';

const { publicRuntimeConfig, serverRuntimeConfig } = getConfig();
let apiFetch;
let authApiFetch;
const withCredentials = publicRuntimeConfig.CORS_ENABLED;

// TODO: rename useApiFetch as it is not a react hook
/* eslint-disable react-hooks/rules-of-hooks */
export const setApiHeaders = ({
  accessToken,
  organizationId,
  acceptLanguage,
}) => {
  if (accessToken) {
    apiFetcher();
    apiFetch.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
  } else if (apiFetch) {
    delete apiFetch.defaults.headers.common['Authorization'];
  }

  if (organizationId) {
    apiFetcher();
    apiFetch.defaults.headers.organizationId = organizationId;
  } else if (apiFetch) {
    delete apiFetch.defaults.headers.organizationId;
  }

  if (acceptLanguage) {
    apiFetcher();
    apiFetch.defaults.headers['Accept-Language'] = acceptLanguage;
  }
};

export const apiFetcher = () => {
  if (!apiFetch) {
    // console.log('create api fetch')

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
          console.log(config);
          return config;
        },
        function (error) {
          return Promise.reject(error);
        }
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
  if (!isServer()) {
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
