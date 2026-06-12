# a11y-components

A learning-oriented React component library of accessible UI primitives, adapting the patterns
from [Inclusive Components](https://inclusive-components.design/). React 19 + TypeScript
(strict) + CSS Modules, built with Vite. No Storybook — a plain custom showcase instead.

## Authoritative documents (read before changing components)

- **`REQUIREMENTS.md`** — the binding rule book. Every component has testable rules with stable
  IDs (e.g. `TAB-8`, `MB-15`); tests cite them. §1 cross-cutting rules (incl. the styling
  contract CC-12…14; CC-15 is retired), §2–12 per component, §13 verification, §14 documented
  deviations from the source articles (don't "fix" those — they're intentional and explained there).
- **`STYLING.md`** — the locked-vs-open styling contract: components take NO styling props
  (no `className`/`classNames`/`style`); consumers restyle from their own CSS via tokens and
  `data-ic-part`/`data-ic-state` selectors; roles/ARIA/keyboard/focus are locked and must
  stay un-overridable.

## Commands

- `npm run dev` — showcase at localhost (homepage lists all components; hash routes like `#/tabs`)
- `npm test` / `npm run test:watch` — Vitest + Testing Library (jsdom)
- `npm run build` — `tsc -b` (strict) + vite build
- `npm run lint` — ESLint (react-hooks rules are strict: no ref writes during render, no
  sync setState in effects, single-component-per-file for fast refresh)

## Layout

- `src/lib/` — the library. One folder per component (`Component.tsx`, `Component.module.css`,
  `Component.test.tsx`, `index.ts`); `shared/` has `mergeProps`/`composeRefs` (props.ts),
  `makeSlots` (slots.ts), `useControllableState`, `useEscapeKey`, `useOnClickOutside`, `cx`.
  `src/lib/index.ts` is the public barrel. Never import from `src/showcase/`.
- `src/showcase/` — demo app: tiny hash router (`useHashRoute`), `registry.ts` (one entry per
  component), `sections/*Demo.tsx` (one plain default demo per component — keep demos minimal).

## Conventions that must hold for new/changed components

1. Derive rules from the source article first; add them to REQUIREMENTS.md with IDs, then
   implement, then write tests keyed to those IDs (one describe per component).
2. Controlled + uncontrolled state via `useControllableState`; ids via `useId`; real `<button>`s;
   visible focus styles; `prefers-reduced-motion` respected.
3. CSS hooks on every element: `data-ic-part` (+ `data-ic-state` when stateful) via
   `makeSlots`. No styling props — components accept no `className`/`classNames`/`style`;
   where native props are forwarded (e.g. ToggleButton), reserved a11y props AND
   `className`/`style` are `Omit`-ed from the prop type and handlers chain via `mergeProps`.
   All CSS wrapped in `@layer ic.base`, values from `tokens.css` (monochrome — keep it plain).
4. Verify with `npm test` + `npm run build` + `npm run lint` before declaring done.

## User preferences

- Minimal dependencies — prefer small hand-rolled solutions; ask before adding any dep; remove
  temporary tooling (e.g. Playwright was installed once for a manual browser test, then removed).
- Plain, simple visual style — no bright colors or fancy effects, in the spirit of
  inclusive-components.design.
