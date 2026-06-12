# Component Requirements & Rules

A testable checklist of rules every component in this library must pass. Rules are
derived directly from the [Inclusive Components](https://inclusive-components.design/)
source articles, adapted to our React + TypeScript + CSS-Modules context (see `README.md`
for the project's goals and component inventory).

**How to read this file**
- Each rule has a stable ID (e.g. `TAB-7`) so it can be referenced from tests/reviews.
- Rules are imperative and pass/fail. A component is conformant only when **all** of its
  rules — plus every cross-cutting rule — pass.
- `MUST` = hard requirement. `MUST NOT` = anti-pattern that fails the check.
- Verify with: keyboard-only walkthrough, a screen reader (VoiceOver/NVDA) spot check,
  and an automated pass (`axe`). See **§13 Verification**.

> Adaptations: because this is a React SPA, the source articles' "works without JS"
> fallbacks are out of scope. We keep the **semantics, ARIA, keyboard, and focus**
> behavior faithful. Known intentional deviations are listed in **§14**.

---

## 1. Cross-cutting rules (apply to EVERY component)

- **CC-1** Every interactive control MUST be a native `<button>` (or native form control),
  never a `<div>`/`<span>` with a click handler.
- **CC-2** Buttons that are not form submits MUST set `type="button"`.
- **CC-3** Every focusable element MUST have a visible focus style (e.g. a `box-shadow`
  ring) that does not rely on the default UA outline being present, and that does NOT shift
  layout (the toggle-button article: "the best focus styles do not affect layout").
- **CC-4** State MUST be conveyed both visually AND via ARIA — never by color alone (WCAG 1.4.1).
- **CC-5** Boolean ARIA state attributes MUST use explicit `"true"`/`"false"` strings, never
  be omitted to imply false where a value is expected.
- **CC-6** The `title` attribute MUST NOT be used to convey labels or descriptions.
- **CC-7** Decorative icons/SVGs MUST have `aria-hidden="true"` and `focusable="false"`,
  and SHOULD use `fill: currentColor` so they survive high-contrast mode.
- **CC-8** All `id`s used to wire ARIA relationships MUST be unique per instance
  (generated, not hard-coded) so multiple instances on a page don't collide.
- **CC-9** Any motion/transition MUST be disabled under `prefers-reduced-motion: reduce`.
- **CC-10** Components MUST NOT trap focus unexpectedly; Tab/Shift+Tab must always be able
  to leave the component (except inside a modal, which we do not ship).
- **CC-11** Components MUST be operable by keyboard alone for every action available to a
  mouse user.

### Styling contract (consumers restyle via CSS only; a11y stays locked — see `STYLING.md`)

Components do NOT take styling props — no `className`, `classNames`, or `style`. Consumers
restyle exclusively from their own CSS, via design tokens and the `data-ic-*` hooks.

- **CC-12** Consumer styling (token overrides, `data-ic-part`/`data-ic-state` CSS) MUST NOT
  be able to alter any role, `aria-*`, `tabindex`, or behavior. Where a component forwards
  native props (e.g. `ToggleButton`), reserved attributes — including `className`/`style` —
  MUST be stripped from the props type, and reserved a11y attributes must win at runtime if
  forced; forwarded event handlers MUST be chained with (not replace) the library's.
- **CC-13** All library CSS MUST live inside the `@layer ic.base` cascade layer, so consumer
  CSS declared outside a layer overrides it without specificity/`!important` hacks.
- **CC-14** Every element MUST expose a stable `data-ic-part`; stateful elements MUST expose
  `data-ic-state` so consumers can style states WITHOUT targeting ARIA attributes.
  (Purely decorative leaf content inside an already-hooked part — e.g. an icon glyph or
  SVG path — may rely on its parent's hook.)
- **CC-15** *(Removed 2026-06: the `className`/`classNames`/`style` props were dropped from
  all components. The ID is retired, not reused.)*
- **CC-16** When multiple dismissible widgets are open, one Escape press MUST dismiss at
  most one of them (the one that handles the event first — innermost for element-scoped
  handlers). Escape handlers MUST skip events already claimed (`event.defaultPrevented`)
  and MUST claim (`preventDefault()`) the events they consume.

---

## 2. Toggle Button — `ToggleButton`

- **TB-1** MUST render a `<button type="button">` as its root.
- **TB-2** In `button` variant, state MUST be exposed via `aria-pressed="true|false"`.
- **TB-3** In `switch` variant, the root MUST have `role="switch"` and state via
  `aria-checked="true|false"` (and MUST NOT also set `aria-pressed`).
- **TB-4** MUST activate on both Space and Enter (native button behavior).
- **TB-5** The label and the state MUST NOT change at the same time. If a visual symbol
  changes (e.g. ▶/❚❚), the accessible name MUST stay constant (via `aria-label`).
  *(Consumer guideline — the component cannot enforce the label you pass; enforced by
  review and demonstrated in the showcase, not unit-tested.)*
- **TB-6** When the button's text is only "on"/"off", an external descriptive label MUST be
  associated via `aria-labelledby`. *(Consumer guideline — enforced by review, not
  unit-tested.)*
- **TB-7** State change MUST be reflected immediately (no page reload) and announced to AT
  via the state attribute (not by swapping label text alone).
- **TB-8** State MUST be distinguishable without color (shape/shadow/position change), per CC-4.
- **TB-9** MUST support both controlled (`pressed`) and uncontrolled (`defaultPressed`) use.

## 3. Collapsible Section — `Collapsible`

- **CO-1** The control MUST be a native `<button>` (not a heading or `div` with `role="button"`).
- **CO-2** `aria-expanded` MUST live on the **button**, toggling `"false"` ↔ `"true"`.
- **CO-3** `aria-expanded` MUST NOT be placed on the content region.
- **CO-4** Collapsed content MUST NOT be focusable or reachable by AT (achieved via the
  `hidden` attribute or by not rendering it).
- **CO-5** The trigger button MUST be wrapped in a real heading element of the correct level
  so AT announces "label, button, heading level N". Heading semantics MUST be preserved
  (do not replace a heading with `role="button"`).
- **CO-6** MUST NOT depend on `aria-controls` for the experience (AT support is patchy);
  source-order proximity of control→content must suffice. (Including it is allowed.)
- **CO-7** MUST NOT add `aria-haspopup` to the trigger (it is not a menu/popup).
- **CO-8** A visual affordance MUST indicate state: e.g. `+` when collapsed, `−` when expanded;
  the icon is decorative (CC-7).
- **CO-9** MUST activate via native button keys (Enter/Space); no custom key bindings required.

## 4. Tabs — `Tabs` (`Tabs.List` / `Tabs.Tab` / `Tabs.Panel`)

Structure / ARIA
- **TAB-1** The tab list container MUST have `role="tablist"` (with an accessible label).
- **TAB-2** Each tab MUST have `role="tab"`; any list-item wrappers MUST have `role="presentation"`.
- **TAB-3** Each panel MUST have `role="tabpanel"` and be labelled via `aria-labelledby`
  referencing its tab's `id`.
- **TAB-4** The active tab MUST have `aria-selected="true"`; inactive tabs `aria-selected="false"`.
- **TAB-5** Roving tabindex: the active tab MUST have `tabindex="0"`; inactive tabs `tabindex="-1"`.
- **TAB-6** Inactive panels MUST be hidden via the `hidden` attribute.
- **TAB-7** Panels MUST have `tabindex="-1"` so they can receive programmatic focus (but are
  not in the normal Tab order).

Keyboard
- **TAB-8** Left/Right arrows MUST move selection between tabs, moving focus to the newly
  selected tab — selection follows focus (automatic activation; no separate Enter/Space
  needed). Per the source article, arrow navigation does **NOT wrap**: Left on the first tab
  and Right on the last tab do nothing.
- **TAB-9** *(Enhancement — NOT in the source article; from the WAI-ARIA Authoring Practices.)*
  Home/End SHOULD select the first/last tab. See §14.
- **TAB-10** Down arrow on a tab MUST move focus into the active panel (the panel itself).
- **TAB-11** Tab key (not arrows) MUST move through focusable elements inside the active panel.
- **TAB-12** Shift+Tab from within/at a panel MUST return focus toward the selected tab.
- **TAB-13** A focused panel MUST be visually distinguishable (focus style).

Usage constraints (anti-patterns — enforced by review, not unit-testable)
- **TAB-14** MUST NOT be used for site-wide navigation or to disguise a same-page table of contents.
- **TAB-15** MUST NOT present SPA route views as tabs (use links + focus management instead).

## 5. Tooltip — `Tooltip`

- **TT-1** The tooltip element MUST have `role="tooltip"`.
- **TT-2** If the tooltip is the control's primary name, the trigger MUST reference it via
  `aria-labelledby`; if it is supplementary, via `aria-describedby`.
- **TT-3** The tooltip MUST appear on BOTH hover and focus of the trigger.
- **TT-4** The trigger MUST be focusable (so the tooltip can appear on focus, per TT-3).
  The article's examples use a `<button>`, but — unlike the toggletip (TG-1) — the tooltip
  article does not mandate a button; focusability is the actual requirement.
- **TT-5** The `title` attribute MUST NOT be used (CC-6).
- **TT-6** The tooltip's `id` MUST match the value referenced by the trigger's ARIA attribute.
- **TT-7** The tooltip MUST be dismissible with Escape while leaving the trigger usable
  (WCAG 1.4.13) — including when shown only by hover, with focus elsewhere on the page
  (handled at the document level, not via the trigger's own keydown).
- **TT-8** The tooltip MUST NOT contain interactive content (links, buttons, close handlers).
  *(Content guideline — `content` is a plain string by type; enforced by review, not unit-tested.)*
- **TT-9** Hover and focus MUST be tracked independently: a tooltip shown by focus stays
  visible while the trigger remains focused, regardless of pointer movement (WCAG 1.4.13
  "persistent").

## 6. Toggletip — `Toggletip`

- **TG-1** The trigger MUST be a `<button>` element.
- **TG-2** The revealed content MUST live in a live region with `role="status"`.
- **TG-3** It MUST open on click only — never on hover or focus.
- **TG-4** Opening MUST populate the live region so a screen reader announces the content.
- **TG-5** On reopen, the live region MUST be cleared and repopulated after a short delay
  (~100ms) so repeated identical content is still announced.
- **TG-6** It MUST be dismissible by Escape and by an outside interaction — a click/tap
  outside the component, or focus moving outside it. (The source names Escape and outside-click,
  and mentions the button losing focus, but does not mandate a dedicated `blur` handler.)
- **TG-7** It MUST NOT use `aria-describedby` (that makes the button "do nothing" to AT).
- **TG-8** The bubble MUST NOT contain interactive content. *(Content guideline — enforced
  by review, not unit-tested.)*

## 7. Menu Button — `MenuButton` (`MenuButton.Item`)

Structure / ARIA
- **MB-1** The trigger MUST be a `<button>`.
- **MB-2** The button MUST have `aria-haspopup="true"` at all times (the value never changes).
- **MB-3** The button MUST have `aria-expanded`, toggling on open/close (never opening on focus).
- **MB-4** The menu container MUST have `role="menu"`.
- **MB-5** Action items MUST have `role="menuitem"`; persistent choices `role="menuitemradio"`.
- **MB-6** All items MUST have `tabindex="-1"` (focusable only programmatically).
- **MB-7** The selected radio item MUST have `aria-checked="true"`; a visible checkmark MUST
  accompany it (paired with, not instead of, `aria-checked`).

Keyboard
- **MB-8** Enter, Space, or Down arrow on the button MUST open the menu.
- **MB-8a** Up arrow on the button MUST close the menu if it is open (source behavior; our
  implementation diverges — see §14).
- **MB-9** Escape (on the button or any item) MUST close the menu and return focus to the button.
- **MB-10** Down arrow MUST move to the next item, wrapping from last → first.
- **MB-11** Up arrow MUST move to the previous item, wrapping from first → last.
- **MB-12** Tab MUST exit the menu without cycling through items.

Focus management / behavior
- **MB-13** On open with no checked item, focus MUST go to the first enabled `menuitem`.
- **MB-14** On open with a checked item, focus MUST go to that checked item instead.
- **MB-15** Choosing an item MUST close the menu, return focus to the button, and emit the
  chosen value (our `onChoose` / `onValueChange`).
- **MB-16** Disabled items MUST be skipped by keyboard navigation and not be choosable.

Usage constraints (anti-patterns — enforced by review, not unit-testable)
- **MB-17** This pattern MUST NOT be used for site navigation (use nested lists of links).
- **MB-18** Navigation links MUST NOT be given `role="menuitem"` (it breaks link semantics).

## 8. Card — `Card` (+ `CardGrid`)

- **CD-1** Cards MUST be grouped in list markup: each `Card` is an `<li>` inside a `<ul>`
  (`CardGrid`), so AT announces list context and count.
- **CD-2** The card title MUST be a heading of the appropriate level.
- **CD-3** The primary link MUST be an `<a>` nested inside that heading (descriptive link text).
- **CD-4** Whole-card clickability MUST use the stretched pseudo-element technique: the card
  is `position: relative`, the title link's `::after` is `position: absolute; inset: 0`.
- **CD-5** Any secondary link MUST sit above the stretched link so it stays independently
  clickable. Per the source, `position: relative` on the secondary link is sufficient —
  `z-index` is NOT required.
- **CD-6** There MUST NOT be a nested `<a>` inside another `<a>` (the stretched link is a
  pseudo-element, not a wrapping anchor).
- **CD-7** Decorative images MUST have `alt=""`; content-bearing images MUST have meaningful
  `alt` and be placed after the heading in source order (reorder visually with CSS).
- **CD-8** Focus styling MUST use `:focus-within` so the whole card reacts when the title
  link is focused (mirroring hover). Per the source, `:hover` and `:focus-within` should NOT
  be combined in a single rule block (browsers lacking `:focus-within` would discard the whole
  rule), and a plain `:focus` fallback should be provided for them. (We target evergreen
  browsers — see §14.)
- **CD-9** A decorative "read more"/CTA MUST be `aria-hidden="true"` and associated to the
  primary link via `aria-describedby` (not announced as a separate control).
- **CD-10** The card MUST tolerate variable title/description lengths and image aspect ratios
  without breaking layout (e.g. `flex-grow`, `margin-top:auto`, `object-fit: cover`).
- **CD-11** Secondary links SHOULD have an enlarged hit area (padding) for touch accuracy.
- **CD-12** The card MUST NOT become a "miniature web page" — keep interactive elements (tab
  stops) minimal.

---

## 9. Todo List — `TodoList`

- **TD-1** The component MUST be wrapped in a `<section aria-labelledby="…">` referencing the
  id of its heading; the heading level is chosen by page hierarchy, not importance.
- **TD-2** Items MUST live in a `<ul>` so AT announces list context and item count.
- **TD-3** An empty state MUST be shown when the list has no items (the source drives it with
  CSS `ul:empty + .empty-state`; any equivalent that shows it exactly when empty is fine).
- **TD-4** The input + submit button MUST be wrapped in a `<form>` so Enter submits and screen
  readers enter forms mode.
- **TD-5** The input MUST have an accessible name via `aria-label` (e.g. "Write a new todo
  item"). A placeholder MUST NOT be the sole label, and placeholder text needs sufficient
  contrast (WCAG 1.4.3).
- **TD-6** While the input is invalid/empty, it MUST carry `aria-invalid="true"` and the
  submit button MUST be disabled.
- **TD-7** Adding an item MUST announce "[item name] added" via a `role="status"` /
  `aria-live="polite"` live region; focus MUST NOT move, so the user can keep typing.
- **TD-8** Each checkbox MUST be paired with a `<label for>`; the checked (done) state is
  styled via `:checked + label` (strikethrough) — never conveyed by color alone.
- **TD-9** Each delete button MUST be named per item: `aria-label="delete [item name]"`.
- **TD-10** After deleting an item, focus MUST move to the section heading (which has
  `tabindex="-1"`), so keyboard users are not dropped on a removed element.
- **TD-11** Deletion MUST announce "[item name] deleted" via the same live region.

## 10. Content Slider — `ContentSlider`

- **CS-1** The container MUST have `role="region"`, an `aria-label` (e.g. "gallery"),
  `tabindex="0"`, and `aria-describedby` pointing at its usage instructions.
- **CS-2** Slides MUST be grouped in list markup; a captioned slide is a `<figure>` containing
  the `<img>` and a `<figcaption>`.
- **CS-3** When the region is focused, left/right arrow keys MUST scroll it — this is the
  native behavior of a focusable scroll container; the implementation must not break it.
- **CS-4** Instructions MUST match the input modality: hover → "scroll for more", keyboard
  focus → "use your arrow keys", touch (detected via a first `touchstart`) → "swipe for more".
- **CS-5** Slides MUST snap into place via CSS scroll-snap. (The article's
  `scroll-snap-points-x` is legacy; implement with modern `scroll-snap-type` /
  `scroll-snap-align` — noted as an adaptation.)
- **CS-6** Images MUST lazy-load via `IntersectionObserver` (placeholder `src` + `data-src`);
  when unsupported, all images load immediately. (The article's `<noscript>` fallback is out
  of scope — React adaptation, see §14.)
- **CS-7** Previous/next buttons MUST be rendered only when `IntersectionObserver` is
  supported, labelled `aria-label="previous"` / `"next"`, grouped under a list labelled
  "gallery controls"; activating one snaps the adjacent slide fully into view.
- **CS-8** Links inside slides that are not currently visible MUST get `tabindex="-1"`,
  restored when their slide intersects the viewport.
- **CS-9** The slider MUST NOT auto-rotate — it moves only when the user slides it.
- **CS-10** The focusable region MUST have a visible focus style (CC-3).

## 11. Data Table — `DataTable`

- **DT-1** Real `<table>` semantics only: never use tables for layout, and never use CSS
  `display` overrides that strip table semantics from AT.
- **DT-2** Column headers MUST be `<th scope="col">`; rows with an identifying value MUST use
  `<th scope="row">` so cells announce both headers.
- **DT-3** The table MUST be labelled with a `<caption>` (superior to a preceding heading; a
  heading may be placed inside the caption).
- **DT-4** Wide tables get a scrollable wrapper (`overflow-x: auto`) that becomes focusable
  (`tabindex="0"`) ONLY when content actually overflows — checked via
  `scrollWidth > clientWidth` on mount, on window resize, and when the data props change.
- **DT-5** The scrollable wrapper MUST have `role="group"` and `aria-labelledby` pointing at
  the caption's id, so the focus stop has a name and a role.
- **DT-6** When overflowing, a "(scroll to see more)" hint MUST appear with the caption.
- **DT-7** Sortable columns: a real `<button>` inside `<th scope="col" role="columnheader">`;
  sort state via `aria-sort="ascending|descending|none"`; the button labelled
  "sort by [column] in [ascending|descending] order"; a three-state visual icon (↕ / ↑ / ↓).
- **DT-8** Sorting MUST NOT mutate the original data (copy the array before `sort()`).
- **DT-9** On very narrow viewports, switch to a headings + `<dl>` layout (row `<th>` →
  heading, column `<th>` → `<dt>`, `<td>` → `<dd>`), toggled at a breakpoint — not rebuilt
  in the DOM at runtime.
- **DT-10** Plain data tables MUST NOT use `role="grid"` or grid-style cell keyboard behavior.
- **DT-11** The sort comparator MUST be a consistent total order even for mixed-type
  columns: numbers compare numerically and sort before strings; strings compare via
  numeric-aware collation (so `"2"` < `"10"`). A non-transitive comparator makes the
  sorted order depend on the input order.

## 12. Notifications — `NotificationProvider` / `useNotify`

- **NT-1** The live region MUST have BOTH `role="status"` and `aria-live="polite"` — using
  both maximizes compatibility across browser/AT pairings.
- **NT-2** Focus MUST NOT move to notifications. Only dialogs that require user action may
  take focus — notifications never do.
- **NT-3** For message streams, the region MUST set `aria-relevant="additions"` so only new
  messages are announced, not edits to existing ones.
- **NT-4** `aria-atomic="true"` MUST NOT be used unless the entire region should re-announce
  on every change.
- **NT-5** Message type MUST be conveyed textually ("Error:", "Info:"), never by color/icon
  alone; icon alternatives use visually-hidden text, not `aria-label` (translation services
  miss it).
- **NT-6** Notifications SHOULD auto-dismiss after an appropriate time rather than requiring
  close buttons.
- **NT-7** When the tab is hidden (Page Visibility API), the live region MUST be disabled
  (`role="none"` + `aria-live="off"`) and restored when the tab is visible again.
- **NT-8** Announcements MUST be restricted to messages relevant to the user's current
  context/activity. *(App-level guideline — enforced by review, not unit-tested.)*
- **NT-9** Users SHOULD be able to control notification verbosity via settings built from
  standard form controls. *(App-level guideline — enforced by review, not unit-tested.)*
- **NT-10** Notification content MUST remain discoverable elsewhere in the interface — the
  announcement is temporary, not the record. *(App-level guideline — enforced by review,
  not unit-tested.)*

---

## 13. Verification

A component passes only when checked against its rules in three ways:

1. **Keyboard-only:** unplug the mouse. Confirm every rule's keys (e.g. TAB-8…TAB-12,
   MB-8…MB-12) behave exactly as written, focus is always visible, and focus never gets stuck.
2. **Screen reader:** with VoiceOver (macOS) or NVDA (Windows), confirm announcements match
   the ARIA rules — role, state, label, and that live regions (TG-2, TG-4) speak.
3. **Automated:** run `axe`/`jest-axe` to catch missing names, bad roles, and contrast issues.
   (Automated tools cannot verify keyboard/focus behavior — items 1 and 2 are mandatory.)

Test scaffolding: Vitest + `@testing-library/react` (jsdom), one describe-block per
component keyed by these rule IDs, plus `styling.test.tsx` for the cross-cutting styling
contract and `css-contract.test.ts` for static checks over the stylesheets (CC-3/7/9/13
mechanical halves). `jest-axe` is not installed — the automated axe pass is currently a
manual step.

### Browser-verified rules (manual checklist)

These rules are real-browser/CSS behavior that jsdom cannot observe. The static CSS contract
test guards their mechanical halves; the visual/behavioral judgment needs a periodic
keyboard + screen-reader pass in a real browser:

- **TB-8** state distinguishable without color · **CO-8** the +/− affordance reads clearly
- **TAB-13** focused panel is visibly distinct
- **CD-4** whole card clickable via the stretched link · **CD-8** `:focus-within` mirrors
  hover · **CD-10** layout tolerates variable content · **CD-11** secondary-link hit area
- **CS-3** arrow keys scroll the focused region · **CS-5** slides snap into place ·
  **CS-10** the region's focus ring is visible
- **DT-6** the "(scroll to see more)" hint shows only while overflowing · **DT-9** the
  narrow-viewport `<dl>` swap happens at the breakpoint
- **CC-3/CC-4** visual halves: every focus ring actually visible; no state conveyed by
  color alone

Last full pass: _not yet recorded — after each pass, note the date and the browser /
screen-reader pair here._

---

## 14. Known intentional deviations from source

These are conscious choices for our React context; they still satisfy the underlying rule.

- **No-JS fallback dropped** — the source articles progressively enhance from working HTML;
  a React SPA requires JS. Semantics/ARIA/keyboard parity is preserved (per the §1–12 rules).
  This applies equally to the Phase-2 components (e.g. the slider's `<noscript>` images,
  CS-6; the todo list's progressive enhancement).
- **CO-4 via unmount** — `Collapsible` removes collapsed content from the DOM rather than using
  the `hidden` attribute. Both satisfy "collapsed content is not focusable / not in the a11y tree".
- **CO-6 / MB / aria-controls** — we *include* `aria-controls` where natural but never *depend*
  on it; the experience holds without it.
- **CD ids** — unique ids come from React's `useId()` rather than slugified titles (CC-8 still met).
- **Monochrome styling** — the showcase and tokens are deliberately plain; this does not affect
  any rule except that contrast must still pass (CC-4 / axe).
- **Tabs: arrow wrapping (TAB-8)** — the source article does **not** wrap at the ends; our
  implementation **does** wrap (Left on first → last, Right on last → first). This is an
  enhancement aligned with the WAI-ARIA APG, but it is a deliberate divergence from the article.
- **Tabs: Home/End (TAB-9)** — not in the source; our implementation adds them (APG enhancement).
- **Menu Button: Up arrow on the button (MB-8a)** — the source says Up on the button *closes*
  the menu if open. Our implementation instead follows the WAI-ARIA APG: Up on the (closed)
  button *opens* the menu and focuses the **last** item. Because opening moves focus off the
  button onto an item, the source's "close on Up" scenario does not arise in our build. This is
  a known divergence; reconcile if strict source-fidelity is required.
- **Toggletip: dismiss (TG-6)** — we dismiss on Escape and on outside interaction; our
  `useOnClickOutside` listens for both `pointerdown` and `focusin` outside the component, so
  focus moving to another element also dismisses it. This satisfies TG-6. The only uncovered
  case is focus leaving the document entirely (e.g. to browser chrome) — a benign edge case.
- **Card: combined `:hover`/`:focus-within` (CD-8)** — our `Card.module.css` puts `.card:hover`
  and `.card:focus-within` in one rule and omits the legacy `:focus` fallback, contrary to the
  source's caution. Safe given our evergreen-browser target (consistent with dropping no-JS/
  legacy fallbacks above).
- **Card: redundant `z-index` (CD-5)** — our secondary link uses `position: relative` *and*
  `z-index: 1`; the source notes `z-index` is unnecessary. Harmless, but redundant.
