import { ToggleButtonDemo } from './sections/ToggleButtonDemo';
import { CollapsibleDemo } from './sections/CollapsibleDemo';
import { TabsDemo } from './sections/TabsDemo';
import { TooltipDemo } from './sections/TooltipDemo';
import { ToggletipDemo } from './sections/ToggletipDemo';
import { MenuButtonDemo } from './sections/MenuButtonDemo';
import { CardDemo } from './sections/CardDemo';
import { TodoListDemo } from './sections/TodoListDemo';
import { ContentSliderDemo } from './sections/ContentSliderDemo';
import { DataTableDemo } from './sections/DataTableDemo';
import { NotificationsDemo } from './sections/NotificationsDemo';

export interface ComponentEntry {
  /** URL slug, used as the hash route (e.g. "#/tabs"). */
  id: string;
  title: string;
  /** One-line summary shown on the homepage. */
  blurb: string;
  Demo: () => React.ReactNode;
}

export const components: ComponentEntry[] = [
  {
    id: 'toggle-button',
    title: 'Toggle Button',
    blurb: 'A two-state control — pressed-style button or on/off switch.',
    Demo: ToggleButtonDemo,
  },
  {
    id: 'collapsible',
    title: 'Collapsible',
    blurb: 'A labelled button that shows and hides a region of content.',
    Demo: CollapsibleDemo,
  },
  {
    id: 'tabs',
    title: 'Tabs',
    blurb: 'Tabbed panels with arrow-key navigation between tabs.',
    Demo: TabsDemo,
  },
  {
    id: 'tooltip',
    title: 'Tooltip',
    blurb: 'A label or description shown on hover and focus of a control.',
    Demo: TooltipDemo,
  },
  {
    id: 'toggletip',
    title: 'Toggletip',
    blurb: 'A button that reveals supplementary info via a live region.',
    Demo: ToggletipDemo,
  },
  {
    id: 'menu-button',
    title: 'Menu Button',
    blurb: 'A button that opens a menu of actions or mutually-exclusive choices.',
    Demo: MenuButtonDemo,
  },
  {
    id: 'card',
    title: 'Card',
    blurb: 'A grouped content teaser where the whole card is clickable.',
    Demo: CardDemo,
  },
  {
    id: 'todo-list',
    title: 'Todo List',
    blurb: 'Add, check off and delete items, with live-region feedback and focus management.',
    Demo: TodoListDemo,
  },
  {
    id: 'content-slider',
    title: 'Content Slider',
    blurb: 'A manually-operated horizontal scroll region — never auto-rotating.',
    Demo: ContentSliderDemo,
  },
  {
    id: 'data-table',
    title: 'Data Table',
    blurb: 'Semantic tabular data with sorting and an accessible scroll wrapper.',
    Demo: DataTableDemo,
  },
  {
    id: 'notifications',
    title: 'Notifications',
    blurb: 'Polite live-region messages that never steal focus.',
    Demo: NotificationsDemo,
  },
];
