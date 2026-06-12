import { createContext } from 'react';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface NotifyOptions {
  /** Message type, announced textually as a prefix ("Error:", …). Default: "info". */
  type?: NotificationType;
}

export type NotifyFn = (message: string, options?: NotifyOptions) => void;

export const NotificationContext = createContext<NotifyFn | null>(null);
