import { observable, action, flow, computed, makeObservable } from 'mobx';
import { useApiFetch } from '../utils/fetch';

export default class Template {
  selected = {};
  filters = { searchText: '', type: '' };
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
      fetchOne: flow,
      create: flow,
      update: flow,
      delete: flow,
    });
  }

  get filteredItems() {
    let filteredItems =
      this.filters.type === ''
        ? this.items
        : this.items.filter(({ type }) => {
            if (type === this.filters.type) {
              return true;
            }

            return false;
          });

    if (this.filters.searchText) {
      const regExp = /\s|\.|-/gi;
      const cleanedSearchText = this.filters.searchText
        .toLowerCase()
        .replace(regExp, '');

      filteredItems = filteredItems.filter(({ name, description }) => {
        // Search match name
        let found =
          name.replace(regExp, '').toLowerCase().indexOf(cleanedSearchText) !=
          -1;

        // Search match manager
        if (!found && description) {
          found =
            description
              .replace(regExp, '')
              .toLowerCase()
              .indexOf(cleanedSearchText) != -1;
        }

        return found;
      });
    }
    return filteredItems;
  }

  setSelected = (template) => (this.selected = template);

  setFilters = ({ searchText = '', status = '' }) =>
    (this.filters = { searchText, status });

  *fetch() {
    try {
      const response = yield useApiFetch().get('/templates');

      this.items = response.data;
      if (this.selected._id) {
        this.setSelected(
          this.items.find((item) => item._id === this.selected._id) || {}
        );
      }
      return { status: 200, data: response.data };
    } catch (error) {
      return { status: error.response.status };
    }
  }

  *fetchOne(templateId) {
    try {
      const response = yield useApiFetch().get(`/templates/${templateId}`);

      return { status: 200, data: response.data };
    } catch (error) {
      return { status: error.response.status };
    }
  }

  *create(template) {
    try {
      const response = yield useApiFetch().post('/templates', template);
      const createdTemplate = response.data;
      this.items.push(createdTemplate);

      return { status: 200, data: createdTemplate };
    } catch (error) {
      return { status: error.response.status };
    }
  }

  *update(template) {
    try {
      const response = yield useApiFetch().put('/templates', template);
      const updatedTemplate = response.data;
      const index = this.items.findIndex((item) => item._id === template._id);
      if (index > -1) {
        this.items.splice(index, 1, updatedTemplate);
      }
      if (this.selected._id === updatedTemplate._id) {
        this.setSelected(updatedTemplate);
      }
      return { status: 200, data: updatedTemplate };
    } catch (error) {
      return { status: error.response.status };
    }
  }

  *delete(ids) {
    try {
      yield useApiFetch().delete(`/templates/${ids.join(',')}`);
      return { status: 200 };
    } catch (error) {
      return { status: error.response.status };
    }
  }
}
