import { makeObservable, observable } from 'mobx';
import { setAccessToken, setOrganizationId } from '../utils/fetch';

import Dashboard from './Dashboard';
import Document from './Document';
import Lease from './Lease';
import Organization from './Organization';
import Property from './Property';
import Rent from './Rent';
import Template from './Template';
import Tenant from './Tenant';
import User from './User';
import moment from 'moment';

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
    setAccessToken(user.token);

    this.organization.items = organization.items;
    this.organization.selected = organization.selected;
    setOrganizationId(organization.selected?._id);
    moment.locale(organization.selected?.locale || 'en');

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
