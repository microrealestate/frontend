// import { I18nContext } from 'next-i18next';
import { Typography } from "@material-ui/core";
import { useContext } from 'react';
import { StoreContext } from '../store';


export const numberFormat = value => {
    const store = useContext(StoreContext);

    return Intl.NumberFormat(store.organization.selected.locale || 'en', {
        style: 'currency',
        currency: store.organization.selected.currency || 'EUR',
        minimumFractionDigits: 2
    }).format(value);
};

export const NumberFormat = (({ value, ...props }) => {
    return (
        <Typography noWrap {...props}>{numberFormat(value)}</Typography>
    );
});