import { ToggleButton } from '../../lib';

export function ToggleButtonDemo() {
  return (
    <>
      <p className="note">
        A two-state control. As a <code>button</code> it exposes state via{' '}
        <code>aria-pressed</code>; as a <code>switch</code> it uses <code>role="switch"</code> +{' '}
        <code>aria-checked</code>. State is conveyed visually and via ARIA.
      </p>

      <div className="row">
        <ToggleButton defaultPressed>Notify by email</ToggleButton>
        <ToggleButton variant="switch" defaultPressed>
          Wi-Fi
        </ToggleButton>
      </div>
    </>
  );
}
