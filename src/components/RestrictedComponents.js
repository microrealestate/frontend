import { useContext, useMemo } from 'react';
import useTranslation from 'next-translate/useTranslation';
import { Button, IconButton, Tooltip } from '@material-ui/core';
import { StoreContext } from '../store';

export function RestrictedComponent(Component) {
  return function RestrictedComponent({
    onlyRoles,
    disabled,
    children,
    ...props
  }) {
    const { t } = useTranslation('common');
    const store = useContext(StoreContext);
    const isDisabled = useMemo(
      () =>
        onlyRoles && store.user.role
          ? !onlyRoles.includes(store.user.role)
          : false,
      [onlyRoles, store.user.role]
    );

    return isDisabled ? (
      <Tooltip
        title={t('Modification is not allowed with your current role')}
        aria-label="restricted action"
      >
        <span>
          <Component {...props} disabled={true}>
            {children}
          </Component>
        </span>
      </Tooltip>
    ) : (
      <Component {...props} disabled={disabled}>
        {children}
      </Component>
    );
  };
}

export const RestrictButton = RestrictedComponent(Button);

export const RestrictIconButton = RestrictedComponent(IconButton);
