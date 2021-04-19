import { observer } from 'mobx-react-lite';

import { withAuthentication } from '../../components/Authentication';
import Page from '../../components/Page';
import { withTranslation } from '../../utils/i18n';

const Dashboard = withTranslation()(observer(({ t }) => {
  console.log('Dashboard functional component');

  return (
    <Page>
      <div>Dashboard</div>
    </Page>
  );
}));

export default withAuthentication(Dashboard);
