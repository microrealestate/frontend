const path = require('path');
const _ = require('lodash');
const NextI18Next = require('next-i18next').default;
// const { localeSubpaths } = require('next/config').default().publicRuntimeConfig;

module.exports = new NextI18Next({
    otherLanguages: ['fr-FR', 'pt-BR'],
    defaultNS: 'common',
    // localeSubpaths,
    localePath: path.resolve('./public/static/locales'),
});

// const i18NextRouterPush = nextI18Next.Router.push;

// nextI18Next.Router.resolvePathname = ({ pathname = '', query = {} }) => Object.entries(query).reduce(
//     (pathname, [name, value]) => _.replace(pathname, `[${name}]`, value),
//     pathname
// );

// nextI18Next.Router.push = async (url, as, options) => {
//     if (url.pathname && url.query) {
//         url = nextI18Next.Router.resolvePathname({ pathname: url.pathname, query: url.query });
//     }
//     return await i18NextRouterPush(url, as, options)
// }

// module.exports = nextI18Next;
