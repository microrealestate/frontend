import moment from 'moment';
import { observable, reaction } from 'mobx'

import User from './User'
import Organization from './Organization'
import Rent from './Rent'
import { setApiHeaders } from '../utils/fetch';
import { isServer } from '../utils';

export default class Store {
    @observable user = new User()
    @observable organization = new Organization()
    @observable rent = new Rent()

    constructor() {
      let refreshTokenHandle;
      reaction(
        () => this.user.token,
        token => {
          // console.log('react to access token changed')
          setApiHeaders({
            accessToken: token,
            organizationId: this.organization && this.organization.selected ? this.organization.selected._id : undefined
          });

          if (!isServer()) {
            if (token) {
              // trigger refresh in 5 min - 10 seconds (before expiry date)
              if (refreshTokenHandle) {
                clearTimeout(refreshTokenHandle);
              }
              refreshTokenHandle = setTimeout(async () => {
                await this.user.refreshTokens();
                if (!this.user.signedIn) {
                  // TODO display a dialog before reloading
                  window.location.reload();
                }
              }, (this.user.tokenExpiry * 1000) - Date.now() - 10000);
            } else {
              if (refreshTokenHandle) {
                clearTimeout(refreshTokenHandle);
                refreshTokenHandle = undefined;
              }
            }
          }
        }
      );
      reaction(
        () => this.organization.selected,
        organization => {
          setApiHeaders({
            accessToken: this.user.token,
            organizationId: organization ? organization._id : undefined
          });
        }
      );
    }

    _hydrate(initialData) {
      if (!initialData) {
        return;
      }

      console.log('hydrate store')
      const {
        user = {},
        organization = {
          items: []
        },
        rent = {
          items: []
        }
      } = initialData;

      this.user.firstName = user.firstName
      this.user.lastName = user.lastName
      this.user.token = user.token
      this.user.tokenExpiry = user.tokenExpiry
      this.user.locale = user.locale;
      this.user.currency = user.currency;

      this.organization.items = organization.items;
      this.organization.selected = organization.selected;

      this.rent.items = rent.items;
      this.rent.selected = rent.selected;
      this.rent.filters = rent.filters;
      this.rent.setPeriod(rent._period ? moment(rent._period) : moment());
      this.rent._useCache = rent.items.length !== 0;
      this.rent.countAll = rent.countAll;
      this.rent.countPaid = rent.countPaid;
      this.rent.countPartiallyPaid = rent.countPartiallyPaid;
      this.rent.countNotPaid = rent.countNotPaid;
      this.rent.totalToPay = rent.totalToPay;
      this.rent.totalPaid = rent.totalPaid;
      this.rent.totalNotPaid = rent.totalNotPaid;
    }
  }