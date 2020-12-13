import { observable, flow, computed } from 'mobx'
const jwt = require('jsonwebtoken')
import { useApiFetch, useAuthApiFetch } from '../utils/fetch'
import { isServer } from '../utils';

export default class User {
    @observable token

    @observable tokenExpiry

    @observable firstName

    @observable lastName

    @observable locale

    @observable currency

    @computed get signedIn() {
        return !!this.token
    }

    signUp = flow(function* (firstname, lastname, email, password) {
        // if (!this.signedIn) {
        //     try {
                yield useApiFetch().post('/authenticator/signup', {
                    firstname,
                    lastname,
                    email,
                    password
                })
        //     } catch (error) {
        //         const status = error.response.status
        //         switch (status) {
        //             case 422:
        //                 this.store.setError('Some fields are missing.')
        //                 break
        //             case 409:
        //                 this.store.setError('This user is already registered.')
        //                 break
        //             default:
        //                 this.store.setError('Something went wrong :(')
        //         }
        //     }
        // } else {
        //     this.store.setError('Cannot add a new user when signed in.')
        // }
    })

    signIn = flow(function* (email, password) {
        // if (!this.signedIn) {
        //     try {
                const response = yield useApiFetch().post('/authenticator/signin', {
                    email,
                    password
                })
                const { accessToken } = response.data
                const { account: { firstname, lastname }, exp } = jwt.decode(accessToken)
                this.firstName = firstname
                this.lastName = lastname
                this.tokenExpiry = exp
                this.token = accessToken
                this.locale = 'fr-FR';
                this.currency = 'EUR';
        //     } catch (error) {
        //         const status = error.response.status
        //         switch (status) {
        //             case 422:
        //                 this.store.setError('Some fields are missing.')
        //                 break
        //             case 401:
        //                 this.store.setError('Incorrect email or password.')
        //                 break
        //             default:
        //                 this.store.setError('Something went wrong :(')
        //         }
        //     }
        // } else {
        //     this.store.setError('Cannot sign in a user when already signed in.')
        // }
    })

    signOut = flow(function* () {
        try {
            yield useApiFetch().delete('/authenticator/signout')
        // } catch (error) {
        //     console.error(error)
        // }
        } finally {
            this.firstName = undefined
            this.lastName = undefined
            this.tokenExpiry = undefined
            this.token = undefined
        }
    })

    refreshTokens = flow(function* (context) {
        try {
            let response;
            if (isServer()) {
                const authFetchApi = useAuthApiFetch(context.req.headers.cookie)
                response = yield authFetchApi.post('/refreshtoken')

                const cookies = response.headers['set-cookie'];
                if (cookies) {
                    context.res.setHeader('Set-Cookie', cookies);
                }
            } else {
                response = yield useApiFetch().post('/authenticator/refreshtoken')
            }
            const { accessToken } = response.data
            const { account: { firstname, lastname }, exp } = jwt.decode(accessToken)
            this.firstName = firstname
            this.lastName = lastname
            this.tokenExpiry = exp
            this.token = accessToken
            this.locale = 'fr-FR';
            this.currency = 'EUR';
        } catch (error) {
            this.firstName = undefined
            this.lastName = undefined
            this.tokenExpiry = undefined
            this.token = undefined
            throw error;
        }
    })

    forgotPassword = flow(function* (email) {
        // if (!this.signedIn) {
            // try {
                yield useApiFetch().post('/authenticator/forgotpassword', {
                    email
                })
            // } catch (error) {
            //     const status = error.response.status
            //     switch (status) {
            //         case 422:
            //             this.store.setError('Some fields are missing.')
            //             break
            //         default:
            //             this.store.setError('Something went wrong :(')
            //     }
            // }
        // } else {
        //     this.store.setError('Cannot reset password if user is already signed in.')
        // }
    })

    resetPassword = flow(function* (resetToken, password) {
        // if (!this.signedIn) {
        //     try {
                yield useApiFetch().patch('/authenticator/resetpassword', {
                    resetToken,
                    password
                })
        //     } catch (error) {
        //         const status = error.response.status
        //         switch (status) {
        //             case 422:
        //                 this.store.setError('Some fields are missing.')
        //                 break
        //             case 403:
        //                 this.store.setError('Invalid reset link')
        //                 break
        //             default:
        //                 this.store.setError('Something went wrong :(')
        //         }
        //     }
        // } else {
        //     this.store.setError('Cannot reset password if user is already signed in.')
        // }
    })
}
