import {createContext, useContext, useEffect, useState} from 'react';

/**
 * The "Model" switch of the collection page: off, cards show the product
 * photo; on, the second Shopify image (usually the piece worn). Remembered
 * in the browser between pages.
 */
const STORAGE_KEY = 'hs-model-view';

const ModelViewContext = createContext<{
  on: boolean;
  toggle: () => void;
}>({on: false, toggle: () => {}});

export function ModelViewProvider({children}: {children: React.ReactNode}) {
  const [on, setOn] = useState(false);

  useEffect(() => {
    try {
      setOn(window.localStorage.getItem(STORAGE_KEY) === '1');
    } catch {
      // Storage blocked: the switch simply starts off.
    }
  }, []);

  const toggle = () =>
    setOn((current) => {
      try {
        window.localStorage.setItem(STORAGE_KEY, current ? '0' : '1');
      } catch {
        // Not remembered, still switched for this page.
      }
      return !current;
    });

  return (
    <ModelViewContext.Provider value={{on, toggle}}>
      {children}
    </ModelViewContext.Provider>
  );
}

export function useModelView() {
  return useContext(ModelViewContext);
}
