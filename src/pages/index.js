import { useRouter } from "next/router";
import { withAuthentication } from "../components/Authentication";
import { isServer, redirect } from "../utils";


const Index = () => {

};

Index.getInitialProps = async (context) => {
    console.log('Index.getInitialProps')
    const store = isServer() ? context.store : getStoreInstance();
    const organizationName = store.organization.selected.name || store.organization.items[0].name;
    const dashboardPath = `/${organizationName}/dashboard`;

    if (isServer()) {
        redirect(context, dashboardPath);
    } else {
        const router = useRouter();
        router.push(dashboardPath);
    }

    const props = {
      initialState: {
        store: JSON.parse(JSON.stringify(store))
      }
    };
    return props;
  };

  export default withAuthentication(Index);
