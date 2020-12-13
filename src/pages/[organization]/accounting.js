import { useObserver } from 'mobx-react-lite'
import Page from '../../components/Page'

import { withAuthentication } from '../../components/Authentication'

const Accounting = () => {
  return useObserver(() => (
    <Page>
      <div>Accounting</div>
    </Page>
  ))
}

export default withAuthentication(Accounting);

