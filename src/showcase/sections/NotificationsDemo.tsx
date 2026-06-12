import { NotificationProvider, useNotify } from '../../lib';

function Buttons() {
  const notify = useNotify();
  return (
    <div className="row">
      <button className="plainBtn" type="button" onClick={() => notify('Your changes were saved.')}>
        Notify info
      </button>
      <button
        className="plainBtn"
        type="button"
        onClick={() => notify('Profile updated successfully.', { type: 'success' })}
      >
        Notify success
      </button>
      <button
        className="plainBtn"
        type="button"
        onClick={() => notify('Could not reach the server.', { type: 'error' })}
      >
        Notify error
      </button>
    </div>
  );
}

export function NotificationsDemo() {
  return (
    <>
      <p className="note">
        A polite live region (<code>role="status"</code> + <code>aria-live="polite"</code> +{' '}
        <code>aria-relevant="additions"</code>). Notifications announce without stealing focus,
        carry a textual type prefix (“Error:”, never color alone), auto-dismiss after a few
        seconds, and the region switches off while the tab is hidden.
      </p>

      <NotificationProvider>
        <Buttons />
      </NotificationProvider>
    </>
  );
}
