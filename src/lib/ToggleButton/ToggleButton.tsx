import { forwardRef } from 'react';
import { useControllableState } from '../shared/useControllableState';
import { mergeProps, stripReserved } from '../shared/props';
import { makeSlots } from '../shared/slots';
import { cx } from '../shared/cx';
import styles from './ToggleButton.module.css';

/** Styleable parts (target via `data-ic-part` in CSS). */
type ToggleButtonPart = 'root' | 'label' | 'track' | 'thumb';

export interface ToggleButtonProps
  extends Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    // Reserved: these are managed by the component and cannot be overridden. Labelling
    // attributes (aria-label/aria-labelledby/aria-describedby) intentionally stay open.
    | 'onChange'
    | 'type'
    | 'role'
    | 'tabIndex'
    | 'aria-hidden'
    | 'aria-pressed'
    | 'aria-checked'
    | 'className'
    | 'style'
  > {
  /** "switch" uses role=switch + aria-checked; "button" uses aria-pressed. Default: "button". */
  variant?: 'button' | 'switch';
  /** Controlled pressed/checked state. */
  pressed?: boolean;
  /** Uncontrolled initial state. Default: false. */
  defaultPressed?: boolean;
  /** Called with the new boolean state on activation. */
  onPressedChange?: (pressed: boolean) => void;
  /** Visible label content. Keep this stable — never change label and state together. */
  children: React.ReactNode;
}

/**
 * A two-state control. As a `button` it exposes state via `aria-pressed`; as a
 * `switch` it uses `role="switch"` + `aria-checked`. Activates on Space/Enter.
 * Supports controlled (`pressed`) and uncontrolled (`defaultPressed`) usage.
 */
export const ToggleButton = forwardRef<HTMLButtonElement, ToggleButtonProps>(
  function ToggleButton(
    {
      variant = 'button',
      pressed,
      defaultPressed = false,
      onPressedChange,
      children,
      ...rest
    },
    ref,
  ) {
    const [isPressed, setPressed] = useControllableState({
      controlled: pressed,
      defaultValue: defaultPressed,
      onChange: onPressedChange,
    });
    const isSwitch = variant === 'switch';
    const slot = makeSlots<ToggleButtonPart>();

    // a11y-critical + behavioral props. mergeProps lets a consumer's handlers (in `rest`)
    // chain with these without replacing role/aria/type or the toggle handler;
    // stripReserved keeps a cast from smuggling reserved attributes past the types.
    const libProps = {
      type: 'button' as const,
      ...slot('root', cx(styles.toggle, isSwitch && styles.switch), isPressed ? 'on' : 'off'),
      'aria-pressed': isSwitch ? undefined : isPressed,
      role: isSwitch ? 'switch' : undefined,
      'aria-checked': isSwitch ? isPressed : undefined,
      onClick: () => setPressed(!isPressed),
    };

    return (
      <button ref={ref} {...mergeProps(libProps, stripReserved(rest))}>
        {isSwitch ? (
          <>
            <span {...slot('label', styles.label)}>{children}</span>
            <span {...slot('track', styles.track)} aria-hidden="true">
              <span {...slot('thumb', styles.thumb)} />
            </span>
          </>
        ) : (
          children
        )}
      </button>
    );
  },
);
