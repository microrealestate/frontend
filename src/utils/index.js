import getConfig from 'next/config';

const {
  publicRuntimeConfig: { BASE_PATH },
} = getConfig();

export const isServer = () => typeof window === 'undefined';

export const redirect = (context, path) => {
  context.res.writeHead(302, { Location: `${BASE_PATH}${path}` });
  context.res.end();
};
