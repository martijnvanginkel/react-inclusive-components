import { useCallback, useEffect, useRef, useState } from 'react';

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
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });

  const value = isControlled ? (controlled as T) : internal;

  const setValue = useCallback(
    (next: T) => {
      if (!isControlled) setInternal(next);
      onChangeRef.current?.(next);
    },
    [isControlled],
  );

  return [value, setValue];
}
