import { cloneElement, useId, useRef, useState, type ReactElement } from 'react';
import { makeSlots } from '../shared/slots';
import styles from './Tooltip.module.css';

/** Styleable parts (target via `data-ic-part` in CSS). */
type TooltipPart = 'root' | 'tooltip';

export interface TooltipProps {
  /** The tooltip text. */
  content: string;
  /**
   * How the tooltip relates to its trigger:
   * - "label" → wired via aria-labelledby (becomes the control's accessible name)
   * - "description" → wired via aria-describedby (supplementary)
   * Default: "label".
   */
  relation?: 'label' | 'description';
  /** The trigger. Must be a single focusable element (usually a <button>). */
  children: ReactElement<{
    'aria-labelledby'?: string;
    'aria-describedby'?: string;
  }>;
}

/**
 * A label/description shown on hover AND focus of its trigger, with `role="tooltip"`.
 * Dismissible with Escape (WCAG 1.4.13). Never uses the `title` attribute. The trigger
 * must be a focusable control.
 */
export function Tooltip({ content, relation = 'label', children }: TooltipProps) {
  const id = useId();
  const [visible, setVisible] = useState(false);
  // Escape suppresses the tooltip until the pointer/focus leaves and returns.
  const [dismissed, setDismissed] = useState(false);
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const slot = makeSlots<TooltipPart>();

  const show = () => setVisible(true);
  const hide = () => {
    setVisible(false);
    setDismissed(false);
  };

  const trigger = cloneElement(children, {
    [relation === 'label' ? 'aria-labelledby' : 'aria-describedby']: id,
  });

  const open = visible && !dismissed;

  return (
    <span
      ref={wrapperRef}
      {...slot('root', styles.wrapper)}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocusCapture={show}
      onBlurCapture={hide}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && visible) setDismissed(true);
      }}
    >
      {trigger}
      <span
        role="tooltip"
        id={id}
        {...slot('tooltip', styles.tooltip, open ? 'open' : 'closed')}
        // Keep it in the DOM (so aria-labelledby always resolves) but hidden when closed.
        data-open={open}
        aria-hidden={!open}
      >
        {content}
      </span>
    </span>
  );
}
