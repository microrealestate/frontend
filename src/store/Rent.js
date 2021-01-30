import moment from 'moment';
import { observable, action, flow, computed } from 'mobx';
import { useApiFetch } from '../utils/fetch';
export default class Rent {
  @observable selected = {};
  @action setSelected = rent => this.selected = rent;

  @observable filters = { searchText: '', status: '' };

  _period = moment();

  @observable items = [];
  @observable countAll;
  @observable countPaid;
  @observable countPartiallyPaid;
  @observable countNotPaid;
  @observable totalToPay;
  @observable totalPaid;
  @observable totalNotPaid;

  @computed get period() {
    return this._period.format('YYYY.MM');
  }

  @computed get filteredItems() {
    let filteredItems = this.filters.status === '' ? this.items : this.items.filter(({ status }) => {
      if (status === this.filters.status) {
        return true;
      }

      return false;
    });

    if (this.filters.searchText) {
      const regExp = /\s|\.|-/ig;
      const cleanedSearchText = this.filters.searchText.toLowerCase().replace(regExp, '')

      filteredItems = filteredItems.filter(({ occupant: { isCompany, name, manager, contacts } }) => {
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
        return found;
      });
    }
    return filteredItems;
  }

  @action setFilters = ({ searchText = '', status = '' }) => this.filters = { searchText, status };

  @action setPeriod = period => this._period = period;

  fetch = flow(function* () {
    try {
      const year = this._period.year();
      const month = this._period.month() + 1;

      const response = yield useApiFetch().get(`/rents/${year}/${month}`);

      this.countAll = response.data.overview.countAll;
      this.countPaid = response.data.overview.countPaid;
      this.countPartiallyPaid = response.data.overview.countPartiallyPaid;
      this.countNotPaid = response.data.overview.countNotPaid;
      this.totalToPay = response.data.overview.totalToPay;
      this.totalPaid = response.data.overview.totalPaid;
      this.totalNotPaid = response.data.overview.totalNotPaid;

      this.items = response.data.rents;
      if (this.selected._id) {
        this.selected = this.items.find(item => item._id === this.selected._id) || {};
      }
      return 200;
    } catch (error) {
      return error.response.status;
    }
  });

  pay = flow(function* (payment) {
    try {
      yield useApiFetch().patch(`/rents/payment/${payment._id}`, payment);
      return 200;
    } catch (error) {
      return error.response.status;
    }
  });

  // payload
  // {
  //   document,
  //   tenantIds,
  //   year,
  //   month
  // }
  sendEmail = flow(function* (payload) {
    try {
      yield useApiFetch().post('/emails', payload);
      return 200;
    } catch (error) {
      return error.response.status;
    }
  });
}
