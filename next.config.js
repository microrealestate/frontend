// const { nextI18NextRewrites } = require('next-i18next/rewrites');

// const localeSubpaths = {
//   'fr-FR': 'fr-FR',
//   'pt-BR': 'pt-BR'
// };

module.exports = {
  serverRuntimeConfig: {
    LOCA_URL: process.env.LOCA_URL,
    AUTHENTICATOR_URL: process.env.AUTHENTICATOR_URL
  },
  publicRuntimeConfig: {
    APP_NAME: process.env.APP_NAME,
    API_URL: process.env.API_URL,
    // localeSubpaths
  },
  basePath: '/app'
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