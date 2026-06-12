import { useEffect } from 'react';
import { useLatestRef } from './useLatestRef';

/**
 * Calls `handler` when the Escape key is pressed. Detaches when `enabled` is false.
 *
 * Skips events another widget already claimed (`defaultPrevented`) and claims the ones
 * it consumes, so one Escape press dismisses at most one open widget (CC-16). Widgets
 * with their own element-scoped Escape handling must likewise call `preventDefault()`.
 */
export function useEscapeKey(handler: (event: KeyboardEvent) => void, enabled = true) {
  const handlerRef = useLatestRef(handler);

  useEffect(() => {
    if (!enabled) return;
    const listener = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || event.defaultPrevented) return;
      event.preventDefault();
      handlerRef.current(event);
    };
    document.addEventListener('keydown', listener);
    return () => document.removeEventListener('keydown', listener);
  }, [enabled, handlerRef]);
}
