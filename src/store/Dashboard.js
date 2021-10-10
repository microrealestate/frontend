import { computed, flow, makeObservable, observable } from 'mobx';

import moment from 'moment';
import { useApiFetch } from '../utils/fetch';

export default class Dashboard {
  data = {};

  constructor() {
    makeObservable(this, {
      data: observable,
      fetch: flow,
      currentRevenues: computed,
    });
  }

  get currentRevenues() {
    const currentMonth = moment().format('MMYYYY');
    const revenues = this.data.revenues.find(
      ({ month }) => currentMonth === month
    ) || {
      month: currentMonth,
      paid: 0,
      notPaid: 0,
    };

    revenues.notPaid = Math.abs(revenues.notPaid);
    return revenues;
  }

  *fetch() {
    try {
      const response = yield useApiFetch().get('/dashboard');
      this.data = response.data;

      return { status: 200, data: response.data };
    } catch (error) {
      return { status: error.response.status };
    }
  }
}
