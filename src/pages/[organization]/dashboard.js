import { useObserver } from 'mobx-react-lite';
import { withAuthentication } from '../../components/Authentication';
import { useContext } from 'react';
import { StoreContext } from '../../store';
import Page from '../../components/Page';

const Dashboard = (props) => {
  console.log('Dashboard functional component')
  const store = useContext(StoreContext);

  return useObserver(() => (
    <Page>
      <div>Dashboard</div>
    </Page>
  ))
}

export default withAuthentication(Dashboard);
