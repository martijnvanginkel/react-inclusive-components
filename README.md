# a11y-components

A learning-oriented React component library of accessible UI primitives, faithfully adapting
the patterns from [Inclusive Components](https://inclusive-components.design/) into idiomatic
React + TypeScript + CSS Modules.

React 19 · TypeScript (strict) · CSS Modules · Vite · Vitest. No Storybook — a plain custom
showcase app instead.

## Goals

- **Accessible by default**: ARIA, keyboard, and screen-reader behavior matches the
  Inclusive Components patterns; every component is keyboard-operable end to end.
- **First-class TypeScript**: fully typed props with TSDoc comments — editor IntelliSense is
  the component-level API documentation.
- **Zero-runtime styling** via CSS Modules; consumers restyle from their own CSS through
  design tokens and `data-ic-part`/`data-ic-state` hooks, never through the a11y layer.

## Non-goals

- Not a production design system — this is a learning/prototype project.
- No no-JS / progressive-enhancement fallback (it's a React SPA; semantics and ARIA stay
  faithful, JS is assumed).
- No theming engine, no published npm package, no SSR target.

## Components

All exported from `src/lib` (the library; the showcase imports it only through the barrel):

| Component | Pattern |
|---|---|
| `ToggleButton` | Two-state control: `aria-pressed` button or `role="switch"` |
| `Collapsible` | Heading-wrapped trigger button showing/hiding a content region |
| `Tabs` | Tabbed panels with roving tabindex and arrow-key selection |
| `Tooltip` | Hover + focus label/description for a control, `role="tooltip"` |
| `Toggletip` | Click-revealed info announced via a `role="status"` live region |
| `MenuButton` | True menu button (`role="menu"`, action or radio items) |
| `Card` / `CardGrid` | Clickable card via stretched link; secondary links stay usable |
| `TodoList` | List with live-region announcements and managed focus on delete |
| `ContentSlider` | Manual scroll-snap gallery, lazy images, no auto-rotation |
| `DataTable` | Semantic table: scoped headers, caption, sorting, overflow handling |
| `NotificationProvider` / `useNotify` | Polite live-region notification system |

## Documentation

- **`REQUIREMENTS.md`** — the binding rule book. Every component has testable rules with
  stable IDs (e.g. `TAB-8`); tests cite them. Includes the cross-cutting rules, the manual
  browser checklist, and documented deviations from the source articles.
- **`STYLING.md`** — the locked-vs-open styling contract: tokens and `data-ic-*` CSS hooks
  are open; roles, ARIA, keyboard, and focus behavior are locked.
- Component APIs — the TSDoc on the exported props types (visible in editor IntelliSense).

## Commands

```sh
npm run dev    # showcase at localhost (homepage lists all components, hash routes like #/tabs)
npm test       # Vitest + Testing Library (jsdom) + static CSS contract checks
npm run build  # tsc -b (strict) + vite build
npm run lint   # ESLint
```

## Verification

Three layers: jsdom unit tests keyed to the REQUIREMENTS rule IDs, a static CSS contract
test (cascade layer, reduced-motion guards, focus-style presence, decorative SVG attributes),
and a manual keyboard + screen-reader checklist in `REQUIREMENTS.md` §13 for the rules only a
real browser can show.
