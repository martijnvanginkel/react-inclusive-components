import { useEffect, useRef } from 'react';

/**
 * Calls `handler` when a pointerdown/focusin occurs outside the referenced element.
 * Pass `enabled: false` to detach the listeners (e.g. while a popup is closed).
 */
export function useOnClickOutside<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  handler: (event: Event) => void,
  enabled = true,
) {
  const handlerRef = useRef(handler);
  useEffect(() => {
    handlerRef.current = handler;
  });

  useEffect(() => {
    if (!enabled) return;
    const listener = (event: Event) => {
      const el = ref.current;
      if (!el || el.contains(event.target as Node)) return;
      handlerRef.current(event);
    };
    document.addEventListener('pointerdown', listener, true);
    document.addEventListener('focusin', listener, true);
    return () => {
      document.removeEventListener('pointerdown', listener, true);
      document.removeEventListener('focusin', listener, true);
    };
  }, [ref, enabled]);
}
