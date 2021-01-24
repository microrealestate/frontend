import axios from 'axios';
import getConfig from 'next/config'
import FileDownload from 'js-file-download';

import { isServer } from './index';

let apiFetch;
let authApiFetch;
const withCredentials = true;//process.env.NODE_ENV === 'production';

export const setApiHeaders = ({ accessToken, organizationId }) => {
    // console.log('set api headers');
    // console.log({accessToken, organizationId});
    if (accessToken) {
        useApiFetch();
        apiFetch.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    } else if (apiFetch) {
        delete apiFetch.defaults.headers.common['Authorization'];
    }

    if (organizationId) {
        useApiFetch();
        apiFetch.defaults.headers.organizationId = organizationId;
    } else if (apiFetch) {
        delete apiFetch.defaults.headers.organizationId;
    }
}

export const useApiFetch = () => {
    if (!apiFetch) {
        // console.log('create api fetch')
        const { publicRuntimeConfig, serverRuntimeConfig } = getConfig();

        // create axios instance
        if (isServer()) {
            apiFetch = axios.create({
                baseURL: serverRuntimeConfig.API_URL,
                withCredentials
            });
        } else {
            apiFetch = axios.create({
                baseURL: publicRuntimeConfig.API_URL,
                withCredentials
            });
        }

        // add interceptors
        apiFetch.interceptors.response.use(
            response => {
                console.log(`${response.config.method.toUpperCase()} ${response.config.url} ${response.status}`);
                return response;
            },
            error => {
                console.error(`${error.config.method.toUpperCase()} ${error.config.url} ${error.response.status}`);
                // if (!isServer() && [401, 403].includes(error.response.status)) {
                //     window.location.assign('/app/signin');
                //     return;
                // }
                return Promise.reject(error);
            }
        );
    }
    return apiFetch;
}

export const useAuthApiFetch = (cookie) => {
    if (!isServer()) {
        return;
    }

    const { serverRuntimeConfig } = getConfig();
    console.log(JSON.stringify(cookie, null, 1))
    authApiFetch = axios.create({
        baseURL: serverRuntimeConfig.API_URL,
        headers: { cookie },
        withCredentials
    });

    return authApiFetch;
}

export const downloadDocument = async (endpoint, documentName) => {
    const response = await useApiFetch().get(`/documents${endpoint}`, {
        responseType: 'blob',
    });
    FileDownload(response.data, documentName);
}

