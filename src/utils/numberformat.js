import { Typography, withStyles } from "@material-ui/core";
import { useContext } from 'react';
import { StoreContext } from '../store';

export const formatNumber = (locale, currency, value) => {
  return Intl.NumberFormat(locale || 'en', {
    style: 'currency',
    currency: currency || 'EUR',
    minimumFractionDigits: 2
  }).format(value);
};

export const useFormatNumber = () => {
  const store = useContext(StoreContext);

  return value => (formatNumber(
    store.organization.selected.locale,
    store.organization.selected.currency,
    value
  ));
};

export const NumberFormat = (({ value, withColor, ...props }) => {
  const formatNumber = useFormatNumber();

  const StyledTypography = withStyles(theme => {
    const classes = {};
    if (withColor && value !== 0) {
      classes.root = {
        color: value > 0 ? theme.palette.success.dark : theme.palette.warning.dark
      };
    }
    return classes;
  })(Typography);

  return (
    <StyledTypography
      noWrap
      {...props}
    >
      {formatNumber(value)}
    </StyledTypography>
  );
});