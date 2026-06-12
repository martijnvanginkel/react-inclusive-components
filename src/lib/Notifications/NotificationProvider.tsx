import { useCallback, useEffect, useRef, useState } from 'react';
import { NotificationContext, type NotificationType, type NotifyOptions } from './context';
import { makeSlots } from '../shared/slots';
import styles from './Notifications.module.css';

interface NotificationItem {
  id: number;
  type: NotificationType;
  message: string;
}

/** Styleable parts (target via `data-ic-part` in CSS). */
type NotificationsPart = 'region' | 'list' | 'item' | 'prefix';

export interface NotificationProviderProps {
  children: React.ReactNode;
  /** How long a notification stays visible, in ms. Default: 6000. */
  duration?: number;
}

const TYPE_LABELS: Record<NotificationType, string> = {
  info: 'Info',
  success: 'Success',
  warning: 'Warning',
  error: 'Error',
};

/**
 * Renders children plus a polite live region (`role="status"` + `aria-live="polite"` +
 * `aria-relevant="additions"`). Notifications announce without moving focus, carry a
 * textual type prefix (never style alone), auto-dismiss, and the region is disabled via
 * the Page Visibility API while the tab is hidden.
 */
export function NotificationProvider({ children, duration = 6000 }: NotificationProviderProps) {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [pageHidden, setPageHidden] = useState(false);
  const idRef = useRef(0);
  const timersRef = useRef(new Set<ReturnType<typeof setTimeout>>());
  const slot = makeSlots<NotificationsPart>();

  const notify = useCallback(
    (message: string, options?: NotifyOptions) => {
      const id = idRef.current++;
      setItems((prev) => [...prev, { id, type: options?.type ?? 'info', message }]);
      // Auto-dismiss instead of requiring a close button (NT-6).
      const timer = setTimeout(() => {
        timersRef.current.delete(timer);
        setItems((prev) => prev.filter((n) => n.id !== id));
      }, duration);
      timersRef.current.add(timer);
    },
    [duration],
  );

  // Disable the live region while the tab is hidden (NT-7).
  useEffect(() => {
    const onVisibility = () => setPageHidden(document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  // Clear pending dismiss timers on unmount.
  useEffect(() => {
    const timers = timersRef.current;
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <NotificationContext.Provider value={notify}>
      {children}
      <div
        role={pageHidden ? 'none' : 'status'}
        aria-live={pageHidden ? 'off' : 'polite'}
        aria-relevant="additions"
        {...slot('region', styles.region)}
      >
        <ul {...slot('list', styles.list)}>
          {items.map((n) => (
            <li key={n.id} {...slot('item', styles.item, n.type)}>
              <strong {...slot('prefix', styles.prefix)}>{TYPE_LABELS[n.type]}:</strong>{' '}
              {n.message}
            </li>
          ))}
        </ul>
      </div>
    </NotificationContext.Provider>
  );
}
