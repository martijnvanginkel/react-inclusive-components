import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DataTable } from './DataTable';

// Rules covered: DT-1..DT-10 (see REQUIREMENTS.md §11). The breakpoint swap itself (DT-9
// visual half) is CSS and verified manually; we assert both structures exist with correct
// semantics.

const HEADERS = ['Planet', 'Radius (km)', 'Moons'];
const ROWS: Array<Array<string | number>> = [
  ['Mars', 3390, 2],
  ['Earth', 6371, 1],
  ['Jupiter', 69911, 95],
];

describe('DataTable', () => {
  it('DT-1/DT-2: a real table with scoped column headers', () => {
    render(<DataTable caption="Planets" headers={HEADERS} rows={ROWS} />);
    const table = screen.getByRole('table');
    const cols = within(table).getAllByRole('columnheader');
    expect(cols).toHaveLength(3);
    cols.forEach((th) => expect(th).toHaveAttribute('scope', 'col'));
  });

  it('DT-2: rowHeaders renders the first cell as <th scope="row">', () => {
    render(<DataTable caption="Planets" headers={HEADERS} rows={ROWS} rowHeaders />);
    const mars = screen.getByRole('rowheader', { name: 'Mars' });
    expect(mars).toHaveAttribute('scope', 'row');
  });

  it('DT-3: the table is named by its <caption>', () => {
    render(<DataTable caption="Planets" headers={HEADERS} rows={ROWS} />);
    expect(screen.getByRole('table', { name: /Planets/ })).toBeInTheDocument();
    expect(document.querySelector('caption')).toHaveTextContent('Planets');
  });

  it('DT-4: the scroll wrapper is NOT focusable when content fits', () => {
    const { container } = render(<DataTable caption="Planets" headers={HEADERS} rows={ROWS} />);
    const scroller = container.querySelector('[data-ic-part="scroller"]')!;
    expect(scroller).not.toHaveAttribute('tabindex');
    expect(scroller).not.toHaveAttribute('role');
  });

  it('DT-4/DT-5/DT-6: when overflowing, the wrapper becomes a focusable named group with a hint', () => {
    // Simulate overflow: scrollWidth > clientWidth on every element.
    const sw = vi.spyOn(Element.prototype, 'scrollWidth', 'get').mockReturnValue(800);
    const cw = vi.spyOn(Element.prototype, 'clientWidth', 'get').mockReturnValue(400);
    try {
      const { container } = render(<DataTable caption="Planets" headers={HEADERS} rows={ROWS} />);
      const scroller = container.querySelector('[data-ic-part="scroller"]')!;
      expect(scroller).toHaveAttribute('tabindex', '0');
      expect(scroller).toHaveAttribute('role', 'group');
      const caption = document.querySelector('caption')!;
      expect(scroller).toHaveAttribute('aria-labelledby', caption.id);
      expect(scroller).toHaveAttribute('data-overflowing', 'true');
      expect(within(caption as HTMLElement).getByText(/scroll to see more/)).toBeInTheDocument();
    } finally {
      sw.mockRestore();
      cw.mockRestore();
    }
  });

  it('DT-7: sort buttons toggle aria-sort and reorder rows', async () => {
    const user = userEvent.setup();
    render(<DataTable caption="Planets" headers={HEADERS} rows={ROWS} sortable />);
    const planetTh = screen.getAllByRole('columnheader')[0];
    expect(planetTh).toHaveAttribute('aria-sort', 'none');
    const icon = planetTh.querySelector('[data-ic-part="sortIcon"]')!;
    expect(icon).toHaveTextContent('↕'); // three-state visual icon: unsorted

    await user.click(screen.getByRole('button', { name: 'sort by Planet in ascending order' }));
    expect(planetTh).toHaveAttribute('aria-sort', 'ascending');
    expect(icon).toHaveTextContent('↑');
    let firstDataRow = within(screen.getByRole('table')).getAllByRole('row')[1];
    expect(firstDataRow).toHaveTextContent('Earth');

    // Button label now offers the opposite direction.
    await user.click(screen.getByRole('button', { name: 'sort by Planet in descending order' }));
    expect(planetTh).toHaveAttribute('aria-sort', 'descending');
    expect(icon).toHaveTextContent('↓');
    firstDataRow = within(screen.getByRole('table')).getAllByRole('row')[1];
    expect(firstDataRow).toHaveTextContent('Mars');
  });

  it('DT-7: numeric columns sort numerically', async () => {
    const user = userEvent.setup();
    render(<DataTable caption="Planets" headers={HEADERS} rows={ROWS} sortable />);
    await user.click(screen.getByRole('button', { name: /sort by Radius/ }));
    const firstDataRow = within(screen.getByRole('table')).getAllByRole('row')[1];
    expect(firstDataRow).toHaveTextContent('Mars'); // 3390 is the smallest radius
  });

  it('DT-8: sorting does not mutate the consumer rows array', async () => {
    const user = userEvent.setup();
    const rows = ROWS.map((r) => r.slice(0));
    const snapshot = JSON.stringify(rows);
    render(<DataTable caption="Planets" headers={HEADERS} rows={rows} sortable />);
    await user.click(screen.getByRole('button', { name: /sort by Planet/ }));
    expect(JSON.stringify(rows)).toBe(snapshot);
  });

  it('DT-9: a headings + <dl> alternative exists for narrow viewports', () => {
    const { container } = render(
      <DataTable caption="Planets" headers={HEADERS} rows={ROWS} rowHeaders />,
    );
    const stack = container.querySelector('[data-ic-part="stack"]')!;
    expect(within(stack as HTMLElement).getAllByRole('heading', { level: 3 })).toHaveLength(3);
    const firstDl = stack.querySelector('dl')!;
    expect(firstDl.querySelectorAll('dt')).toHaveLength(2); // row-header column excluded
    expect(firstDl.querySelectorAll('dd')).toHaveLength(2);
  });

  it('DT-10: never uses role="grid"', () => {
    render(<DataTable caption="Planets" headers={HEADERS} rows={ROWS} sortable />);
    expect(screen.queryByRole('grid')).not.toBeInTheDocument();
  });
});
