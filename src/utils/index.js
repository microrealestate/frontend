export const isServer = () => typeof window === 'undefined';

export const redirect = (context, Location) => {
    context.res.writeHead(302, { Location })
    context.res.end()
}