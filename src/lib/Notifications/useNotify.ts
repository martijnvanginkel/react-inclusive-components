import { useContext } from 'react';
import { NotificationContext, type NotifyFn } from './context';

/**
 * Returns the `notify(message, { type })` function from the nearest
 * `<NotificationProvider>`. Messages are announced via a polite live region —
 * focus never moves.
 */
export function useNotify(): NotifyFn {
  const notify = useContext(NotificationContext);
  if (!notify) throw new Error('useNotify must be used inside <NotificationProvider>');
  return notify;
}
