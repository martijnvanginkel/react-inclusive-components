import { cloneElement, useId, useState, type ReactElement } from 'react';
import { useEscapeKey } from '../shared/useEscapeKey';
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
 * Hover and focus are tracked independently, so mousing away never hides a tooltip
 * whose trigger is still focused (TT-9). Dismissible with Escape — document-level, so
 * it works for hover-only tooltips too (TT-7, WCAG 1.4.13). Never uses the `title`
 * attribute. The trigger must be a focusable control.
 */
export function Tooltip({ content, relation = 'label', children }: TooltipProps) {
  const id = useId();
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  // Escape suppresses the tooltip until the pointer AND focus have both left (TT-7).
  const [dismissed, setDismissed] = useState(false);
  const slot = makeSlots<TooltipPart>();

  const open = (hovered || focused) && !dismissed;

  // Document-level: a hover-only tooltip (focus elsewhere) must still dismiss (TT-7).
  useEscapeKey(() => setDismissed(true), open);

  const trigger = cloneElement(children, {
    [relation === 'label' ? 'aria-labelledby' : 'aria-describedby']: id,
  });

  return (
    <span
      {...slot('root', styles.wrapper)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        if (!focused) setDismissed(false);
      }}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={() => {
        setFocused(false);
        if (!hovered) setDismissed(false);
      }}
    >
      {trigger}
      <span
        role="tooltip"
        id={id}
        {...slot('tooltip', styles.tooltip, open ? 'open' : 'closed')}
        // Keep it in the DOM (so aria-labelledby always resolves) but hidden when closed.
        aria-hidden={!open}
      >
        {content}
      </span>
    </span>
  );
}
