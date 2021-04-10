import _ from 'lodash';
import { useCallback, useContext, useMemo } from 'react';
import getConfig from 'next/config';
import LocationCityIcon from '@material-ui/icons/LocationCity';
import { StoreContext } from '../store';
import ToggleMenu from './ToggleMenu';

const { publicRuntimeConfig: { BASE_PATH } } = getConfig();

const OrganizationSwitcher = () => {
    const store = useContext(StoreContext);

    const onChange = useCallback(({ id }) => {
        const organization = store.organization.items.find(({ _id }) => _id === id);
        window.location.assign(`${BASE_PATH}/${organization.name}/dashboard`);
    }, []);

    const options = useMemo(() => store.organization.items.map(({ _id, name }) => ({
        id: _id,
        label: name
    })), [store.organization.items]);

    const value = useMemo(() => options.find(({ id }) => id === store.organization.selected._id), [options]);

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