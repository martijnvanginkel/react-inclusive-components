/**
 * Builds a typed `slot()` helper that returns styling-only props for a named part:
 *   - a stable `data-ic-part` hook (what consumers target in CSS),
 *   - an optional `data-ic-state` (e.g. "selected", "open") for state-based styling
 *     WITHOUT reaching into ARIA,
 *   - the library's CSS-Module class for that part.
 *
 * Part names are public/stable and decoupled from the (hashed) internal class names.
 * Consumers restyle two ways, neither of which can reach ARIA/behavior:
 *   - CSS:    [data-ic-part="tab"][data-ic-state="selected"] { … }
 *   - tokens: override --ic-* custom properties
 */
export function makeSlots<P extends string>() {
  return (name: P, styleClass?: string, state?: string | false | null) => ({
    'data-ic-part': name,
    ...(state ? { 'data-ic-state': state } : {}),
    className: styleClass,
  });
}
