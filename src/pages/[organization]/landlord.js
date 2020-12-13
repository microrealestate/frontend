import { useObserver } from 'mobx-react-lite'
import Page from '../../components/Page'

import { withAuthentication } from '../../components/Authentication'

const Landlord = () => {

  return useObserver(() => (
    <Page>
      <div>Landlord</div>
    </Page>
  ))
}

export default withAuthentication(Landlord);

