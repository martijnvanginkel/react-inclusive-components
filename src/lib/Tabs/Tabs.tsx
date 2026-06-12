import {
  createContext,
  useContext,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  type KeyboardEvent,
} from 'react';
import { useControllableState } from '../shared/useControllableState';
import { makeSlots } from '../shared/slots';
import styles from './Tabs.module.css';

/** Styleable parts (target via `data-ic-part` in CSS). */
type TabsPart = 'root' | 'list' | 'tab' | 'panel';

interface TabsContextValue {
  baseId: string;
  label: string;
  selected: string;
  select: (value: string) => void;
  /** Register/unregister a tab so the list knows DOM order for arrow-key nav. */
  register: (value: string) => () => void;
  order: React.RefObject<string[]>;
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
  const order = useRef<string[]>([]);
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const panelRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const [selected, setSelected] = useControllableState({
    controlled: value,
    defaultValue,
    onChange: onValueChange,
  });

  const register = useMemo(
    () => (val: string) => {
      if (!order.current.includes(val)) order.current.push(val);
      return () => {
        order.current = order.current.filter((v) => v !== val);
      };
    },
    [],
  );

  // After tabs register (their layout effects run before this parent one), if nothing
  // valid is selected, fall back to the first tab. Runs before paint → no flash.
  useLayoutEffect(() => {
    if (value !== undefined) return; // controlled: parent owns selection
    if (!selected || !order.current.includes(selected)) {
      const first = order.current[0];
      if (first) setSelected(first);
    }
  });

  const ctx = useMemo<TabsContextValue>(
    () => ({
      baseId,
      label,
      selected,
      select: setSelected,
      register,
      order,
      tabRefs,
      panelRefs,
    }),
    [baseId, label, selected, setSelected, register],
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
  const { order, tabRefs, selected, select, panelRefs, label: ctxLabel } = useTabs('Tabs.List');
  const slot = makeSlots<TabsPart>();

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const tabs = order.current;
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
  const { baseId, selected, select, register, tabRefs } = useTabs('Tabs.Tab');
  const isSelected = selected === value;
  const slot = makeSlots<TabsPart>();

  useLayoutEffect(() => register(value), [register, value]);

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
