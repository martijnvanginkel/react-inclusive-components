import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NotificationProvider } from './NotificationProvider';
import { useNotify } from './useNotify';

// Rules covered: NT-1..NT-7 (see REQUIREMENTS.md §12). NT-8..NT-10 are app-level guidance
// (context restriction, user settings, discoverability) — not testable at component level.

function Trigger({ message = 'Saved.', type }: { message?: string; type?: 'error' | 'info' }) {
  const notify = useNotify();
  return (
    <button type="button" onClick={() => notify(message, type ? { type } : undefined)}>
      trigger
    </button>
  );
}

const getRegion = () => document.querySelector('[aria-relevant]') as HTMLElement;

describe('Notifications', () => {
  it('NT-1/NT-3: the live region has role=status, aria-live=polite AND aria-relevant=additions', () => {
    render(
      <NotificationProvider>
        <p>app</p>
      </NotificationProvider>,
    );
    const region = getRegion();
    expect(region).toHaveAttribute('role', 'status');
    expect(region).toHaveAttribute('aria-live', 'polite');
    expect(region).toHaveAttribute('aria-relevant', 'additions');
  });

  it('NT-4: the region does not use aria-atomic (only additions should announce)', () => {
    render(
      <NotificationProvider>
        <p>app</p>
      </NotificationProvider>,
    );
    expect(getRegion()).not.toHaveAttribute('aria-atomic');
  });

  it('NT-2: notifying does NOT move focus', async () => {
    const user = userEvent.setup();
    render(
      <NotificationProvider>
        <Trigger />
      </NotificationProvider>,
    );
    const btn = screen.getByRole('button', { name: 'trigger' });
    await user.click(btn);
    expect(screen.getByText('Saved.')).toBeInTheDocument();
    expect(btn).toHaveFocus();
  });

  it('NT-5: the message type is announced textually as a prefix', async () => {
    const user = userEvent.setup();
    render(
      <NotificationProvider>
        <Trigger message="Could not save." type="error" />
      </NotificationProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'trigger' }));
    const item = screen.getByText('Could not save.', { exact: false }).closest('li')!;
    expect(item).toHaveTextContent('Error: Could not save.');
  });

  it('NT-6: notifications auto-dismiss after the duration', () => {
    vi.useFakeTimers();
    try {
      render(
        <NotificationProvider duration={3000}>
          <Trigger />
        </NotificationProvider>,
      );
      // fireEvent (sync) instead of user-event: fake timers deadlock user-event's delays.
      fireEvent.click(screen.getByRole('button', { name: 'trigger' }));
      expect(screen.getByText('Saved.')).toBeInTheDocument();
      act(() => {
        vi.advanceTimersByTime(3001);
      });
      expect(screen.queryByText('Saved.')).not.toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it('NT-7: the region is disabled while the tab is hidden and restored when visible', () => {
    render(
      <NotificationProvider>
        <p>app</p>
      </NotificationProvider>,
    );
    const hidden = vi.spyOn(document, 'hidden', 'get');
    try {
      hidden.mockReturnValue(true);
      act(() => {
        document.dispatchEvent(new Event('visibilitychange'));
      });
      const region = getRegion();
      expect(region).toHaveAttribute('role', 'none');
      expect(region).toHaveAttribute('aria-live', 'off');

      hidden.mockReturnValue(false);
      act(() => {
        document.dispatchEvent(new Event('visibilitychange'));
      });
      expect(region).toHaveAttribute('role', 'status');
      expect(region).toHaveAttribute('aria-live', 'polite');
    } finally {
      hidden.mockRestore();
    }
  });

  it('useNotify throws outside a provider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Trigger />)).toThrow(/inside <NotificationProvider>/);
    spy.mockRestore();
  });
});
