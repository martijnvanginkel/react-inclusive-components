import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { ToggleButton } from './ToggleButton';

// Rules covered: TB-1..TB-9 (see REQUIREMENTS.md). CSS-only rules (TB-8 non-color cue,
// CC-3 focus ring, CC-9 reduced-motion) are not unit-testable in jsdom and are verified manually.

describe('ToggleButton', () => {
  it('TB-1: renders a <button type="button">', () => {
    render(<ToggleButton>Notify</ToggleButton>);
    const btn = screen.getByRole('button', { name: 'Notify' });
    expect(btn).toHaveAttribute('type', 'button');
  });

  it('TB-2/CC-5: button variant exposes explicit aria-pressed, toggling true/false', async () => {
    const user = userEvent.setup();
    render(<ToggleButton>Notify</ToggleButton>);
    const btn = screen.getByRole('button', { name: 'Notify' });
    expect(btn).toHaveAttribute('aria-pressed', 'false');
    await user.click(btn);
    expect(btn).toHaveAttribute('aria-pressed', 'true');
    await user.click(btn);
    expect(btn).toHaveAttribute('aria-pressed', 'false');
  });

  it('TB-3: switch variant uses role=switch + aria-checked and NOT aria-pressed', async () => {
    const user = userEvent.setup();
    render(
      <ToggleButton variant="switch">
        Wi-Fi
      </ToggleButton>,
    );
    const sw = screen.getByRole('switch', { name: 'Wi-Fi' });
    expect(sw).toHaveAttribute('aria-checked', 'false');
    expect(sw).not.toHaveAttribute('aria-pressed');
    await user.click(sw);
    expect(sw).toHaveAttribute('aria-checked', 'true');
  });

  it('TB-4: activates on Space and Enter (native button keys)', async () => {
    const user = userEvent.setup();
    render(<ToggleButton>Notify</ToggleButton>);
    const btn = screen.getByRole('button', { name: 'Notify' });
    btn.focus();
    await user.keyboard('{Enter}');
    expect(btn).toHaveAttribute('aria-pressed', 'true');
    await user.keyboard(' ');
    expect(btn).toHaveAttribute('aria-pressed', 'false');
  });

  it('TB-9: uncontrolled respects defaultPressed', () => {
    render(<ToggleButton defaultPressed>Notify</ToggleButton>);
    expect(screen.getByRole('button', { name: 'Notify' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('TB-9: controlled reflects the pressed prop and calls onPressedChange (no self-update)', async () => {
    const user = userEvent.setup();
    const onPressedChange = vi.fn();
    const { rerender } = render(
      <ToggleButton pressed={false} onPressedChange={onPressedChange}>
        Notify
      </ToggleButton>,
    );
    const btn = screen.getByRole('button', { name: 'Notify' });
    await user.click(btn);
    // Controlled: stays false until the parent updates the prop.
    expect(onPressedChange).toHaveBeenCalledWith(true);
    expect(btn).toHaveAttribute('aria-pressed', 'false');
    rerender(
      <ToggleButton pressed={true} onPressedChange={onPressedChange}>
        Notify
      </ToggleButton>,
    );
    expect(btn).toHaveAttribute('aria-pressed', 'true');
  });

  it('TB-7: a controlled wrapper updates state immediately on click', async () => {
    const user = userEvent.setup();
    function Wrapper() {
      const [on, setOn] = useState(false);
      return (
        <ToggleButton pressed={on} onPressedChange={setOn}>
          Notify
        </ToggleButton>
      );
    }
    render(<Wrapper />);
    const btn = screen.getByRole('button', { name: 'Notify' });
    await user.click(btn);
    expect(btn).toHaveAttribute('aria-pressed', 'true');
  });
});
