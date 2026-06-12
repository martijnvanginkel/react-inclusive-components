import {
  createContext,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import { useControllableState } from '../shared/useControllableState';
import { useOnClickOutside } from '../shared/useOnClickOutside';
import { makeSlots } from '../shared/slots';
import styles from './MenuButton.module.css';

/** Styleable parts (target via `data-ic-part` in CSS). */
type MenuButtonPart = 'root' | 'trigger' | 'caret' | 'menu' | 'item' | 'check';

interface MenuContextValue {
  type: 'menu' | 'radio';
  value: string | undefined;
  choose: (value: string) => void;
  registerItem: (el: HTMLButtonElement | null, value: string) => void;
}

const MenuContext = createContext<MenuContextValue | null>(null);

export interface MenuButtonProps {
  /** Button label. */
  label: React.ReactNode;
  /** "menu" of actions, or "radio" group of mutually-exclusive choices. Default: "menu". */
  type?: 'menu' | 'radio';
  /** For type="radio": controlled checked item value. */
  value?: string;
  /** For type="radio": uncontrolled initial checked value. */
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Fired when any item is chosen. */
  onChoose?: (value: string) => void;
  children: React.ReactNode;
}

/**
 * A button that opens a menu of actions or mutually-exclusive choices (an application
 * menu, not site navigation). Implements the WAI-ARIA menu-button keyboard model:
 * Enter/Space/Down opens, Up/Down navigate (wrapping), Escape closes and returns focus
 * to the button, selecting an item closes and refocuses the button.
 */
export function MenuButton({
  label,
  type = 'menu',
  value,
  defaultValue,
  onValueChange,
  onChoose,
  children,
}: MenuButtonProps) {
  const baseId = useId();
  const [open, setOpen] = useState(false);
  const [checked, setChecked] = useControllableState({
    controlled: value,
    defaultValue: defaultValue ?? '',
    onChange: onValueChange,
  });

  // Latest-ref for onChoose: the context (and thus `choose`) is memoized and, for an
  // actions menu, never recomputes — so read the current handler at call time, not a frozen one.
  const onChooseRef = useRef(onChoose);
  useEffect(() => {
    onChooseRef.current = onChoose;
  });

  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const items = useRef<Array<{ el: HTMLButtonElement; value: string }>>([]);
  // Tracks which item should receive focus once the menu opens/renders.
  const focusIntent = useRef<'first' | 'last' | 'checked' | null>(null);

  const registerItem = useMemo(
    () => (el: HTMLButtonElement | null, itemValue: string) => {
      items.current = items.current.filter((i) => i.value !== itemValue);
      if (el) items.current.push({ el, value: itemValue });
    },
    [],
  );

  const itemsInDomOrder = () =>
    items.current
      .slice()
      .sort((a, b) =>
        a.el.compareDocumentPosition(b.el) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1,
      );

  const openMenu = (intent: 'first' | 'last' | 'checked') => {
    focusIntent.current = intent;
    setOpen(true);
  };

  const closeMenu = (refocus = true) => {
    setOpen(false);
    if (refocus) buttonRef.current?.focus();
  };

  // After the menu opens and items have rendered, move focus per intent.
  useEffect(() => {
    if (!open || !focusIntent.current) return;
    const ordered = itemsInDomOrder();
    if (ordered.length === 0) return;
    let target: HTMLButtonElement | undefined;
    if (focusIntent.current === 'last') {
      target = ordered[ordered.length - 1].el;
    } else if (focusIntent.current === 'checked') {
      target = ordered.find((i) => i.value === checked)?.el ?? ordered[0].el;
    } else {
      target = ordered[0].el;
    }
    focusIntent.current = null;
    target?.focus();
  }, [open, checked]);

  useOnClickOutside(rootRef, () => closeMenu(false), open);

  const choose = (itemValue: string) => {
    if (type === 'radio') setChecked(itemValue);
    onChooseRef.current?.(itemValue);
    closeMenu(true);
  };

  const onButtonKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    switch (event.key) {
      case 'Enter':
      case ' ':
      case 'ArrowDown':
        event.preventDefault();
        openMenu(type === 'radio' && checked ? 'checked' : 'first');
        break;
      case 'ArrowUp':
        event.preventDefault();
        openMenu('last');
        break;
    }
  };

  const onMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const ordered = itemsInDomOrder();
    const currentIndex = ordered.findIndex((i) => i.el === document.activeElement);

    switch (event.key) {
      case 'ArrowDown': {
        event.preventDefault();
        const next = ordered[(currentIndex + 1) % ordered.length];
        next?.el.focus();
        break;
      }
      case 'ArrowUp': {
        event.preventDefault();
        const prev = ordered[(currentIndex - 1 + ordered.length) % ordered.length];
        prev?.el.focus();
        break;
      }
      case 'Home':
        event.preventDefault();
        ordered[0]?.el.focus();
        break;
      case 'End':
        event.preventDefault();
        ordered[ordered.length - 1]?.el.focus();
        break;
      case 'Escape':
        event.preventDefault();
        closeMenu(true);
        break;
      case 'Tab':
        // Tab exits the menu without traversing items.
        closeMenu(false);
        break;
    }
  };

  const slot = makeSlots<MenuButtonPart>();

  const ctx = useMemo<MenuContextValue>(
    () => ({ type, value: checked, choose, registerItem }),
    // choose closes over current state but reads onChoose via a ref, so a frozen ctx is fine.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [type, checked, registerItem],
  );

  return (
    <div ref={rootRef} {...slot('root', styles.root)}>
      <button
        ref={buttonRef}
        type="button"
        {...slot('trigger', styles.trigger, open ? 'open' : 'closed')}
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={open ? `${baseId}-menu` : undefined}
        onClick={() =>
          open ? closeMenu(false) : openMenu(type === 'radio' && checked ? 'checked' : 'first')
        }
        onKeyDown={onButtonKeyDown}
      >
        {label}
        <span {...slot('caret', styles.caret)} aria-hidden="true">
          ▾
        </span>
      </button>
      {open && (
        <MenuContext.Provider value={ctx}>
          <div id={`${baseId}-menu`} role="menu" {...slot('menu', styles.menu)} onKeyDown={onMenuKeyDown}>
            {children}
          </div>
        </MenuContext.Provider>
      )}
    </div>
  );
}

export interface MenuItemProps {
  /** Value passed to onChoose / used for radio checked state. */
  value: string;
  children: React.ReactNode;
  disabled?: boolean;
}

function MenuItem({ value, children, disabled }: MenuItemProps) {
  const ctx = useContext(MenuContext);
  if (!ctx) throw new Error('<MenuButton.Item> must be used inside <MenuButton>');
  const isRadio = ctx.type === 'radio';
  const isChecked = isRadio && ctx.value === value;
  const slot = makeSlots<MenuButtonPart>();

  return (
    <button
      ref={(el) => ctx.registerItem(disabled ? null : el, value)}
      type="button"
      role={isRadio ? 'menuitemradio' : 'menuitem'}
      aria-checked={isRadio ? isChecked : undefined}
      tabIndex={-1}
      disabled={disabled}
      {...slot('item', styles.item, isChecked ? 'checked' : disabled ? 'disabled' : undefined)}
      onClick={() => ctx.choose(value)}
    >
      {isRadio && (
        <span {...slot('check', styles.check)} aria-hidden="true" data-checked={isChecked} />
      )}
      <span>{children}</span>
    </button>
  );
}

MenuButton.Item = MenuItem;
