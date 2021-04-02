
import { toJS } from 'mobx';
import { useStaticRendering } from 'mobx-react-lite'
import { createContext, useEffect, useState } from 'react'
import { isServer } from '../utils';
import Store from './Store';

useStaticRendering(isServer());

let _store;

function getStoreInstance(initialData) {
  if (isServer()) {
    return new Store();
  }

  if (!_store) {
    console.log('create store')
    _store = new Store();
    _store.hydrate(initialData);
    if (process.env.NODE_ENV === 'development') {
      window.__store = _store;
    }
  }

  return _store;
}


const StoreContext = createContext()

function InjectStoreContext({ children, initialData }) {
  const [store, setStore] = useState();

  useEffect(() => {
    setStore(getStoreInstance(initialData));
    if (!isServer() && process.env.NODE_ENV === 'development') {
      window.__store = store;
    }
  }, []);

  return store ? <StoreContext.Provider value={store}>{children}</StoreContext.Provider> : null;
}

export { InjectStoreContext, StoreContext, getStoreInstance }
