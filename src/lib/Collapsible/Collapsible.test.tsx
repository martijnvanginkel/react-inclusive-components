import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Collapsible } from './Collapsible';

// Rules covered: CO-1..CO-9 (see REQUIREMENTS.md).

describe('Collapsible', () => {
  it('CO-1/CO-5: the control is a <button> wrapped in a heading of the given level', () => {
    render(
      <Collapsible label="Shipping" headingLevel={3}>
        content
      </Collapsible>,
    );
    const heading = screen.getByRole('heading', { level: 3 });
    const btn = screen.getByRole('button', { name: 'Shipping' });
    expect(btn).toHaveAttribute('type', 'button');
    expect(heading).toContainElement(btn);
  });

  it('CO-2: aria-expanded lives on the button and toggles', async () => {
    const user = userEvent.setup();
    render(<Collapsible label="Shipping">content</Collapsible>);
    const btn = screen.getByRole('button', { name: 'Shipping' });
    expect(btn).toHaveAttribute('aria-expanded', 'false');
    await user.click(btn);
    expect(btn).toHaveAttribute('aria-expanded', 'true');
    await user.click(btn);
    expect(btn).toHaveAttribute('aria-expanded', 'false');
  });

  it('CO-4: collapsed content is absent from the DOM; expanded content appears', async () => {
    const user = userEvent.setup();
    render(<Collapsible label="Shipping">Ships in 2 days</Collapsible>);
    expect(screen.queryByText('Ships in 2 days')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Shipping' }));
    expect(screen.getByText('Ships in 2 days')).toBeInTheDocument();
  });

  it('CO-6: aria-controls is only present while the region exists (no dangling IDREF)', async () => {
    const user = userEvent.setup();
    render(<Collapsible label="Shipping">content</Collapsible>);
    const btn = screen.getByRole('button', { name: 'Shipping' });
    // Collapsed: no dangling reference.
    expect(btn).not.toHaveAttribute('aria-controls');
    await user.click(btn);
    const id = btn.getAttribute('aria-controls');
    expect(id).toBeTruthy();
    expect(document.getElementById(id!)).toBeInTheDocument();
  });

  it('CO-3: aria-expanded is never placed on the content region', async () => {
    const user = userEvent.setup();
    render(<Collapsible label="Shipping">Ships in 2 days</Collapsible>);
    await user.click(screen.getByRole('button', { name: 'Shipping' }));
    expect(screen.getByText('Ships in 2 days')).not.toHaveAttribute('aria-expanded');
  });

  it('CO-7: the trigger does not have aria-haspopup (it is not a menu/popup)', () => {
    render(<Collapsible label="Shipping">content</Collapsible>);
    expect(screen.getByRole('button', { name: 'Shipping' })).not.toHaveAttribute('aria-haspopup');
  });

  it('CO-8: the decorative icon flips between + (collapsed) and − (expanded)', async () => {
    const user = userEvent.setup();
    render(<Collapsible label="Shipping">content</Collapsible>);
    const icon = document.querySelector('[data-ic-part="icon"]')!;
    expect(icon).toHaveAttribute('aria-hidden', 'true');
    expect(icon.querySelectorAll('rect')).toHaveLength(2); // + : horizontal and vertical bars
    await user.click(screen.getByRole('button', { name: 'Shipping' }));
    expect(icon.querySelectorAll('rect')).toHaveLength(1); // − : horizontal bar only
  });

  it('CO-9: activates via the keyboard (Enter and Space)', async () => {
    const user = userEvent.setup();
    render(<Collapsible label="Shipping">content</Collapsible>);
    const btn = screen.getByRole('button', { name: 'Shipping' });
    btn.focus();
    await user.keyboard('{Enter}');
    expect(btn).toHaveAttribute('aria-expanded', 'true');
    await user.keyboard(' ');
    expect(btn).toHaveAttribute('aria-expanded', 'false');
  });

  it('supports controlled open state', () => {
    const { rerender } = render(
      <Collapsible label="Shipping" open={false}>
        content
      </Collapsible>,
    );
    expect(screen.getByRole('button', { name: 'Shipping' })).toHaveAttribute('aria-expanded', 'false');
    rerender(
      <Collapsible label="Shipping" open={true}>
        content
      </Collapsible>,
    );
    expect(screen.getByRole('button', { name: 'Shipping' })).toHaveAttribute('aria-expanded', 'true');
  });
});
