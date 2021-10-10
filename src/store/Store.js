import { makeObservable, observable, reaction } from 'mobx';

import Dashboard from './Dashboard';
import Document from './Document';
import { isServer } from '../utils';
import Lease from './Lease';
import moment from 'moment';
import Organization from './Organization';
import Property from './Property';
import Rent from './Rent';
import { setApiHeaders } from '../utils/fetch';
import setLanguage from 'next-translate/setLanguage';
import Template from './Template';
import Tenant from './Tenant';
import User from './User';

export default class Store {
  user = new User();
  organization = new Organization();
  lease = new Lease();
  rent = new Rent();
  tenant = new Tenant();
  property = new Property();
  template = new Template();
  document = new Document();
  dashboard = new Dashboard();

  constructor() {
    makeObservable(this, {
      user: observable,
      organization: observable,
      lease: observable,
      rent: observable,
      tenant: observable,
      property: observable,
      template: observable,
      document: observable,
      dashboard: observable,
    });

    let refreshTokenHandle;
    reaction(
      () => this.user.token,
      (token) => {
        // console.log('react to access token changed')
        setApiHeaders({
          accessToken: token,
          organizationId: this.organization?.selected?._id,
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
                // TODO: display a dialog before reloading
                window.location.reload();
              }
            }, this.user.tokenExpiry * 1000 - Date.now() - 10000);
          } else {
            if (refreshTokenHandle) {
              clearTimeout(refreshTokenHandle);
              refreshTokenHandle = null;
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
          organizationId: organization?._id,
        });
        const selectedLocale = this.organization.selected?.locale || 'en';
        moment.locale(selectedLocale);
        if (!isServer()) {
          await setLanguage(selectedLocale);
        }
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
      lease = {
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
      template = {
        items: [],
        fields: [],
      },
      document = {
        items: [],
      },
      dashboard = {
        data: {},
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

    this.lease.items = lease.items;
    this.lease.selected = lease.selected;

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

    this.template.items = template.items;
    this.template.selected = template.selected;
    this.template.fields = template.fields;

    this.document.items = document.items;
    this.document.selected = document.selected;

    this.dashboard.data = dashboard.data;
  }
}
