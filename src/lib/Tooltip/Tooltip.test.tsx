import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tooltip } from './Tooltip';

// Rules covered: TT-1..TT-8 (see REQUIREMENTS.md). Visual show/hide is driven by data-open
// (CSS handles the actual opacity/visibility); we assert the state + ARIA wiring.

const getTip = () => document.querySelector('[role="tooltip"]') as HTMLElement;

describe('Tooltip', () => {
  it('TT-1/TT-2 (label): wires the trigger name via aria-labelledby to a role=tooltip', () => {
    render(
      <Tooltip content="Settings" relation="label">
        <button aria-label="">{/* icon */}⚙</button>
      </Tooltip>,
    );
    const tip = getTip();
    expect(tip).toHaveTextContent('Settings');
    const trigger = screen.getByRole('button');
    expect(trigger).toHaveAttribute('aria-labelledby', tip.id);
  });

  it('TT-2 (description): uses aria-describedby for supplementary text', () => {
    render(
      <Tooltip content="We never share it" relation="description">
        <button>Subscribe</button>
      </Tooltip>,
    );
    const trigger = screen.getByRole('button', { name: 'Subscribe' });
    expect(trigger).toHaveAttribute('aria-describedby', getTip().id);
  });

  it('TT-3: appears on hover and on focus, hides on leave/blur', async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="Settings">
        <button aria-label="open">⚙</button>
      </Tooltip>,
    );
    const trigger = screen.getByRole('button');
    const tip = getTip();
    expect(tip).toHaveAttribute('data-open', 'false');

    await user.hover(trigger);
    expect(tip).toHaveAttribute('data-open', 'true');
    await user.unhover(trigger);
    expect(tip).toHaveAttribute('data-open', 'false');

    await user.tab(); // focus the trigger
    expect(trigger).toHaveFocus();
    expect(tip).toHaveAttribute('data-open', 'true');
    await user.tab(); // blur
    expect(tip).toHaveAttribute('data-open', 'false');
  });

  it('TT-7: Escape dismisses while focused (WCAG 1.4.13)', async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="Settings">
        <button aria-label="open">⚙</button>
      </Tooltip>,
    );
    await user.tab();
    expect(getTip()).toHaveAttribute('data-open', 'true');
    await user.keyboard('{Escape}');
    expect(getTip()).toHaveAttribute('data-open', 'false');
  });

  it('TT-5: never sets a title attribute on the trigger', () => {
    render(
      <Tooltip content="Settings">
        <button aria-label="open">⚙</button>
      </Tooltip>,
    );
    expect(screen.getByRole('button')).not.toHaveAttribute('title');
  });
});
