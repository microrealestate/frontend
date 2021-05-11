import { useContext, useMemo } from 'react';
import { Button, IconButton, Tooltip } from '@material-ui/core';
import { StoreContext } from '../store';
import { withTranslation } from '../utils/i18n';

export const RestrictedComponent = (Component) =>
  withTranslation()(
    ({ t, i18n, tReady, onlyRoles, disabled, children, ...props }) => {
      const store = useContext(StoreContext);
      const isDisabled = useMemo(
        () => onlyRoles && !onlyRoles.includes(store.user.role),
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
    }
  );

export const RestrictButton = RestrictedComponent(Button);

export const RestrictIconButton = RestrictedComponent(IconButton);
