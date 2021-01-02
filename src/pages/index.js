import { useRouter } from "next/router";
import { useEffect } from "react";
import { withAuthentication } from "../components/Authentication";
import { getStoreInstance } from "../store";
import { isServer, redirect } from "../utils";


const Index = (props) => {
    const { redirectPath } = props;
    const router = useRouter();

    useEffect(() => {
      router.push(redirectPath);
    }, []);

    return null;
};

Index.getInitialProps = async (context) => {
    console.log('Index.getInitialProps')
    const store = isServer() ? context.store : getStoreInstance();

    let redirectPath = '/firstaccess';
    if (store.organization.items.length) {
      if (!store.organization.selected) {
        store.organization.setSelected(store.organization.items[0]);
      }
      redirectPath = `/${store.organization.selected.name}/dashboard`;
    }

    if (isServer()) {
        redirect(context, redirectPath);
    }

    const props = {
      redirectPath,
      initialState: {
        store: JSON.parse(JSON.stringify(store))
      }
    };
    return props;
  };

  export default withAuthentication(Index);
