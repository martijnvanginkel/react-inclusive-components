import { Toggletip } from '../../lib';

export function ToggletipDemo() {
  return (
    <>
      <p className="note">
        Click to reveal info into a <code>role="status"</code> live region (announced after a
        short delay). Dismiss with Escape or an outside click.
      </p>

      <p className="row" style={{ alignItems: 'center' }}>
        <span>Annual rate</span>{' '}
        <Toggletip
          label="What is the annual rate?"
          content="The annual rate is the yearly interest charged on your balance, including fees."
        />
      </p>
    </>
  );
}
