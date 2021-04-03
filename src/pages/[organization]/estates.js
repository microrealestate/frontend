import { observer } from 'mobx-react-lite'

import { withTranslation } from '../../utils/i18n';
import Page from '../../components/Page';
import { withAuthentication } from '../../components/Authentication'

const Estates = withTranslation()(observer(({ t }) => {

  return (
    <Page>
      <div>Estates</div>
    </Page>
  );
}));

export default withAuthentication(Estates);

