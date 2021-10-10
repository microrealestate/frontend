import { Typography, withStyles } from '@material-ui/core';

import { StoreContext } from '../store';
import { useContext } from 'react';

export const formatNumber = (locale, currency, value) => {
  return Intl.NumberFormat(locale || 'en', {
    style: 'currency',
    currency: currency || 'EUR',
    minimumFractionDigits: 2,
  }).format(value);
};

export const useFormatNumber = () => {
  const store = useContext(StoreContext);

  return (value, style = 'currency') => {
    if (style === 'currency') {
      return formatNumber(
        store.organization.selected.locale,
        store.organization.selected.currency,
        value
      );
    }

    if (style === 'percent') {
      return Number(value).toLocaleString(store.organization.selected.locale, {
        style: 'percent',
        minimumFractionDigits: 2,
      });
    }
  };
};

export const NumberFormat = ({
  value,
  style = 'currency',
  withColor,
  ...props
}) => {
  const formatNumber = useFormatNumber();

  const StyledTypography = withStyles((theme) => {
    const classes = {};
    if (withColor && value !== 0) {
      classes.root = {
        color:
          value > 0 ? theme.palette.success.dark : theme.palette.warning.dark,
      };
    }
    return classes;
  })(Typography);

  return (
    <StyledTypography noWrap {...props}>
      {value !== undefined && value != null ? formatNumber(value, style) : '--'}
    </StyledTypography>
  );
};
