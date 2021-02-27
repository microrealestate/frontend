import { observable, action, flow, computed, makeObservable } from 'mobx';
import { useApiFetch } from '../utils/fetch';

export default class Tenant {
  selected = {};
  filters = { searchText: '', status: 'inprogress' };
  items = [];

  constructor() {
    makeObservable(this, {
      selected: observable,
      filters: observable,
      items: observable,
      filteredItems: computed,
      setSelected: action,
      setFilters: action,
      fetch: flow,
      fetchOne: flow
    });
  }

  get filteredItems() {
    let filteredItems = this.filters.status === '' ? this.items : this.items.filter(({ status }) => {
      if (status === this.filters.status) {
        return true;
      }

      return false;
    });

    if (this.filters.searchText) {
      const regExp = /\s|\.|-/ig;
      const cleanedSearchText = this.filters.searchText.toLowerCase().replace(regExp, '')

      filteredItems = filteredItems.filter(({ isCompany, name, manager, contacts, properties }) => {
        // Search match name
        let found = name.replace(regExp, '').toLowerCase().indexOf(cleanedSearchText) != -1;

        // Search match manager
        if (!found && isCompany) {
          found = manager.replace(regExp, '').toLowerCase().indexOf(cleanedSearchText) != -1;
        }

        // Search match contact
        if (!found) {
          found = !!contacts
            .map(({ contact = '', email = '', phone = '' }) => ({
              contact: contact.replace(regExp, '').toLowerCase(),
              email: email.toLowerCase(),
              phone: phone.replace(regExp, '')
            }))
            .filter(({ contact, email, phone }) => (
              contact.indexOf(cleanedSearchText) != -1 ||
              email.indexOf(cleanedSearchText) != -1 ||
              phone.indexOf(cleanedSearchText) != -1
            ))
            .length;
        }

        // Search match property name
        if (!found) {
          found = !!properties
            .filter(({ property: { name } }) => (
              name.replace(regExp, '').toLowerCase().indexOf(cleanedSearchText) != -1
            ))
            .length;
        }
        return found;
      });
    }
    return filteredItems;
  }

  setSelected = tenant => this.selected = tenant;

  setFilters = ({ searchText = '', status = '' }) => this.filters = { searchText, status };

  *fetch() {
    try {

      const response = yield useApiFetch().get('/tenants');

      this.items = response.data;
      if (this.selected._id) {
        this.selected = this.items.find(item => item._id === this.selected._id) || {};
      }
      return { status: 200, data: response.data };
    } catch (error) {
      return { status: error.response.status };
    }
  };

  *fetchOne(tenantId) {
    try {

      const response = yield useApiFetch().get(`/tenants/${tenantId}`);

      return { status: 200, data: response.data };
    } catch (error) {
      return { status: error.response.status };
    }
  }
}