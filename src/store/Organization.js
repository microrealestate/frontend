import { observable, action, flow } from 'mobx';
import { useApiFetch } from '../utils/fetch';

export default class Organization {
    @observable selected = {};
    @action setSelected = org => this.selected = org;

    @observable items = [];

    fetch = flow(function* () {
        const response = yield useApiFetch().get('/realms');
        this.items = response.data;
    })

}
