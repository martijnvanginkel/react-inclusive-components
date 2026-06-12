import { Fragment, useEffect, useId, useMemo, useRef, useState } from 'react';
import { makeSlots } from '../shared/slots';
import styles from './DataTable.module.css';

type SortDir = 'ascending' | 'descending';

/** Styleable parts (target via `data-ic-part` in CSS). */
type DataTablePart =
  | 'root'
  | 'scroller'
  | 'table'
  | 'caption'
  | 'hint'
  | 'head'
  | 'body'
  | 'row'
  | 'headerCell'
  | 'sortButton'
  | 'sortIcon'
  | 'rowHeader'
  | 'cell'
  | 'stack'
  | 'stackGroup'
  | 'stackHeading'
  | 'stackList'
  | 'stackTerm'
  | 'stackValue';

export interface DataTableProps {
  /** Table label, rendered as a <caption>. */
  caption: string;
  /** Column header strings. */
  headers: string[];
  /** Row data; each row aligns with `headers`. Never mutated. */
  rows: Array<Array<string | number>>;
  /** Treat the first cell of each row as a row header (`<th scope="row">`). */
  rowHeaders?: boolean;
  /** Enable column sorting via header buttons. */
  sortable?: boolean;
}

const SORT_ICONS: Record<SortDir | 'none', string> = {
  none: '↕',
  ascending: '↑',
  descending: '↓',
};

/**
 * A semantic data table. Wide tables get a horizontally scrollable wrapper that becomes a
 * named, focusable `role="group"` ONLY when content actually overflows. Optional column
 * sorting (real buttons + `aria-sort`) never mutates the source data. On very narrow
 * viewports a headings + `<dl>` layout takes over via CSS — semantics are never destroyed
 * with `display` overrides.
 */
export function DataTable({
  caption,
  headers,
  rows,
  rowHeaders = false,
  sortable = false,
}: DataTableProps) {
  const captionId = useId();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [sort, setSort] = useState<{ col: number; dir: SortDir } | null>(null);
  const slot = makeSlots<DataTablePart>();

  // Copy before sorting — the consumer's array must never be mutated (DT-8).
  // The comparator must be transitive even for mixed columns (DT-11): numbers compare
  // numerically and sort before strings; strings use numeric-aware collation so
  // ['2', '10'] orders naturally instead of lexicographically.
  const sortedRows = useMemo(() => {
    if (!sort) return rows;
    const copy = rows.slice(0);
    copy.sort((a, b) => {
      const x = a[sort.col];
      const y = b[sort.col];
      let cmp: number;
      if (typeof x === 'number' && typeof y === 'number') cmp = x - y;
      else if (typeof x === 'number') cmp = -1;
      else if (typeof y === 'number') cmp = 1;
      else cmp = x.localeCompare(y, undefined, { numeric: true });
      return sort.dir === 'ascending' ? cmp : -cmp;
    });
    return copy;
  }, [rows, sort]);

  // The wrapper becomes a focusable, named group ONLY while content overflows (DT-4/DT-5).
  // Attributes are applied imperatively: this synchronizes React with layout measurements.
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const update = () => {
      if (el.scrollWidth > el.clientWidth) {
        el.tabIndex = 0;
        el.setAttribute('role', 'group');
        el.setAttribute('aria-labelledby', captionId);
        el.setAttribute('data-overflowing', 'true');
      } else {
        el.removeAttribute('tabindex');
        el.removeAttribute('role');
        el.removeAttribute('aria-labelledby');
        el.removeAttribute('data-overflowing');
      }
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
    // rows/headers: new data can change the table's width without a window resize.
  }, [captionId, rows, headers]);

  return (
    <div {...slot('root', styles.root)}>
      <div ref={scrollerRef} {...slot('scroller', styles.scroller)}>
        <table {...slot('table', styles.table)}>
          <caption id={captionId} {...slot('caption', styles.caption)}>
            {caption}
            <span {...slot('hint', styles.hint)} aria-hidden="true">
              {' '}
              (scroll to see more)
            </span>
          </caption>
          <thead {...slot('head')}>
            <tr {...slot('row')}>
              {headers.map((header, col) => {
                const dir = sort?.col === col ? sort.dir : 'none';
                const next: SortDir = dir === 'ascending' ? 'descending' : 'ascending';
                return (
                  <th
                    key={col}
                    scope="col"
                    {...(sortable
                      ? { role: 'columnheader', 'aria-sort': dir }
                      : {})}
                    {...slot('headerCell', styles.headerCell, dir !== 'none' ? dir : undefined)}
                  >
                    {sortable ? (
                      <button
                        type="button"
                        aria-label={`sort by ${header} in ${next} order`}
                        onClick={() => setSort({ col, dir: next })}
                        {...slot('sortButton', styles.sortButton)}
                      >
                        {header}
                        <span {...slot('sortIcon', styles.sortIcon)} aria-hidden="true">
                          {SORT_ICONS[dir]}
                        </span>
                      </button>
                    ) : (
                      header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody {...slot('body')}>
            {sortedRows.map((row, i) => (
              <tr key={i} {...slot('row')}>
                {row.map((value, j) =>
                  rowHeaders && j === 0 ? (
                    <th key={j} scope="row" {...slot('rowHeader', styles.rowHeader)}>
                      {value}
                    </th>
                  ) : (
                    <td key={j} {...slot('cell', styles.cell)}>
                      {value}
                    </td>
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Narrow-viewport alternative: headings + definition lists, toggled purely by CSS
          breakpoint (DT-9). The hidden version is display:none → out of the a11y tree. */}
      <div {...slot('stack', styles.stack)}>
        {sortedRows.map((row, i) => (
          <div key={i} {...slot('stackGroup', styles.stackGroup)}>
            {rowHeaders && <h3 {...slot('stackHeading', styles.stackHeading)}>{row[0]}</h3>}
            <dl {...slot('stackList', styles.stackList)}>
              {headers.map((header, j) =>
                rowHeaders && j === 0 ? null : (
                  <Fragment key={j}>
                    <dt {...slot('stackTerm')}>{header}</dt>
                    <dd {...slot('stackValue')}>{row[j]}</dd>
                  </Fragment>
                ),
              )}
            </dl>
          </div>
        ))}
      </div>
    </div>
  );
}
