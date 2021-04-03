import { observer } from 'mobx-react-lite'

import { withTranslation } from '../../utils/i18n';
import Page from '../../components/Page'
import { withAuthentication } from '../../components/Authentication'

const Accounting = withTranslation()(observer(({ t }) => {
  return (
    <Page>
      <div>Accounting</div>
    </Page>
  );
}));

export default withAuthentication(Accounting);

