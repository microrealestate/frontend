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
    try {
      yield useApiFetch().post('/authenticator/signup', {
        firstname,
        lastname,
        email,
        password
      })
      return 200;
    } catch (error) {
      return error.response.status;
    }
  })

  signIn = flow(function* (email, password) {
    try {
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
      return 200;
    } catch (error) {
      console.error(error);
      return error.response.status
    }
  })

  signOut = flow(function* () {
    try {
      yield useApiFetch().delete('/authenticator/signout')
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
    try {
      yield useApiFetch().post('/authenticator/forgotpassword', {
        email
      });
      return 200;
    } catch (error) {
      console.error(error);
      return error.response.status
    }
  })

  resetPassword = flow(function* (resetToken, password) {
    try {
      yield useApiFetch().patch('/authenticator/resetpassword', {
        resetToken,
        password
      });
      return 200;
    } catch (error) {
      console.error(error);
      return error.response.status;
    }
  })
}
