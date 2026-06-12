import { useEffect, useRef } from 'react';

/**
 * Returns a ref that always holds the latest `value`. Read `.current` inside long-lived
 * listeners or memoized callbacks instead of closing over the value (which would go
 * stale). The ref is assigned in an effect — never during render.
 */
export function useLatestRef<T>(value: T) {
  const ref = useRef(value);
  useEffect(() => {
    ref.current = value;
  });
  return ref;
}
