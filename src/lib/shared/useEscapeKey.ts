import { useEffect, useRef } from 'react';

/** Calls `handler` when the Escape key is pressed. Detaches when `enabled` is false. */
export function useEscapeKey(handler: (event: KeyboardEvent) => void, enabled = true) {
  const handlerRef = useRef(handler);
  useEffect(() => {
    handlerRef.current = handler;
  });

  useEffect(() => {
    if (!enabled) return;
    const listener = (event: KeyboardEvent) => {
      if (event.key === 'Escape') handlerRef.current(event);
    };
    document.addEventListener('keydown', listener);
    return () => document.removeEventListener('keydown', listener);
  }, [enabled]);
}
