import { observable, action, flow } from 'mobx';
import { useApiFetch } from '../utils/fetch';

export default class Tenant {
  @observable selected = {};
  @action setSelected = tenant => this.selected = tenant;

  @observable items = [];

  fetch = flow(function* () {
    try {

      const response = yield useApiFetch().get('/tenants');

      this.items = response.data.rents;
      if (this.selected._id) {
        this.selected = this.items.find(item => item._id === this.selected._id) || {};
      }
      return 200;
    } catch (error) {
      return error.response.status;
    }
  });
}
