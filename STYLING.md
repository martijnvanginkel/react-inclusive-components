# Styling Guide

This library is **accessible by default and restyleable from CSS**. Components take no
styling props — you change how every component looks from your own stylesheets, without
touching — or being able to break — its accessibility.

## The contract: locked vs. open

| Locked (you cannot change) | Open (you control) |
|---|---|
| roles, `aria-*`, `tabindex` | colors, spacing, typography, borders, shadows |
| keyboard handlers & focus management | which CSS rules apply to each part |
| internal DOM structure / element semantics | per-instance and global theming |

The locked layer is what makes the components accessible, so it's protected: components
accept no `className`/`classNames`/`style` props, reserved attributes are stripped from the
TypeScript types of any forwarded native props, and a test suite asserts that the CSS hooks
exist and the ARIA/role/behavior stays intact.

## Why your styles always win: cascade layers

All library CSS ships inside a single cascade layer:

```css
@layer ic.base { /* component styles */ }
```

Any CSS you write **outside a layer beats layered CSS regardless of specificity or source
order** — so you never need `!important` or specificity hacks to override a default. Just write
normal CSS.

---

## Two ways to style (use any mix)

### 1. Design tokens (CSS custom properties) — for theming

Override `--ic-*` variables, globally or on one subtree:

```css
:root {                      /* whole app */
  --ic-accent: #2f4fff;
  --ic-radius: 12px;
}
.brand-dark {                /* one subtree */
  --ic-surface: #1a1a2e;
  --ic-text: #f5f5f5;
}
```

Full token list:

| Group | Tokens |
|---|---|
| Spacing | `--ic-space-1` … `--ic-space-6` |
| Radius | `--ic-radius`, `--ic-radius-sm` |
| Color | `--ic-bg`, `--ic-surface`, `--ic-text`, `--ic-text-muted`, `--ic-border`, `--ic-accent`, `--ic-accent-text`, `--ic-accent-weak`, `--ic-danger` |
| Focus | `--ic-focus-ring` |
| Type | `--ic-font`, `--ic-line` |
| Elevation | `--ic-shadow`, `--ic-shadow-lg` |

### 2. `data-ic-part` / `data-ic-state` selectors — for per-element CSS

Every element exposes a stable `data-ic-part`, and stateful elements expose `data-ic-state`.
Target them from your own CSS — you get state-based styling **without touching ARIA**:

```css
[data-ic-part="tab"] { font-weight: 500; }
[data-ic-part="tab"][data-ic-state="selected"] { color: rebeccapurple; }
[data-ic-part="menu"] { border-radius: 12px; }
```

To scope a rule to one instance, wrap that instance in your own element and nest the
selector: `.my-sidebar [data-ic-part="tab"] { … }`.

---

## Parts & states reference

| Component | Parts (`data-ic-part`) | States (`data-ic-state`) |
|---|---|---|
| `ToggleButton` | `root`, `label`, `track`, `thumb` | `root`: `on` / `off` |
| `Collapsible` | `root`, `heading`, `trigger`, `icon`, `content` | `root`, `trigger`: `open` / `closed` |
| `Tabs` | `root`, `list`, `tab`, `panel` | `tab`: `selected`; `panel`: `selected` / `hidden` |
| `Tooltip` | `root`, `tooltip` | `tooltip`: `open` / `closed` |
| `Toggletip` | `root`, `trigger`, `bubble` | `trigger`, `bubble`: `open` / `closed` |
| `MenuButton` | `root`, `trigger`, `caret`, `menu`, `item`, `check` | `trigger`: `open` / `closed`; `item`: `checked` / `disabled`; `check`: `checked` / `unchecked` |
| `Card` | `root`, `media`, `img`, `body`, `title`, `titleLink`, `description`, `cta`, `secondary`, `secondaryLink` | — |
| `CardGrid` | `grid` | — |
| `TodoList` | `root`, `heading`, `form`, `input`, `addButton`, `list`, `item`, `checkbox`, `itemLabel`, `deleteButton`, `emptyState`, `liveRegion` | `item`: `done` |
| `ContentSlider` | `root`, `scroller`, `list`, `slide`, `figure`, `image`, `caption`, `instructions`, `instruction`, `controls`, `controlButton` | `slide`: `loaded` |
| `DataTable` | `root`, `scroller`, `table`, `caption`, `hint`, `head`, `body`, `row`, `headerCell`, `sortButton`, `sortIcon`, `rowHeader`, `cell`, `stack`, `stackGroup`, `stackHeading`, `stackList`, `stackTerm`, `stackValue` | `headerCell`: `ascending` / `descending` |
| `NotificationProvider` | `region`, `list`, `item`, `prefix` | `item`: `info` / `success` / `warning` / `error` |

---

## What you can't do (on purpose)

- You can't pass `className`, `classNames`, or `style` — components don't accept them.
- You can't pass `role`, `type`, `tabIndex`, `aria-hidden`, or the state attributes the
  component manages (e.g. `aria-pressed`/`aria-checked`) where native props are forwarded
  (e.g. `ToggleButton`) — the TypeScript types omit them, and even a forced (cast) override
  is stripped at runtime. Labelling attributes (`aria-label`, `aria-labelledby`,
  `aria-describedby`) stay open: naming a control is your job (see TB-5/TB-6).
- You can't replace the keyboard/focus handlers — forwarded handlers are chained, not
  substituted.
- You can't restructure the internal DOM — only style the parts that exist.

If you need a fundamentally different structure, that's a different component — compose these or
build your own on the same patterns (see `REQUIREMENTS.md`).
