import { useObserver } from 'mobx-react-lite'
import Page from '../../components/Page';

import { withAuthentication } from '../../components/Authentication'

const Estates = () => {

  return useObserver(() => (
    <Page>
      <div>Estates</div>
    </Page>
  ))
}

export default withAuthentication(Estates);

