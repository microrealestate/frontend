import { observable, action, flow, makeObservable } from 'mobx';
import { useApiFetch } from '../utils/fetch';

export default class Organization {
  selected;
  items = [];

  constructor() {
    makeObservable(this, {
      selected: observable,
      items: observable,
      setSelected: action,
      setItems: action,
      fetch: flow,
      create: flow,
      update: flow,
    });
  }

  setSelected = (org, user) => {
    this.selected = org;
    user.setRole(
      this.selected.members.find(({ email }) => email === user.email).role
    );
  };

  setItems = (organizations = []) => {
    this.items = organizations;
  };

  *fetch() {
    try {
      const response = yield useApiFetch().get('/realms');
      this.setItems(response.data);
      return 200;
    } catch (error) {
      console.error(error);
      return error.response.status;
    }
  }

  *create(organization) {
    try {
      const response = yield useApiFetch().post('/realms', organization);
      return { status: 200, data: response.data };
    } catch (error) {
      console.error(error);
      return { status: error.response.status };
    }
  }

  *update(organization) {
    try {
      const response = yield useApiFetch().patch(
        `/realms/${organization._id}`,
        organization
      );
      return { status: 200, data: response.data };
    } catch (error) {
      console.error(error);
      return { status: error.response.status };
    }
  }
}
