import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TodoList } from './TodoList';

// Rules covered: TD-1..TD-11 (see REQUIREMENTS.md §9). The :checked strikethrough (TD-8
// visual half) is CSS and verified manually.

const getStatus = () => document.querySelector('[role="status"]') as HTMLElement;

describe('TodoList', () => {
  it('TD-1/TD-2: a section labelled by its heading, items in a <ul>', () => {
    render(<TodoList label="Groceries" defaultItems={['Milk']} />);
    const region = screen.getByRole('region', { name: 'Groceries' });
    expect(region.tagName).toBe('SECTION');
    const heading = screen.getByRole('heading', { name: 'Groceries' });
    expect(region).toHaveAttribute('aria-labelledby', heading.id);
    expect(screen.getByRole('list')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(1);
  });

  it('TD-3: shows an empty state only when there are no items', async () => {
    const user = userEvent.setup();
    render(<TodoList />);
    expect(screen.getByText(/nothing here yet/i)).toBeInTheDocument();
    await user.type(screen.getByRole('textbox'), 'Milk{Enter}');
    expect(screen.queryByText(/nothing here yet/i)).not.toBeInTheDocument();
  });

  it('TD-4/TD-5: a form wraps an aria-labelled input + submit button (Enter adds)', async () => {
    const user = userEvent.setup();
    render(<TodoList />);
    const input = screen.getByRole('textbox', { name: 'Write a new todo item' });
    expect(input.closest('form')).toBeInTheDocument();
    await user.type(input, 'Call mom{Enter}');
    expect(screen.getByRole('listitem')).toHaveTextContent('Call mom');
  });

  it('TD-6: empty input is aria-invalid and the submit button is disabled', async () => {
    const user = userEvent.setup();
    render(<TodoList />);
    const input = screen.getByRole('textbox');
    const add = screen.getByRole('button', { name: 'Add' });
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(add).toBeDisabled();
    await user.type(input, 'Milk');
    expect(input).toHaveAttribute('aria-invalid', 'false');
    expect(add).toBeEnabled();
  });

  it('TD-7: adding announces via the live region and does NOT move focus', async () => {
    const user = userEvent.setup();
    render(<TodoList />);
    const input = screen.getByRole('textbox');
    await user.type(input, 'Buy milk{Enter}');
    expect(getStatus()).toHaveTextContent('Buy milk added');
    expect(input).toHaveFocus(); // user can keep typing
  });

  it('TD-8: each item has a real checkbox paired with a label, toggling done state', async () => {
    const user = userEvent.setup();
    render(<TodoList defaultItems={['Buy milk']} />);
    const checkbox = screen.getByRole('checkbox', { name: 'Buy milk' });
    expect(checkbox).not.toBeChecked();
    await user.click(checkbox);
    expect(checkbox).toBeChecked();
  });

  it('TD-9: delete buttons are named per item', () => {
    render(<TodoList defaultItems={['Buy milk', 'Call mom']} />);
    expect(screen.getByRole('button', { name: 'delete Buy milk' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'delete Call mom' })).toBeInTheDocument();
  });

  it('TD-10/TD-11: deleting announces and moves focus to the heading', async () => {
    const user = userEvent.setup();
    render(<TodoList label="Groceries" defaultItems={['Buy milk']} />);
    await user.click(screen.getByRole('button', { name: 'delete Buy milk' }));
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
    expect(getStatus()).toHaveTextContent('Buy milk deleted');
    expect(screen.getByRole('heading', { name: 'Groceries' })).toHaveFocus();
  });

  it('supports controlled items', async () => {
    const user = userEvent.setup();
    const onItemsChange = vi.fn();
    render(
      <TodoList
        items={[{ id: '1', text: 'Fixed item', done: false }]}
        onItemsChange={onItemsChange}
      />,
    );
    const list = screen.getByRole('list');
    expect(within(list).getByText('Fixed item')).toBeInTheDocument();
    await user.click(screen.getByRole('checkbox', { name: 'Fixed item' }));
    expect(onItemsChange).toHaveBeenCalledWith([{ id: '1', text: 'Fixed item', done: true }]);
    // Controlled: stays unchecked until the parent updates the prop.
    expect(screen.getByRole('checkbox', { name: 'Fixed item' })).not.toBeChecked();
  });
});
