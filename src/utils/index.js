export const isServer = () => typeof window === 'undefined';

export const redirect = (context, path) => {
    context.res.writeHead(302, { Location: `/app${path}` })
    context.res.end()
}