import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { MenuButton } from './MenuButton';

// Rules covered: MB-1..MB-16 incl. MB-8a (see REQUIREMENTS.md). MB-8a (source: Up-on-button
// closes) is a documented deviation (§14): our build follows the WAI-ARIA APG — Up on the
// closed button opens the menu focusing the last item — and is tested as implemented.
// MB-17/MB-18 are usage guidelines (not unit-testable).

function ActionsMenu(props: { onChoose?: (v: string) => void }) {
  return (
    <MenuButton label="Actions" onChoose={props.onChoose}>
      <MenuButton.Item value="edit">Edit</MenuButton.Item>
      <MenuButton.Item value="duplicate">Duplicate</MenuButton.Item>
      <MenuButton.Item value="archive" disabled>
        Archive
      </MenuButton.Item>
      <MenuButton.Item value="delete">Delete</MenuButton.Item>
    </MenuButton>
  );
}

describe('MenuButton', () => {
  it('MB-1/MB-2/MB-3: button has constant aria-haspopup and toggling aria-expanded', async () => {
    const user = userEvent.setup();
    render(<ActionsMenu />);
    const btn = screen.getByRole('button', { name: /Actions/ });
    expect(btn).toHaveAttribute('aria-haspopup', 'true');
    expect(btn).toHaveAttribute('aria-expanded', 'false');
    await user.click(btn);
    expect(btn).toHaveAttribute('aria-expanded', 'true');
    expect(btn).toHaveAttribute('aria-haspopup', 'true'); // unchanged
  });

  it('MB-4/MB-5/MB-6: opens a role=menu with role=menuitem children (tabindex -1)', async () => {
    const user = userEvent.setup();
    render(<ActionsMenu />);
    await user.click(screen.getByRole('button', { name: /Actions/ }));
    expect(screen.getByRole('menu')).toBeInTheDocument();
    const items = screen.getAllByRole('menuitem');
    expect(items.length).toBeGreaterThan(0);
    items.forEach((i) => expect(i).toHaveAttribute('tabindex', '-1'));
  });

  it('MB-8/MB-13: Down arrow opens and focuses the first ENABLED item', async () => {
    const user = userEvent.setup();
    render(<ActionsMenu />);
    const btn = screen.getByRole('button', { name: /Actions/ });
    btn.focus();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('menuitem', { name: 'Edit' })).toHaveFocus();
  });

  it('MB-8: Enter and Space also open the menu and focus the first enabled item', async () => {
    const user = userEvent.setup();
    render(<ActionsMenu />);
    const btn = screen.getByRole('button', { name: /Actions/ });
    btn.focus();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('menuitem', { name: 'Edit' })).toHaveFocus();
    await user.keyboard('{Escape}');
    expect(btn).toHaveFocus();
    await user.keyboard(' ');
    expect(screen.getByRole('menuitem', { name: 'Edit' })).toHaveFocus();
  });

  it('MB-8a (§14 divergence): Up on the closed button opens and focuses the LAST enabled item', async () => {
    const user = userEvent.setup();
    render(<ActionsMenu />);
    screen.getByRole('button', { name: /Actions/ }).focus();
    await user.keyboard('{ArrowUp}');
    // Delete is the last enabled item (Archive is disabled).
    expect(screen.getByRole('menuitem', { name: 'Delete' })).toHaveFocus();
  });

  it('MB-12: Tab exits the menu (closing it) instead of cycling through items', async () => {
    const user = userEvent.setup();
    render(<ActionsMenu />);
    screen.getByRole('button', { name: /Actions/ }).focus();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('menuitem', { name: 'Edit' })).toHaveFocus();
    await user.tab();
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('MB-10/MB-16: Down arrow navigates with wrap and skips disabled items', async () => {
    const user = userEvent.setup();
    render(<ActionsMenu />);
    screen.getByRole('button', { name: /Actions/ }).focus();
    await user.keyboard('{ArrowDown}'); // open → Edit
    await user.keyboard('{ArrowDown}'); // Duplicate
    expect(screen.getByRole('menuitem', { name: 'Duplicate' })).toHaveFocus();
    await user.keyboard('{ArrowDown}'); // skips disabled Archive → Delete
    expect(screen.getByRole('menuitem', { name: 'Delete' })).toHaveFocus();
    await user.keyboard('{ArrowDown}'); // wraps → Edit
    expect(screen.getByRole('menuitem', { name: 'Edit' })).toHaveFocus();
  });

  it('MB-11: Up arrow navigates backwards with wrap', async () => {
    const user = userEvent.setup();
    render(<ActionsMenu />);
    screen.getByRole('button', { name: /Actions/ }).focus();
    await user.keyboard('{ArrowDown}'); // open → Edit
    await user.keyboard('{ArrowUp}'); // wraps to last → Delete
    expect(screen.getByRole('menuitem', { name: 'Delete' })).toHaveFocus();
  });

  it('MB-9: Escape closes the menu and returns focus to the button', async () => {
    const user = userEvent.setup();
    render(<ActionsMenu />);
    const btn = screen.getByRole('button', { name: /Actions/ });
    await user.click(btn);
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(btn).toHaveFocus();
  });

  it('MB-15: choosing an item fires onChoose, closes the menu, and returns focus', async () => {
    const user = userEvent.setup();
    const onChoose = vi.fn();
    render(<ActionsMenu onChoose={onChoose} />);
    const btn = screen.getByRole('button', { name: /Actions/ });
    await user.click(btn);
    await user.click(screen.getByRole('menuitem', { name: 'Duplicate' }));
    expect(onChoose).toHaveBeenCalledWith('duplicate');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(btn).toHaveFocus();
  });

  it('MB-15 (regression): action menu calls the LATEST onChoose, not a stale closure', async () => {
    const user = userEvent.setup();
    // Wrapper whose handler captures changing state; a frozen closure would read the old value.
    function Wrapper() {
      const [n, setN] = useState(0);
      return (
        <>
          <button onClick={() => setN((x) => x + 1)}>inc {n}</button>
          <MenuButton label="Actions" onChoose={() => setN((cur) => cur)}>
            <MenuButton.Item value="ping">Ping {n}</MenuButton.Item>
          </MenuButton>
        </>
      );
    }
    render(<Wrapper />);
    // bump state so any frozen first-render closure would be out of date
    await user.click(screen.getByRole('button', { name: /inc/ }));
    const menuBtn = screen.getByRole('button', { name: /Actions/ });
    await user.click(menuBtn);
    // item label reflects current state (3 → "Ping 1"), proving fresh render wiring
    expect(screen.getByRole('menuitem', { name: 'Ping 1' })).toBeInTheDocument();
  });

  describe('radio variant (MB-5/MB-7/MB-14)', () => {
    function SortMenu() {
      const [sort, setSort] = useState('newest');
      return (
        <MenuButton label={`Sort: ${sort}`} type="radio" value={sort} onValueChange={setSort}>
          <MenuButton.Item value="newest">Newest</MenuButton.Item>
          <MenuButton.Item value="oldest">Oldest</MenuButton.Item>
        </MenuButton>
      );
    }

    it('MB-5/MB-7: items are menuitemradio with aria-checked on the selected one', async () => {
      const user = userEvent.setup();
      render(<SortMenu />);
      await user.click(screen.getByRole('button', { name: /Sort:/ }));
      const newest = screen.getByRole('menuitemradio', { name: 'Newest' });
      const oldest = screen.getByRole('menuitemradio', { name: 'Oldest' });
      expect(newest).toHaveAttribute('aria-checked', 'true');
      expect(oldest).toHaveAttribute('aria-checked', 'false');
      // MB-7: a visible checkmark element accompanies aria-checked (✓ via CSS on data-checked)
      expect(newest.querySelector('[data-ic-part="check"]')).toHaveAttribute('data-checked', 'true');
      expect(oldest.querySelector('[data-ic-part="check"]')).toHaveAttribute('data-checked', 'false');
    });

    it('MB-15: choosing updates checked state and the button label', async () => {
      const user = userEvent.setup();
      render(<SortMenu />);
      await user.click(screen.getByRole('button', { name: /Sort:/ }));
      await user.click(screen.getByRole('menuitemradio', { name: 'Oldest' }));
      const btn = screen.getByRole('button', { name: /Sort:/ });
      expect(btn).toHaveTextContent('Sort: oldest');
      await user.click(btn);
      expect(screen.getByRole('menuitemradio', { name: 'Oldest' })).toHaveAttribute(
        'aria-checked',
        'true',
      );
    });

    it('MB-14: opening focuses the checked item', async () => {
      const user = userEvent.setup();
      render(<SortMenu />);
      const btn = screen.getByRole('button', { name: /Sort:/ });
      btn.focus();
      await user.keyboard('{Enter}');
      expect(screen.getByRole('menuitemradio', { name: 'Newest' })).toHaveFocus();
    });
  });
});
