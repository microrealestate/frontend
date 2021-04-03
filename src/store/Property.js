import { observable, action, flow, computed, makeObservable } from 'mobx';
import { useApiFetch } from '../utils/fetch';

export default class Property {
  selected = {};
  filters = { searchText: '', status: 'vacant' };
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

      filteredItems = filteredItems.filter(({ name }) => name.replace(regExp, '').toLowerCase().indexOf(cleanedSearchText) != -1);
    }
    return filteredItems;
  }

  setSelected = property => this.selected = property;

  setFilters = ({ searchText = '', status = '' }) => this.filters = { searchText, status };

  *fetch() {
    try {

      const response = yield useApiFetch().get('/properties');

      this.items = response.data;
      if (this.selected._id) {
        this.setSelected(this.items.find(item => item._id === this.selected._id) || {});
      }
      return { status: 200, data: response.data };
    } catch (error) {
      return { status: error.response.status };
    }
  };

  *fetchOne(propertyId) {
    try {

      const response = yield useApiFetch().get(`/properties/${propertyId}`);

      return { status: 200, data: response.data };
    } catch (error) {
      return { status: error.response.status };
    }
  }
}
