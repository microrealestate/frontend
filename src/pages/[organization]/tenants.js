import { useObserver } from 'mobx-react-lite'
import Page from '../../components/Page'

import { withAuthentication } from '../../components/Authentication'

const Tenants = () => {

  return useObserver(() => (
    <Page>
      <div>Tenants</div>
    </Page>
  ))
}

export default withAuthentication(Tenants);
