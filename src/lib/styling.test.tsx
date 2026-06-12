import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToggleButton } from './ToggleButton';
import { Collapsible } from './Collapsible';
import { Tabs } from './Tabs';

// Cross-cutting styling contract (REQUIREMENTS.md §1 + STYLING.md): consumers restyle
// via tokens and data-ic-part/data-ic-state CSS, but CANNOT alter ARIA/role/behavior.
// (Library CSS-Module classes aren't asserted: CSS is disabled in the test env.)

describe('styling: stable CSS hooks', () => {
  it('exposes stable data-ic-part hooks on every part', () => {
    render(
      <ToggleButton variant="switch">
        Wi-Fi
      </ToggleButton>,
    );
    const root = screen.getByRole('switch');
    expect(root).toHaveAttribute('data-ic-part', 'root');
    expect(root.querySelector('[data-ic-part="label"]')).toBeInTheDocument();
    expect(root.querySelector('[data-ic-part="track"]')).toBeInTheDocument();
    expect(root.querySelector('[data-ic-part="thumb"]')).toBeInTheDocument();
  });

  it('reflects state via data-ic-state without consumers needing ARIA', async () => {
    const user = userEvent.setup();
    render(<ToggleButton>Notify</ToggleButton>);
    const btn = screen.getByRole('button');
    expect(btn).toHaveAttribute('data-ic-state', 'off');
    await user.click(btn);
    expect(btn).toHaveAttribute('data-ic-state', 'on');
  });

  it('exposes data-ic-state on compound component parts (Tabs)', () => {
    render(
      <Tabs label="x" defaultValue="a">
        <Tabs.List>
          <Tabs.Tab value="a">A</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="a">content</Tabs.Panel>
      </Tabs>,
    );
    expect(screen.getByRole('tab')).toHaveAttribute('data-ic-state', 'selected');
    expect(screen.getByRole('tabpanel')).toHaveAttribute('data-ic-state', 'selected');
  });
});

describe('styling: locked layer is protected', () => {
  it('a consumer onClick is chained, NOT replaced — the toggle still works', async () => {
    const user = userEvent.setup();
    const spy = vi.fn();
    render(<ToggleButton onClick={spy}>Notify</ToggleButton>);
    const btn = screen.getByRole('button');
    await user.click(btn);
    expect(spy).toHaveBeenCalledTimes(1); // consumer handler ran
    expect(btn).toHaveAttribute('aria-pressed', 'true'); // library behavior also ran
  });

  it('a consumer that force-passes a reserved attr cannot override the library (role)', () => {
    // The TS types forbid this; the cast simulates a JS consumer trying anyway.
    render(
      <ToggleButton {...({ role: 'menuitem' } as Record<string, unknown>)}>Notify</ToggleButton>,
    );
    // Library wins: it's still a button, not a menuitem.
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.queryByRole('menuitem')).not.toBeInTheDocument();
  });
});

describe('cross-cutting (CC)', () => {
  it('CC-8: multiple instances on one page generate unique, non-colliding ids', () => {
    render(
      <>
        {[1, 2].map((n) => (
          <Tabs key={n} label={`Set ${n}`} defaultValue="a">
            <Tabs.List>
              <Tabs.Tab value="a">A</Tabs.Tab>
            </Tabs.List>
            <Tabs.Panel value="a">panel</Tabs.Panel>
          </Tabs>
        ))}
        <Collapsible label="One" defaultOpen>
          x
        </Collapsible>
        <Collapsible label="Two" defaultOpen>
          y
        </Collapsible>
      </>,
    );
    const ids = Array.from(document.querySelectorAll('[id]')).map((el) => el.id);
    expect(ids.length).toBeGreaterThan(0);
    expect(new Set(ids).size).toBe(ids.length); // no duplicates
    // And the ARIA wiring stays per-instance.
    const [one, two] = screen.getAllByRole('button', { name: /One|Two/ });
    expect(one.getAttribute('aria-controls')).not.toBe(two.getAttribute('aria-controls'));
  });

  it('CC-10: focus is never trapped — Tab walks through and out of a component', async () => {
    const user = userEvent.setup();
    render(
      <>
        <Tabs label="t" defaultValue="a">
          <Tabs.List>
            <Tabs.Tab value="a">A</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="a">
            <button type="button">inside</button>
          </Tabs.Panel>
        </Tabs>
        <button type="button">outside</button>
      </>,
    );
    screen.getByRole('tab').focus();
    await user.tab(); // into the panel content
    expect(screen.getByRole('button', { name: 'inside' })).toHaveFocus();
    await user.tab(); // and straight out of the component
    expect(screen.getByRole('button', { name: 'outside' })).toHaveFocus();
  });
});
