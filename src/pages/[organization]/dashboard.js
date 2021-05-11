import { observer } from 'mobx-react-lite';

import { withAuthentication } from '../../components/Authentication';
import Page from '../../components/Page';

const Dashboard = observer(() => {
  console.log('Dashboard functional component');

  return (
    <Page>
      <div>Dashboard</div>
    </Page>
  );
});

export default withAuthentication(Dashboard);
