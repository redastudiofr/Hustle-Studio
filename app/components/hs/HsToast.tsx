import {useEffect, useState} from 'react';

/**
 * Small toasts in the bottom-right corner ("[product] — added to cart") and
 * the "a product was just added" signal the header's cart count listens to.
 * Both travel as window events, so any component can raise them without a
 * provider. Styles: hs-product-card.css (`hs-toast`).
 */

const TOAST_EVENT = 'hs:toast';
const CART_ADDED_EVENT = 'hs:cart-added';

/** Time a toast stays before it starts leaving, and its exit, in ms. */
const TOAST_VISIBLE_MS = 2200;
const TOAST_EXIT_MS = 400;

type Toast = {id: number; message: string; leaving: boolean};

export function showHsToast(message: string) {
  window.dispatchEvent(new CustomEvent(TOAST_EVENT, {detail: message}));
}

/** Raised after a successful add to cart (the header count bumps on it). */
export function notifyCartAdded() {
  window.dispatchEvent(new Event(CART_ADDED_EVENT));
}

/** Calls `onAdded` after every successful add to cart. */
export function useCartAdded(onAdded: () => void) {
  useEffect(() => {
    window.addEventListener(CART_ADDED_EVENT, onAdded);
    return () => window.removeEventListener(CART_ADDED_EVENT, onAdded);
  }, [onAdded]);
}

let nextId = 1;

export function HsToastViewport() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const timers = new Set<number>();
    const later = (fn: () => void, ms: number) => {
      const timer = window.setTimeout(() => {
        timers.delete(timer);
        fn();
      }, ms);
      timers.add(timer);
    };

    const onToast = (event: Event) => {
      const message = String((event as CustomEvent<string>).detail ?? '');
      if (!message) return;
      const id = nextId++;
      setToasts((list) => [...list, {id, message, leaving: false}]);
      later(() => {
        setToasts((list) =>
          list.map((toast) =>
            toast.id === id ? {...toast, leaving: true} : toast,
          ),
        );
        later(
          () => setToasts((list) => list.filter((toast) => toast.id !== id)),
          TOAST_EXIT_MS,
        );
      }, TOAST_VISIBLE_MS);
    };

    window.addEventListener(TOAST_EVENT, onToast);
    return () => {
      window.removeEventListener(TOAST_EVENT, onToast);
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  return (
    <div className="hs-toasts" role="status" aria-live="polite">
      {toasts.map((toast) => (
        <p
          key={toast.id}
          className={`hs-toast${toast.leaving ? ' hs-toast--leaving' : ''}`}
        >
          <span className="hs-toast__dot" aria-hidden="true" />
          {toast.message}
        </p>
      ))}
    </div>
  );
}
