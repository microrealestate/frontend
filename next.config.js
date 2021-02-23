// const { nextI18NextRewrites } = require('next-i18next/rewrites');

// const localeSubpaths = {
//   'fr-FR': 'fr-FR',
//   'pt-BR': 'pt-BR'
// };

module.exports = {
  serverRuntimeConfig: {
    API_URL: process.env.DOCKER_API_URL || process.env.API_URL
  },
  publicRuntimeConfig: {
    DEMO_MODE: process.env.DEMO_MODE === 'true',
    APP_NAME: process.env.APP_NAME,
    API_URL: process.env.API_URL,
    CORS_ENABLED: process.env.CORS_ENABLED === 'true',
    BASE_PATH: process.env.BASE_PATH || '',
    // localeSubpaths
  },
  basePath: process.env.BASE_PATH || ''
  // i18n: {
  //   locales: ['en-US', 'fr-FR', 'pt-BR'],
  //   defaultLocale: 'en-US'
  // },
  // redirects: async () => ([
  //   {
  //     source: '/',
  //     destination: '/signin',
  //     permanent: true
  //   }
  // ]),
  // rewrites: async () => nextI18NextRewrites(localeSubpaths)
};