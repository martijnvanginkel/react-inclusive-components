import { useEffect, useRef, useState } from 'react';
import { useEscapeKey } from '../shared/useEscapeKey';
import { useOnClickOutside } from '../shared/useOnClickOutside';
import { makeSlots } from '../shared/slots';
import styles from './Toggletip.module.css';

/** Styleable parts (target via `data-ic-part` in CSS). */
type ToggletipPart = 'root' | 'trigger' | 'bubble';

export interface ToggletipProps {
  /** The supplementary info revealed on click. */
  content: React.ReactNode;
  /** Accessible name for the trigger button. Default: "more information". */
  label?: string;
  /** Visible trigger content (e.g. an "i" glyph). Default: "i". */
  children?: React.ReactNode;
}

/**
 * A button that reveals supplementary info on click. The content is announced via a
 * live region (`role="status"`) — populated after a short delay so screen readers
 * reliably detect the change. Dismissed with Escape or an outside click. Never uses
 * `aria-describedby` (that would be a tooltip, not a toggletip).
 */
export function Toggletip({ content, label = 'more information', children = 'i' }: ToggletipProps) {
  const [open, setOpen] = useState(false);
  // Mirror of `content` placed into the live region, with a delay so the DOM mutation
  // is detected as an addition and announced.
  const [liveContent, setLiveContent] = useState<React.ReactNode>(null);
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const slot = makeSlots<ToggletipPart>();

  // Clear any pending announcement timer on unmount.
  useEffect(() => () => clearTimeout(timerRef.current), []);

  const close = () => {
    clearTimeout(timerRef.current);
    setOpen(false);
    setLiveContent(null);
  };

  const toggle = () => {
    if (open) {
      close();
      return;
    }
    // Open, then populate the live region after a short delay so screen readers
    // detect the addition and announce it.
    clearTimeout(timerRef.current);
    setOpen(true);
    setLiveContent(null);
    timerRef.current = setTimeout(() => setLiveContent(content), 100);
  };

  useEscapeKey(close, open);
  useOnClickOutside(wrapperRef, close, open);

  const state = open ? 'open' : 'closed';
  // The bubble only becomes visible once the (SR-delayed) content is in place, so the
  // chrome (background + arrow) and the text appear together rather than arrow-first.
  const visible = open && liveContent !== null;

  return (
    <span ref={wrapperRef} {...slot('root', styles.wrapper)}>
      <button
        type="button"
        {...slot('trigger', styles.trigger, state)}
        aria-label={label}
        aria-expanded={open}
        onClick={toggle}
      >
        {children}
      </button>
      <span
        role="status"
        {...slot('bubble', styles.bubble, visible ? 'open' : 'closed')}
        data-open={visible}
      >
        {open ? liveContent : null}
      </span>
    </span>
  );
}
