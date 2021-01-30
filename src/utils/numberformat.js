// import { I18nContext } from 'next-i18next';
import { Typography } from "@material-ui/core";
import { useContext } from 'react';
import { StoreContext } from '../store';

export const numberFormat = (locale, currency, value) => {
    return Intl.NumberFormat(locale || 'en', {
        style: 'currency',
        currency: currency || 'EUR',
        minimumFractionDigits: 2
    }).format(value);
};

export const useNumberFormat = value => {
    const store = useContext(StoreContext);

    return numberFormat(
        store.organization.selected.locale,
        store.organization.selected.currency,
        value
    );
};

export const NumberFormat = (({ value, ...props }) => {
    return (
        <Typography noWrap {...props}>{useNumberFormat(value)}</Typography>
    );
});