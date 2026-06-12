import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Toggletip } from './Toggletip';

// Rules covered: TG-1..TG-8 (see REQUIREMENTS.md).

describe('Toggletip', () => {
  it('TG-1/TG-7: the trigger is a button named by aria-label, with no aria-describedby', () => {
    render(<Toggletip label="What is APR?" content="Annual rate." />);
    const btn = screen.getByRole('button', { name: 'What is APR?' });
    expect(btn).toBeInTheDocument();
    expect(btn).not.toHaveAttribute('aria-describedby');
  });

  it('TG-2/TG-4: clicking announces the content via a role=status live region', async () => {
    const user = userEvent.setup();
    render(<Toggletip label="info" content="Annual rate explained." />);
    const status = screen.getByRole('status');
    expect(status).toBeEmptyDOMElement();
    await user.click(screen.getByRole('button', { name: 'info' }));
    // Content is injected after a short delay so screen readers detect the change.
    expect(await screen.findByText('Annual rate explained.')).toBeInTheDocument();
    expect(status).toHaveTextContent('Annual rate explained.');
  });

  it('TG-3: does NOT open on hover or focus (click only)', async () => {
    const user = userEvent.setup();
    render(<Toggletip label="info" content="Should stay hidden." />);
    const btn = screen.getByRole('button', { name: 'info' });
    await user.hover(btn);
    await user.tab();
    expect(btn).toHaveFocus();
    expect(screen.queryByText('Should stay hidden.')).not.toBeInTheDocument();
  });

  it('TG-5: on reopen the live region is cleared, then repopulated after a delay', () => {
    vi.useFakeTimers();
    try {
      // fireEvent (sync) instead of user-event: fake timers deadlock user-event's delays.
      render(<Toggletip label="info" content="Same content." />);
      const btn = screen.getByRole('button', { name: 'info' });
      const status = screen.getByRole('status');

      fireEvent.click(btn);
      act(() => {
        vi.advanceTimersByTime(100);
      });
      expect(status).toHaveTextContent('Same content.');

      fireEvent.click(btn); // close
      expect(status).toBeEmptyDOMElement();

      fireEvent.click(btn); // reopen: cleared first…
      expect(status).toBeEmptyDOMElement();
      act(() => {
        vi.advanceTimersByTime(100);
      });
      // …then repopulated, so identical content is announced again
      expect(status).toHaveTextContent('Same content.');
    } finally {
      vi.useRealTimers();
    }
  });

  it('TG-6: Escape dismisses', async () => {
    const user = userEvent.setup();
    render(<Toggletip label="info" content="Dismiss me." />);
    const btn = screen.getByRole('button', { name: 'info' });
    await user.click(btn);
    expect(await screen.findByText('Dismiss me.')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByText('Dismiss me.')).not.toBeInTheDocument();
    expect(btn).toHaveAttribute('aria-expanded', 'false');
  });

  it('TG-6: an outside click dismisses', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <Toggletip label="info" content="Close on outside click." />
        <button>elsewhere</button>
      </div>,
    );
    await user.click(screen.getByRole('button', { name: 'info' }));
    expect(await screen.findByText('Close on outside click.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'elsewhere' }));
    expect(screen.queryByText('Close on outside click.')).not.toBeInTheDocument();
  });
});
