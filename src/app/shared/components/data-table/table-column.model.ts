export type ColumnAlign = 'start' | 'end' | 'center';

/**
 * Column definition for {@link DataTableComponent}. Provide a `value` accessor for
 * plain text, or supply an `*appColumnCell` template keyed by `key` for rich cells
 * (badges, money, links).
 */
export interface TableColumn<T> {
  /** Unique column id; also the default sort field and cell-template key. */
  readonly key: string;
  readonly header: string;
  readonly sortable?: boolean;
  /** Sort field sent to the server; defaults to `key`. */
  readonly sortField?: string;
  readonly align?: ColumnAlign;
  /** Plain-text accessor, used when no cell template is provided for this key. */
  readonly value?: (row: T) => string | number | null | undefined;
  /** Hidden in the desktop table below the compact breakpoint. */
  readonly hideOnMobile?: boolean;
  /** Shown in the mobile card's header area (first = title, rest = meta). */
  readonly primary?: boolean;
  readonly width?: string;
  /** Accessible header description when the visible header is terse. */
  readonly ariaLabel?: string;
}
