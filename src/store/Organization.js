import { observable, action, flow } from 'mobx';
import { useApiFetch } from '../utils/fetch';

export default class Organization {
  @observable selected;
  @action setSelected = org => this.selected = org;

  @observable items = [];

  fetch = flow(function* () {
    try {
      const response = yield useApiFetch().get('/realms');
      this.items = response.data;
      return 200;
    } catch (error) {
      return error.response.status;
    }
  });

  create = flow(function* (organization) {
    try {
      const response = yield useApiFetch().post('/realms', organization);
      return { status: 200, data: response.data };
    } catch (error) {
      return { status: error.response.status };
    }
  });
}
