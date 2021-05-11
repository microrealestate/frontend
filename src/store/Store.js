import moment from 'moment';
import { makeObservable, observable, reaction } from 'mobx';

import User from './User';
import Organization from './Organization';
import Rent from './Rent';
import Tenant from './Tenant';
import Property from './Property';
import Lease from './Lease';
import { setApiHeaders } from '../utils/fetch';
import { isServer } from '../utils';
import { i18n } from '../utils/i18n';

export default class Store {
  user = new User();
  organization = new Organization();
  leaseType = new Lease();
  rent = new Rent();
  tenant = new Tenant();
  property = new Property();

  constructor() {
    makeObservable(this, {
      user: observable,
      organization: observable,
      leaseType: observable,
      rent: observable,
      tenant: observable,
      property: observable,
    });

    let refreshTokenHandle;
    reaction(
      () => this.user.token,
      (token) => {
        // console.log('react to access token changed')
        setApiHeaders({
          accessToken: token,
          organizationId:
            this.organization && this.organization.selected
              ? this.organization.selected._id
              : undefined,
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
            }, this.user.tokenExpiry * 1000 - Date.now() - 10000);
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
      async (organization) => {
        setApiHeaders({
          accessToken: this.user.token,
          organizationId: organization ? organization._id : undefined,
        });
        moment.locale(this.organization.selected.locale || 'en');
        await i18n.changeLanguage(this.organization.selected.locale || 'en');
      }
    );
    reaction(
      () => this.organization.selected?.locale,
      async (locale) => {
        moment.locale(locale || 'en');
        await i18n.changeLanguage(locale || 'en');
      }
    );
  }

  hydrate(initialData) {
    if (!initialData) {
      return;
    }

    console.log('hydrate store');
    const {
      user = {},
      organization = {
        items: [],
      },
      leaseType = {
        items: [],
      },
      rent = {
        items: [],
      },
      tenant = {
        items: [],
      },
      property = {
        items: [],
      },
    } = initialData;

    this.user.firstName = user.firstName;
    this.user.lastName = user.lastName;
    this.user.email = user.email;
    this.user.role = user.role;
    this.user.token = user.token;
    this.user.tokenExpiry = user.tokenExpiry;

    this.organization.items = organization.items;
    this.organization.selected = organization.selected;

    this.leaseType.items = leaseType.items;

    this.rent.items = rent.items;
    this.rent.selected = rent.selected;
    this.rent.filters = rent.filters;
    this.rent.setPeriod(rent._period ? moment(rent._period) : moment());
    this.rent.countAll = rent.countAll;
    this.rent.countPaid = rent.countPaid;
    this.rent.countPartiallyPaid = rent.countPartiallyPaid;
    this.rent.countNotPaid = rent.countNotPaid;
    this.rent.totalToPay = rent.totalToPay;
    this.rent.totalPaid = rent.totalPaid;
    this.rent.totalNotPaid = rent.totalNotPaid;

    this.tenant.items = tenant.items;
    this.tenant.selected = tenant.selected;
    this.tenant.filters = tenant.filters;

    this.property.items = property.items;
    this.property.selected = property.selected;
    this.property.filters = property.filters;
  }
}
