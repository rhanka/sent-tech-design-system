import {
  buildAdvancedPivotTable,
  type AdvancedPivotCell,
  type AdvancedPivotConfig,
  type DataModel,
  type Row,
} from '@sentropic/dataviz-core';

type TableColumn = {
  key: string;
  label: string;
  sortable: boolean;
  align: 'start' | 'end';
};

export type AdvancedPivotTableRowView = {
  id: string;
  __kind: 'leaf' | 'subtotal';
  __depth: number;
  __expanded: boolean;
  __path: string;
  [key: string]: unknown;
};

export type AdvancedPivotTableView = {
  columns: TableColumn[];
  rows: AdvancedPivotTableRowView[];
};

function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(2)));
}

function formatCell(cell: AdvancedPivotCell | undefined): string {
  if (!cell) return '';
  const parts = [formatNumber(cell.value)];
  if (cell.heat !== undefined) {
    parts.push(`heat ${Math.round(cell.heat * 100)}%`);
  }
  if (cell.sparkline !== undefined) {
    const points = cell.sparkline.map((point) => `${point.key} ${formatNumber(point.value)}`).join(', ');
    parts.push(points ? `sparkline ${points}` : 'sparkline');
  }
  return parts.join(' ');
}

function rowLabel(path: readonly string[], kind: 'leaf' | 'subtotal'): string {
  const label = path.join(' ');
  return kind === 'subtotal' ? `${label} subtotal` : label;
}

export function buildAdvancedPivotView(
  model: DataModel,
  rows: readonly Row[],
  config: AdvancedPivotConfig,
): AdvancedPivotTableView {
  try {
    const pivot = buildAdvancedPivotTable(model, rows, config);
    const rowColumns = pivot.columns.filter((column) => column.kind === 'row');

    return {
      columns: pivot.columns.map((column) => ({
        key: column.key,
        label: column.label,
        sortable: true,
        align: column.kind === 'value' ? 'end' : 'start',
      })),
      rows: pivot.rows.map((row) => {
        const view: AdvancedPivotTableRowView = {
          id: row.id,
          __kind: row.kind,
          __depth: row.depth,
          __expanded: row.expanded,
          __path: row.path.join(' '),
        };

        rowColumns.forEach((column, index) => {
          const dimensionId = column.key.slice('row:'.length);
          view[column.key] = index === 0 ? rowLabel(row.path, row.kind) : (row.labels[dimensionId] ?? '');
        });

        Object.values(pivot.columns)
          .filter((column) => column.kind === 'value')
          .forEach((column) => {
            view[column.key] = formatCell(row.values[column.key]);
          });

        return view;
      }),
    };
  } catch {
    return { columns: [], rows: [] };
  }
}
