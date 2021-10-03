import { observer } from 'mobx-react-lite';
import Page from '../../components/Page';
import { withAuthentication } from '../../components/Authentication';

const Dashboard = observer(() => {
  console.log('Dashboard functional component');

  return (
    <Page>
      <div>Dashboard</div>
    </Page>
  );
});

export default withAuthentication(Dashboard);
