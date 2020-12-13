import { observable, action } from 'mobx';

export default class Selection {

    @observable organization = {}
    @action setOrganization = organization => this.organization = organization
}
