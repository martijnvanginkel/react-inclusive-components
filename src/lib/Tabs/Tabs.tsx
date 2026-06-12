import {
  createContext,
  useCallback,
  useContext,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import { useControllableState } from '../shared/useControllableState';
import { sortByDomPosition } from '../shared/dom';
import { makeSlots } from '../shared/slots';
import styles from './Tabs.module.css';

/** Styleable parts (target via `data-ic-part` in CSS). */
type TabsPart = 'root' | 'list' | 'tab' | 'panel';

interface TabsContextValue {
  baseId: string;
  label: string;
  selected: string;
  select: (value: string) => void;
  /** Tab values in DOM order (not mount order) — the basis for arrow-key nav. */
  orderedTabs: () => string[];
  tabRefs: React.RefObject<Map<string, HTMLButtonElement>>;
  panelRefs: React.RefObject<Map<string, HTMLDivElement>>;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabs(component: string): TabsContextValue {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error(`<${component}> must be used inside <Tabs>`);
  return ctx;
}

const tabId = (base: string, value: string) => `${base}-tab-${value}`;
const panelId = (base: string, value: string) => `${base}-panel-${value}`;

export interface TabsProps {
  /** Controlled selected tab value. */
  value?: string;
  /** Uncontrolled initial selected value. Defaults to the first registered tab. */
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Accessible label for the tablist. */
  label: string;
  children: React.ReactNode;
}

/**
 * Tabbed panels with desktop keyboard ergonomics (roving tabindex, arrow/Home/End
 * to move selection, Down arrow to enter the active panel). Composed of
 * `<Tabs.List>`, `<Tabs.Tab value>` and `<Tabs.Panel value>`.
 */
export function Tabs({ value, defaultValue = '', onValueChange, label, children }: TabsProps) {
  const baseId = useId();
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const panelRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const [selected, setSelected] = useControllableState({
    controlled: value,
    defaultValue,
    onChange: onValueChange,
  });

  // Tab order comes from the rendered DOM, not registration order, so tabs inserted or
  // reordered later still navigate in visual order.
  const orderedTabs = useCallback(
    () =>
      sortByDomPosition(Array.from(tabRefs.current.keys()), (v) => tabRefs.current.get(v)),
    [],
  );

  // Uncontrolled with nothing (or a removed tab) selected: fall back to the first tab
  // WITHOUT firing onValueChange — no user interaction happened. Tab refs are attached
  // by the time this parent layout effect runs; before paint → no flash. The effect is
  // deliberately dep-less (registration changes don't show up in any dep), and only
  // updates state when the fallback actually changes.
  const [autoSelected, setAutoSelected] = useState<string | null>(null);
  // Deliberately dep-less: tab registration changes (insert/remove) don't appear in any
  // dependency, so the fallback must be re-checked after every render.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useLayoutEffect(() => {
    if (value !== undefined) return; // controlled: parent owns selection
    const tabs = orderedTabs();
    const valid = selected !== '' && tabs.includes(selected);
    const next = valid ? null : (tabs[0] ?? null);
    // Guarded sync of DOM-derived state: only sets when the fallback actually changes,
    // so it cannot cascade.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAutoSelected((prev) => (prev === next ? prev : next));
  });
  const active = value !== undefined ? selected : (autoSelected ?? selected);

  const ctx = useMemo<TabsContextValue>(
    () => ({
      baseId,
      label,
      selected: active,
      select: setSelected,
      orderedTabs,
      tabRefs,
      panelRefs,
    }),
    [baseId, label, active, setSelected, orderedTabs],
  );

  const slot = makeSlots<TabsPart>();

  return (
    <TabsContext.Provider value={ctx}>
      {/* No aria-label here: a div without a role is not a labelable element. The label
          lives on role="tablist" inside <Tabs.List>. */}
      <div {...slot('root', styles.root)}>{children}</div>
    </TabsContext.Provider>
  );
}

export interface TabsListProps {
  /** Accessible label for the tablist. Defaults to the `label` passed to <Tabs>. */
  label?: string;
  children: React.ReactNode;
}

function TabsList({ label, children }: TabsListProps) {
  const { orderedTabs, tabRefs, selected, select, panelRefs, label: ctxLabel } =
    useTabs('Tabs.List');
  const slot = makeSlots<TabsPart>();

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const tabs = orderedTabs();
    if (tabs.length === 0) return;
    const current = tabs.indexOf(selected);
    let next: number;

    switch (event.key) {
      case 'ArrowRight':
        next = (current + 1) % tabs.length;
        break;
      case 'ArrowLeft':
        next = (current - 1 + tabs.length) % tabs.length;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = tabs.length - 1;
        break;
      case 'ArrowDown':
        // Move focus into the active panel.
        event.preventDefault();
        panelRefs.current.get(selected)?.focus();
        return;
      default:
        return;
    }

    event.preventDefault();
    const value = tabs[next];
    select(value);
    tabRefs.current.get(value)?.focus();
  };

  return (
    <div role="tablist" aria-label={label ?? ctxLabel} {...slot('list', styles.list)} onKeyDown={onKeyDown}>
      {children}
    </div>
  );
}

export interface TabProps {
  value: string;
  children: React.ReactNode;
}

function Tab({ value, children }: TabProps) {
  const { baseId, selected, select, tabRefs } = useTabs('Tabs.Tab');
  const isSelected = selected === value;
  const slot = makeSlots<TabsPart>();

  return (
    <button
      ref={(node) => {
        if (node) tabRefs.current.set(value, node);
        else tabRefs.current.delete(value);
      }}
      type="button"
      role="tab"
      id={tabId(baseId, value)}
      aria-selected={isSelected}
      aria-controls={panelId(baseId, value)}
      tabIndex={isSelected ? 0 : -1}
      {...slot('tab', styles.tab, isSelected && 'selected')}
      onClick={() => select(value)}
    >
      {children}
    </button>
  );
}

export interface TabPanelProps {
  value: string;
  children: React.ReactNode;
}

function TabPanel({ value, children }: TabPanelProps) {
  const { baseId, selected, panelRefs } = useTabs('Tabs.Panel');
  const isSelected = selected === value;
  const slot = makeSlots<TabsPart>();

  return (
    <div
      ref={(node) => {
        if (node) panelRefs.current.set(value, node);
        else panelRefs.current.delete(value);
      }}
      role="tabpanel"
      id={panelId(baseId, value)}
      aria-labelledby={tabId(baseId, value)}
      tabIndex={-1}
      hidden={!isSelected}
      {...slot('panel', styles.panel, isSelected ? 'selected' : 'hidden')}
    >
      {children}
    </div>
  );
}

Tabs.List = TabsList;
Tabs.Tab = Tab;
Tabs.Panel = TabPanel;
