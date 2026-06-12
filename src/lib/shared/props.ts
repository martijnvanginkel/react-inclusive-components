import type { Ref } from 'react';
import { cx } from './cx';

type AnyProps = Record<string, unknown>;

interface HasDefaultPrevented {
  defaultPrevented?: boolean;
}

/**
 * Chains a consumer's event handler with the library's own. The consumer's runs first;
 * the library's runs next unless the consumer called `event.preventDefault()`. This lets
 * consumers observe (and opt out of) behavior without being able to silently replace the
 * handlers that make a component accessible.
 */
export function composeEventHandlers<E>(
  userHandler: ((event: E) => void) | undefined,
  libHandler: ((event: E) => void) | undefined,
  { checkForDefaultPrevented = true } = {},
) {
  return (event: E) => {
    userHandler?.(event);
    if (!checkForDefaultPrevented || !(event as HasDefaultPrevented).defaultPrevented) {
      libHandler?.(event);
    }
  };
}

/** Combines multiple refs (callback or object) into one ref callback. */
export function composeRefs<T>(...refs: Array<Ref<T> | undefined>) {
  return (node: T | null) => {
    for (const ref of refs) {
      if (!ref) continue;
      if (typeof ref === 'function') ref(node);
      else (ref as { current: T | null }).current = node;
    }
  };
}

/**
 * Merges consumer props onto the library's props for a single element, protecting the
 * accessibility-critical ones:
 * - `className` is appended (both apply), never replaced.
 * - `style` merges (library wins on conflicts — though the library sets no a11y-critical
 *   inline styles).
 * - Overlapping event handlers are chained via {@link composeEventHandlers}.
 * - Any other direct collision keeps the library's value (consumers can't override role,
 *   aria-*, tabindex, etc. — those are also stripped at the type level).
 */
export function mergeProps(lib: AnyProps, user: AnyProps | undefined): AnyProps {
  if (!user) return lib;
  // Library props win on direct collisions; the special cases below re-merge.
  const result: AnyProps = { ...user, ...lib };

  const className = cx(lib.className as string | undefined, user.className as string | undefined);
  if (className) result.className = className;

  if (lib.style || user.style) {
    result.style = { ...(user.style as object), ...(lib.style as object) };
  }

  for (const key of Object.keys(user)) {
    const isHandler = key.length > 2 && key.startsWith('on') && key[2] >= 'A' && key[2] <= 'Z';
    if (isHandler && typeof user[key] === 'function' && typeof lib[key] === 'function') {
      result[key] = composeEventHandlers(
        user[key] as (e: unknown) => void,
        lib[key] as (e: unknown) => void,
      );
    }
  }
  return result;
}
