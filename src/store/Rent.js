import moment from 'moment';
import { observable, action, flow, computed } from 'mobx';
import { useApiFetch } from '../utils/fetch';

export default class Rent {
  @observable selected = {};
  @action setSelected = rent => this.selected = rent;

  @observable filters = { searchText: '', status: '' };
  @action setFilters = ({ searchText = '', status = '' }) => this.filters = { searchText, status };

  _period = moment();
  @action setPeriod = period => {
    if (period.isSame(this._period, 'month')) {
      console.log('same period')
      this._useCache = true;
    } else {
      console.log('not same period')
      this._useCache = false;
      this._period = period;
    }
  }
  @computed get period() {
    return this._period.format('YYYY.MM');
  }

  _useCache = false;
  @observable items = [];
  @observable countAll;
  @observable countPaid;
  @observable countPartiallyPaid;
  @observable countNotPaid;
  @observable totalToPay;
  @observable totalPaid;
  @observable totalNotPaid;

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

  fetch = flow(function* () {
    // if (this._useCache) {
    //   console.log('use cached rents')
    //   return;
    // }

    const year = this._period.year();
    const month = this._period.month() + 1;

    const [overviewResponse, rentsResponse] = yield Promise.all([
      useApiFetch().get(`/rents/overview/${year}/${month}`),
      useApiFetch().get(`/rents/${year}/${month}`)
    ]);

    this.countAll = overviewResponse.data.countAll;
    this.countPaid = overviewResponse.data.countPaid;
    this.countPartiallyPaid = overviewResponse.data.countPartiallyPaid;
    this.countNotPaid = overviewResponse.data.countNotPaid;
    this.totalToPay = overviewResponse.data.totalToPay;
    this.totalPaid = overviewResponse.data.totalPaid;
    this.totalNotPaid = overviewResponse.data.totalNotPaid;

    this.items = rentsResponse.data;

    this._useCache = true;
  })
}
