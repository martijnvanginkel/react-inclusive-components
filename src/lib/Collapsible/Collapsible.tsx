import { forwardRef, useId } from 'react';
import { useControllableState } from '../shared/useControllableState';
import { makeSlots } from '../shared/slots';
import styles from './Collapsible.module.css';

/** Styleable parts (target via `data-ic-part` in CSS). */
type CollapsiblePart = 'root' | 'heading' | 'trigger' | 'icon' | 'content';

export interface CollapsibleProps {
  /** The trigger label. */
  label: React.ReactNode;
  /** Heading level wrapping the trigger button. Default: 2. */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Controlled open state. */
  open?: boolean;
  /** Uncontrolled initial state. Default: false. */
  defaultOpen?: boolean;
  /** Called with the new open state on toggle. */
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

/**
 * A labeled trigger that shows/hides a content region. The trigger is a real
 * `<button>` wrapped in a heading of `headingLevel`; `aria-expanded` lives on the
 * button. When collapsed, content is unmounted so it is removed from the accessibility
 * tree and not focusable.
 */
export const Collapsible = forwardRef<HTMLButtonElement, CollapsibleProps>(
  function Collapsible(
    {
      label,
      headingLevel = 2,
      open,
      defaultOpen = false,
      onOpenChange,
      children,
    },
    ref,
  ) {
    const [isOpen, setOpen] = useControllableState({
      controlled: open,
      defaultValue: defaultOpen,
      onChange: onOpenChange,
    });
    const regionId = useId();
    const Heading = `h${headingLevel}` as const;
    const slot = makeSlots<CollapsiblePart>();
    const state = isOpen ? 'open' : 'closed';

    return (
      <div {...slot('root', styles.root, state)}>
        <Heading {...slot('heading', styles.heading)}>
          <button
            ref={ref}
            type="button"
            {...slot('trigger', styles.trigger, state)}
            aria-expanded={isOpen}
            // Only reference the region while it exists in the DOM, so the IDREF never dangles.
            aria-controls={isOpen ? regionId : undefined}
            onClick={() => setOpen(!isOpen)}
          >
            <span>{label}</span>
            <svg
              {...slot('icon', styles.icon)}
              viewBox="0 0 16 16"
              width="16"
              height="16"
              aria-hidden="true"
              focusable="false"
            >
              {/* horizontal bar always shown; vertical bar hidden when open → +/− */}
              <rect x="1" y="7" width="14" height="2" rx="1" />
              {!isOpen && <rect x="7" y="1" width="2" height="14" rx="1" />}
            </svg>
          </button>
        </Heading>
        {isOpen && (
          <div id={regionId} {...slot('content', styles.content)}>
            {children}
          </div>
        )}
      </div>
    );
  },
);
