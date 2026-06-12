import { DataTable } from '../../lib';

const headers = ['Planet', 'Radius (km)', 'Moons', 'Day length (hours)'];
const rows: Array<Array<string | number>> = [
  ['Mercury', 2440, 0, 4222.6],
  ['Venus', 6052, 0, 2802],
  ['Earth', 6371, 1, 24],
  ['Mars', 3390, 2, 24.7],
  ['Jupiter', 69911, 95, 9.9],
];

export function DataTableDemo() {
  return (
    <>
      <p className="note">
        Semantic <code>&lt;th scope&gt;</code> headers and a <code>&lt;caption&gt;</code>. Sort
        buttons toggle <code>aria-sort</code> without mutating the data. If the table overflows
        horizontally, its wrapper becomes a focusable, labelled <code>role="group"</code> with a
        “(scroll to see more)” hint — try narrowing the window. On very narrow screens it swaps
        to a headings + definition-list layout.
      </p>

      <DataTable caption="Planets of the solar system" headers={headers} rows={rows} rowHeaders sortable />
    </>
  );
}
