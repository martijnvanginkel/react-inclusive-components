import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Card,
  CardGrid,
  Collapsible,
  ContentSlider,
  DataTable,
  MenuButton,
  NotificationProvider,
  Tabs,
  TodoList,
  ToggleButton,
  Toggletip,
  Tooltip,
  useNotify,
} from './index';

// Cross-cutting styling contract (REQUIREMENTS.md §1 + STYLING.md): consumers restyle
// via tokens and data-ic-part/data-ic-state CSS, but CANNOT alter ARIA/role/behavior.
// (Library CSS-Module classes aren't asserted: CSS is disabled in the test env.)

function NotifyButton() {
  const notify = useNotify();
  return (
    <button type="button" onClick={() => notify('saved', { type: 'success' })}>
      notify
    </button>
  );
}

type User = ReturnType<typeof userEvent.setup>;

// One minimal render per component; the part lists mirror STYLING.md's reference table
// so a part can't silently disappear (or ship undocumented) without a test failing.
// ContentSlider's `controls`/`controlButton` are excluded: they require
// IntersectionObserver, which jsdom doesn't implement (CS-7 fallback hides them).
const partFixtures: Array<{
  name: string;
  parts: string[];
  ui: React.ReactElement;
  setup?: (user: User) => Promise<void>;
}> = [
  {
    name: 'ToggleButton (switch)',
    parts: ['root', 'label', 'track', 'thumb'],
    ui: <ToggleButton variant="switch">Wi-Fi</ToggleButton>,
  },
  {
    name: 'Collapsible',
    parts: ['root', 'heading', 'trigger', 'icon', 'content'],
    ui: (
      <Collapsible label="More" defaultOpen>
        body
      </Collapsible>
    ),
  },
  {
    name: 'Tabs',
    parts: ['root', 'list', 'tab', 'panel'],
    ui: (
      <Tabs label="t" defaultValue="a">
        <Tabs.List>
          <Tabs.Tab value="a">A</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="a">content</Tabs.Panel>
      </Tabs>
    ),
  },
  {
    name: 'Tooltip',
    parts: ['root', 'tooltip'],
    ui: (
      <Tooltip content="hint">
        <button aria-label="open">i</button>
      </Tooltip>
    ),
  },
  {
    name: 'Toggletip',
    parts: ['root', 'trigger', 'bubble'],
    ui: <Toggletip label="info" content="more" />,
  },
  {
    name: 'MenuButton (radio, open)',
    parts: ['root', 'trigger', 'caret', 'menu', 'item', 'check'],
    ui: (
      <MenuButton label="Sort" type="radio" defaultValue="a">
        <MenuButton.Item value="a">A</MenuButton.Item>
      </MenuButton>
    ),
    setup: async (user) => {
      await user.click(screen.getByRole('button', { name: /Sort/ }));
    },
  },
  {
    name: 'Card (all props) in CardGrid',
    parts: [
      'grid',
      'root',
      'media',
      'img',
      'body',
      'title',
      'titleLink',
      'description',
      'cta',
      'secondary',
      'secondaryLink',
    ],
    ui: (
      <CardGrid>
        <Card
          title="Post"
          href="/post"
          description="desc"
          image={{ src: '/x.jpg', alt: '' }}
          cta="Read more"
          secondary={{ label: 'By Ada', href: '/ada' }}
        />
      </CardGrid>
    ),
  },
  {
    name: 'TodoList (with items)',
    parts: [
      'root',
      'heading',
      'form',
      'input',
      'addButton',
      'list',
      'item',
      'checkbox',
      'itemLabel',
      'deleteButton',
      'liveRegion',
    ],
    ui: <TodoList defaultItems={['Milk']} />,
  },
  {
    name: 'TodoList (empty)',
    parts: ['root', 'emptyState'],
    ui: <TodoList />,
  },
  {
    name: 'ContentSlider',
    parts: [
      'root',
      'scroller',
      'list',
      'slide',
      'figure',
      'image',
      'caption',
      'instructions',
      'instruction',
    ],
    ui: <ContentSlider label="gallery" slides={[{ src: '/a.jpg', alt: '', caption: 'cap' }]} />,
  },
  {
    name: 'DataTable (sortable, rowHeaders)',
    parts: [
      'root',
      'scroller',
      'table',
      'caption',
      'hint',
      'head',
      'body',
      'row',
      'headerCell',
      'sortButton',
      'sortIcon',
      'rowHeader',
      'cell',
      'stack',
      'stackGroup',
      'stackHeading',
      'stackList',
      'stackTerm',
      'stackValue',
    ],
    ui: (
      <DataTable
        caption="Scores"
        headers={['Name', 'Score']}
        rows={[['a', 1]]}
        rowHeaders
        sortable
      />
    ),
  },
  {
    name: 'Notifications',
    parts: ['region', 'list', 'item', 'prefix'],
    ui: (
      <NotificationProvider>
        <NotifyButton />
      </NotificationProvider>
    ),
    setup: async (user) => {
      await user.click(screen.getByRole('button', { name: 'notify' }));
    },
  },
];

describe('styling: every documented part is exposed (CC-14)', () => {
  it.each(partFixtures)('$name', async ({ parts, ui, setup }) => {
    const user = userEvent.setup();
    const { container } = render(ui);
    if (setup) await setup(user);
    for (const part of parts) {
      expect(
        container.querySelector(`[data-ic-part="${part}"]`),
        `missing data-ic-part="${part}"`,
      ).toBeInTheDocument();
    }
  });
});

describe('styling: stable CSS hooks', () => {
  it('reflects state via data-ic-state without consumers needing ARIA', async () => {
    const user = userEvent.setup();
    render(<ToggleButton>Notify</ToggleButton>);
    const btn = screen.getByRole('button');
    expect(btn).toHaveAttribute('data-ic-state', 'off');
    await user.click(btn);
    expect(btn).toHaveAttribute('data-ic-state', 'on');
  });

  it('exposes data-ic-state on compound component parts (Tabs)', () => {
    render(
      <Tabs label="x" defaultValue="a">
        <Tabs.List>
          <Tabs.Tab value="a">A</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="a">content</Tabs.Panel>
      </Tabs>,
    );
    expect(screen.getByRole('tab')).toHaveAttribute('data-ic-state', 'selected');
    expect(screen.getByRole('tabpanel')).toHaveAttribute('data-ic-state', 'selected');
  });
});

describe('styling: locked layer is protected', () => {
  it('a consumer onClick is chained, NOT replaced — the toggle still works', async () => {
    const user = userEvent.setup();
    const spy = vi.fn();
    render(<ToggleButton onClick={spy}>Notify</ToggleButton>);
    const btn = screen.getByRole('button');
    await user.click(btn);
    expect(spy).toHaveBeenCalledTimes(1); // consumer handler ran
    expect(btn).toHaveAttribute('aria-pressed', 'true'); // library behavior also ran
  });

  it('a consumer that force-passes a reserved attr cannot override the library (role)', () => {
    // The TS types forbid this; the cast simulates a JS consumer trying anyway.
    render(
      <ToggleButton {...({ role: 'menuitem' } as Record<string, unknown>)}>Notify</ToggleButton>,
    );
    // Library wins: it's still a button, not a menuitem.
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.queryByRole('menuitem')).not.toBeInTheDocument();
  });

  it('CC-12: forced tabIndex/aria-hidden are stripped at runtime, not just by the types', () => {
    render(
      <ToggleButton {...({ tabIndex: -1, 'aria-hidden': 'true' } as Record<string, unknown>)}>
        Notify
      </ToggleButton>,
    );
    const btn = screen.getByRole('button');
    expect(btn).not.toHaveAttribute('tabindex');
    expect(btn).not.toHaveAttribute('aria-hidden');
  });
});

describe('cross-cutting (CC)', () => {
  it('CC-8: multiple instances on one page generate unique, non-colliding ids', () => {
    render(
      <>
        {[1, 2].map((n) => (
          <Tabs key={n} label={`Set ${n}`} defaultValue="a">
            <Tabs.List>
              <Tabs.Tab value="a">A</Tabs.Tab>
            </Tabs.List>
            <Tabs.Panel value="a">panel</Tabs.Panel>
          </Tabs>
        ))}
        <Collapsible label="One" defaultOpen>
          x
        </Collapsible>
        <Collapsible label="Two" defaultOpen>
          y
        </Collapsible>
      </>,
    );
    const ids = Array.from(document.querySelectorAll('[id]')).map((el) => el.id);
    expect(ids.length).toBeGreaterThan(0);
    expect(new Set(ids).size).toBe(ids.length); // no duplicates
    // And the ARIA wiring stays per-instance.
    const [one, two] = screen.getAllByRole('button', { name: /One|Two/ });
    expect(one.getAttribute('aria-controls')).not.toBe(two.getAttribute('aria-controls'));
  });

  it('CC-10: focus is never trapped — Tab walks through and out of a component', async () => {
    const user = userEvent.setup();
    render(
      <>
        <Tabs label="t" defaultValue="a">
          <Tabs.List>
            <Tabs.Tab value="a">A</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="a">
            <button type="button">inside</button>
          </Tabs.Panel>
        </Tabs>
        <button type="button">outside</button>
      </>,
    );
    screen.getByRole('tab').focus();
    await user.tab(); // into the panel content
    expect(screen.getByRole('button', { name: 'inside' })).toHaveFocus();
    await user.tab(); // and straight out of the component
    expect(screen.getByRole('button', { name: 'outside' })).toHaveFocus();
  });

  it('CC-16: one Escape press dismisses at most one open widget', async () => {
    const user = userEvent.setup();
    render(
      <>
        <Toggletip label="info" content="toggletip content" />
        <Tooltip content="tooltip content">
          <button aria-label="hint">?</button>
        </Tooltip>
      </>,
    );
    // Open the toggletip (click), then a hover-only tooltip — both open at once.
    await user.click(screen.getByRole('button', { name: 'info' }));
    expect(await screen.findByText('toggletip content')).toBeInTheDocument();
    // The tooltip trigger's accessible name IS the tooltip content (aria-labelledby).
    await user.hover(screen.getByRole('button', { name: 'tooltip content' }));
    const tip = document.querySelector('[role="tooltip"]')!;
    expect(tip).toHaveAttribute('data-ic-state', 'open');

    // First Escape: exactly one widget closes (the toggletip claimed the event).
    await user.keyboard('{Escape}');
    expect(screen.queryByText('toggletip content')).not.toBeInTheDocument();
    expect(tip).toHaveAttribute('data-ic-state', 'open');

    // Second Escape: now the tooltip dismisses.
    await user.keyboard('{Escape}');
    expect(tip).toHaveAttribute('data-ic-state', 'closed');
  });
});
