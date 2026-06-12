import { TodoList } from '../../lib';

export function TodoListDemo() {
  return (
    <>
      <p className="note">
        Add, check off, and delete items. Additions and deletions are announced via a polite
        live region <em>without</em> moving focus; deleting an item moves focus to the heading
        so keyboard users are never stranded. An empty input is <code>aria-invalid</code> and
        disables the Add button.
      </p>

      <TodoList label="My todo list" defaultItems={['Pick up the kids', 'Buy milk']} />
    </>
  );
}
