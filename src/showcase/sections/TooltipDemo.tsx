import { Tooltip } from '../../lib';

export function TooltipDemo() {
  return (
    <>
      <p className="note">
        Appears on hover <em>and</em> focus, with <code>role="tooltip"</code>. Dismiss with
        Escape. Here it labels an icon-only button via <code>aria-labelledby</code>.
      </p>

      <Tooltip content="Help" relation="label">
        <button className="iconBtn" type="button">
          <span aria-hidden="true">?</span>
        </button>
      </Tooltip>
    </>
  );
}
