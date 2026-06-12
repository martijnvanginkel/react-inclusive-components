import { useCallback, useEffect, useRef, useState } from 'react';
import { useLatestRef } from './useLatestRef';

/**
 * Supports both controlled and uncontrolled usage of a single piece of state.
 *
 * - Controlled: pass `controlled` (a defined value). The hook echoes it back and
 *   calls `onChange` on updates; it never stores its own copy.
 * - Uncontrolled: leave `controlled` undefined and pass `defaultValue`. The hook
 *   owns the state internally and still calls `onChange`.
 */
export function useControllableState<T>(options: {
  controlled: T | undefined;
  defaultValue: T;
  onChange?: (value: T) => void;
}): [T, (next: T) => void] {
  const { controlled, defaultValue, onChange } = options;
  const isControlled = controlled !== undefined;

  const [internal, setInternal] = useState<T>(defaultValue);
  const onChangeRef = useLatestRef(onChange);

  // While controlled, the internal copy stays frozen at its initial value — so flipping
  // to uncontrolled silently snaps back to stale state. Surface that in dev instead of
  // failing silently (the standard library behavior: warn, don't sync).
  const wasControlled = useRef(isControlled);
  useEffect(() => {
    if (import.meta.env.DEV && wasControlled.current !== isControlled) {
      console.warn(
        `useControllableState: a component switched from ${
          wasControlled.current ? 'controlled to uncontrolled' : 'uncontrolled to controlled'
        }. Decide between controlled (always pass a defined value) and uncontrolled ` +
          'for the lifetime of the component — switching desyncs the displayed state.',
      );
    }
    wasControlled.current = isControlled;
  }, [isControlled]);

  const value = isControlled ? (controlled as T) : internal;

  const setValue = useCallback(
    (next: T) => {
      if (!isControlled) setInternal(next);
      onChangeRef.current?.(next);
    },
    [isControlled, onChangeRef],
  );

  return [value, setValue];
}
