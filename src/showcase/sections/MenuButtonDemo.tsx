import { useState } from 'react';
import { MenuButton } from '../../lib';

export function MenuButtonDemo() {
  const [sort, setSort] = useState('newest');
  const [lastAction, setLastAction] = useState<string | null>(null);

  return (
    <>
      <p className="note">
        <code>aria-haspopup</code> + <code>aria-expanded</code> on the button;{' '}
        <code>role="menu"</code> with <code>menuitem</code> / <code>menuitemradio</code> items.
        Enter/Space/Down opens, arrows navigate (wrapping), Escape closes and returns focus.
      </p>

      <div className="row">
        {/* Actions menu */}
        <MenuButton label="Actions" onChoose={setLastAction}>
          <MenuButton.Item value="edit">Edit</MenuButton.Item>
          <MenuButton.Item value="duplicate">Duplicate</MenuButton.Item>
          <MenuButton.Item value="archive" disabled>
            Archive (disabled)
          </MenuButton.Item>
          <MenuButton.Item value="delete">Delete</MenuButton.Item>
        </MenuButton>

        {/* Radio menu — mutually exclusive choice with a checkmark + aria-checked */}
        <MenuButton label={`Sort: ${sort}`} type="radio" value={sort} onValueChange={setSort}>
          <MenuButton.Item value="newest">Newest first</MenuButton.Item>
          <MenuButton.Item value="oldest">Oldest first</MenuButton.Item>
          <MenuButton.Item value="popular">Most popular</MenuButton.Item>
        </MenuButton>
      </div>

      <p className="status" aria-live="polite">
        {lastAction ? (
          <>
            You picked: <strong>{lastAction}</strong>
          </>
        ) : (
          'No action picked yet — open “Actions” and choose one.'
        )}
      </p>

      <p className="note">
        An actions menu doesn’t keep a selection, so the button label stays “Actions” — the line
        above is the feedback. The “Sort” menu <em>is</em> a choice, so it shows a checkmark on the
        selected item and updates its own label.
      </p>
    </>
  );
}
