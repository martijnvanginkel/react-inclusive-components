import { useId, useRef, useState } from 'react';
import { useControllableState } from '../shared/useControllableState';
import { makeSlots } from '../shared/slots';
import vh from '../shared/visuallyHidden.module.css';
import styles from './TodoList.module.css';

export interface TodoItem {
  id: string;
  text: string;
  done: boolean;
}

/** Styleable parts (target via `data-ic-part` in CSS). */
type TodoListPart =
  | 'root'
  | 'heading'
  | 'form'
  | 'input'
  | 'addButton'
  | 'list'
  | 'item'
  | 'checkbox'
  | 'itemLabel'
  | 'deleteButton'
  | 'emptyState';

export interface TodoListProps {
  /** Heading text labelling the whole component. Default: "My todo list". */
  label?: string;
  /** Heading level for the label. Default: 2. */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Uncontrolled initial items (plain strings; ids are generated). */
  defaultItems?: string[];
  /** Controlled items. */
  items?: TodoItem[];
  /** Called with the next items array on any add/toggle/delete. */
  onItemsChange?: (items: TodoItem[]) => void;
  /** Shown when the list is empty. Default: "Nothing here yet. Add your first todo above!" */
  emptyState?: React.ReactNode;
}

/**
 * An inclusive todo list (add, check off, delete). Additions and deletions are announced
 * via a polite live region WITHOUT moving focus; deleting an item moves focus to the
 * section heading so keyboard users are never stranded on a removed element.
 */
export function TodoList({
  label = 'My todo list',
  headingLevel = 2,
  defaultItems,
  items,
  onItemsChange,
  emptyState = 'Nothing here yet. Add your first todo above!',
}: TodoListProps) {
  const baseId = useId();
  const headingId = `${baseId}-heading`;
  const Heading = `h${headingLevel}` as const;
  const headingRef = useRef<HTMLHeadingElement>(null);
  const counter = useRef(0);
  const slot = makeSlots<TodoListPart>();

  // Initial conversion runs once (useState initializer); ids are index-based and stable.
  const [initialList] = useState<TodoItem[]>(() =>
    (defaultItems ?? []).map((text, i) => ({ id: `${baseId}-init-${i}`, text, done: false })),
  );
  const [list, setList] = useControllableState<TodoItem[]>({
    controlled: items,
    defaultValue: initialList,
    onChange: onItemsChange,
  });

  const [text, setText] = useState('');
  const [announcement, setAnnouncement] = useState('');
  const valid = text.trim().length > 0;

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!valid) return;
    const item: TodoItem = { id: `${baseId}-new-${counter.current++}`, text: text.trim(), done: false };
    setList([...list, item]);
    setAnnouncement(`${item.text} added`);
    setText('');
    // Focus stays in the input so the user can keep adding items (TD-7).
  };

  const toggle = (id: string) => {
    setList(list.map((i) => (i.id === id ? { ...i, done: !i.done } : i)));
  };

  const remove = (item: TodoItem) => {
    setList(list.filter((i) => i.id !== item.id));
    setAnnouncement(`${item.text} deleted`);
    // The deleted item may have held focus — move it to the heading (TD-10).
    headingRef.current?.focus();
  };

  return (
    <section aria-labelledby={headingId} {...slot('root', styles.root)}>
      <Heading id={headingId} tabIndex={-1} ref={headingRef} {...slot('heading', styles.heading)}>
        {label}
      </Heading>

      <form onSubmit={onSubmit} {...slot('form', styles.form)}>
        <input
          type="text"
          aria-label="Write a new todo item"
          aria-invalid={!valid}
          value={text}
          onChange={(e) => setText(e.target.value)}
          {...slot('input', styles.input)}
        />
        <button type="submit" disabled={!valid} {...slot('addButton', styles.addButton)}>
          Add
        </button>
      </form>

      <ul {...slot('list', styles.list)}>
        {list.map((item) => (
          <li key={item.id} {...slot('item', styles.item, item.done ? 'done' : undefined)}>
            <input
              type="checkbox"
              id={`${item.id}-check`}
              checked={item.done}
              onChange={() => toggle(item.id)}
              {...slot('checkbox', styles.checkbox)}
            />
            <label htmlFor={`${item.id}-check`} {...slot('itemLabel', styles.itemLabel)}>
              {item.text}
            </label>
            <button
              type="button"
              aria-label={`delete ${item.text}`}
              onClick={() => remove(item)}
              {...slot('deleteButton', styles.deleteButton)}
            >
              <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false">
                <path
                  d="M3 3l10 10M13 3L3 13"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </li>
        ))}
      </ul>

      {list.length === 0 && <p {...slot('emptyState', styles.emptyState)}>{emptyState}</p>}

      {/* Announces add/delete without moving focus (TD-7/TD-11). */}
      <span role="status" aria-live="polite" className={vh.visuallyHidden}>
        {announcement}
      </span>
    </section>
  );
}
