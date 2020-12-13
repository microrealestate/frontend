import _ from 'lodash';
import { useContext } from 'react';
import LocationCityIcon from '@material-ui/icons/LocationCity';
import { StoreContext } from '../store';
import ToggleMenu from './ToggleMenu';

const OrganizationSwitcher = () => {
    const store = useContext(StoreContext);

    const onChange = org => {
        store.organization.setSelected(store.organization.items.find(({ _id }) => _id === org.id));
        window.location.assign(`/app/${store.organization.selected.name}/dashboard`);
    }

    const options = store.organization.items.map(({ _id, name }) => ({
        id: _id,
        label: name
    }));

    const value = options.find(({ id }) => id === store.organization.selected._id);

    return (
        <ToggleMenu
            startIcon={<LocationCityIcon />}
            options={options}
            value={value}
            onChange={onChange}
        />
    );
}

export default OrganizationSwitcher;