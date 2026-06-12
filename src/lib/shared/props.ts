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

/**
 * Attributes a consumer must never be able to set where native props are forwarded
 * (CC-12): semantics/visibility (`type`, `role`, `tabIndex`, `aria-hidden`), the state
 * attributes the components manage, and the styling props the library doesn't accept.
 * Labelling attributes (`aria-label`, `aria-labelledby`, `aria-describedby`) stay open —
 * naming a control is the consumer's job.
 */
const RESERVED_ATTRS = [
  'type',
  'role',
  'tabIndex',
  'aria-hidden',
  'aria-pressed',
  'aria-checked',
  'className',
  'style',
] as const;

/**
 * Strips {@link RESERVED_ATTRS} from forwarded consumer props. The prop types already
 * `Omit` these; this runtime strip backs the types up so a forced cast can't reintroduce
 * them (CC-12: "reserved a11y attributes must win at runtime if forced").
 */
export function stripReserved(props: AnyProps): AnyProps {
  const safe = { ...props };
  for (const key of RESERVED_ATTRS) delete safe[key];
  return safe;
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
