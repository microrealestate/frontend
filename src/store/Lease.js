import { observable, flow, makeObservable } from 'mobx';
import { useApiFetch } from '../utils/fetch';

export default class Lease {
  items = [];

  constructor() {
    makeObservable(this, {
      items: observable,
      fetch: flow,
      fetchOne: flow,
      create: flow,
      update: flow,
      delete: flow,
    });
  }

  *fetch() {
    try {
      const response = yield useApiFetch().get('/leases');

      this.items = response.data;
      return { status: 200, data: response.data };
    } catch (error) {
      return { status: error.response.status };
    }
  }

  *fetchOne(leaseId) {
    try {
      const response = yield useApiFetch().get(`/leases/${leaseId}`);

      return { status: 200, data: response.data };
    } catch (error) {
      return { status: error.response.status };
    }
  }

  *create(lease) {
    try {
      const response = yield useApiFetch().post('/leases', lease);
      const createdLease = response.data;
      this.items.push(createdLease);

      return { status: 200, data: createdLease };
    } catch (error) {
      return { status: error.response.status };
    }
  }

  *update(lease) {
    try {
      const response = yield useApiFetch().patch(`/leases/${lease._id}`, lease);
      const updatedLease = response.data;
      const index = this.items.findIndex((item) => item._id === lease._id);
      if (index > -1) {
        this.items.splice(index, 1, updatedLease);
      }
      return { status: 200, data: updatedLease };
    } catch (error) {
      return { status: error.response.status };
    }
  }

  *delete(ids) {
    try {
      yield useApiFetch().delete(`/leases/${ids.join(',')}`);
      this.items = this.items.filter((lease) => !ids.includes(lease._id));
      return { status: 200 };
    } catch (error) {
      return { status: error.response.status };
    }
  }
}
