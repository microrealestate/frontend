import { observable, action, flow } from 'mobx';
import { useApiFetch } from '../utils/fetch';

export default class Organization {
  @observable selected;
  @observable items = [];

  @action setSelected = (org, user) => {
    this.selected = org;
    user.setRole(
      this.selected.members
        .find(({ email }) => email === user.email)
        .role
    );
  }

  @action setItems = (organizations = []) => {
    this.items = organizations;
  };

  fetch = flow(function* () {
    try {
      const response = yield useApiFetch().get('/realms');
      this.setItems(response.data);
      return 200;
    } catch (error) {
      console.error(error)
      return error.response.status;
    }
  });

  create = flow(function* (organization) {
    try {
      const response = yield useApiFetch().post('/realms', organization);
      return { status: 200, data: response.data };
    } catch (error) {
      console.error(error);
      return { status: error.response.status };
    }
  });

  update = flow(function* (organization) {
    try {
      const response = yield useApiFetch().patch(`/realms/${organization._id}`, organization);
      return { status: 200, data: response.data };
    } catch (error) {
      console.error(error);
      return { status: error.response.status };
    }
  });
}
