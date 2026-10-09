/**
 * Table - 共有 UI ライブラリのテーブルコンポーネント
 *
 * 列定義（columns）とデータ（rows）を渡すと、ヘッダー・行・空状態を
 * 一貫した見た目で描画する。空状態の文言を必ず指定させることで
 * 「データが無いときに何も出ない画面」を防ぐ。
 *
 * <important>
 * これは「見た目の共通化」だけを担う。ソート・ページング・フィルタの**ロジック**は
 * 業務ロジックなので各アプリ側（またはサーバー）で実装し、その結果を rows に渡す。
 * この部品が持つのは **状態の描画** だけ: `sort` / `onSortChange` で「どの列がどちら向きか」を
 * 描き（aria-sort と矢印）、`selection` で「どの行が選ばれているか」を描く。
 * htmx でクエリを飛ばす画面でも、`onSortChange` で URL を書き換えれば同じ props で使える。
 * サーバーレンダリング側の一覧はテンプレートで描画し（`.data-table`）、Table は使わない。
 * </important>
 */

import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import * as React from "react";
import { cn } from "../../lib/utils";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "../ui/empty";
import {
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  Table as TablePrimitive,
  TableRow,
} from "../ui/table";
import { Checkbox } from "./Checkbox";

export interface TableColumn<T> {
  /** 列のキー（React の key と、sort の key に使う） */
  key: string;

  /** ヘッダーに表示する内容 */
  header: React.ReactNode;

  /** セルの内容を返す */
  cell: (row: T, rowIndex: number) => React.ReactNode;

  /**
   * 列の寄せ。数値・金額は right、操作ボタンは right が読みやすい。
   * @default "left"
   */
  align?: "left" | "center" | "right";

  /** 列幅（Tailwind クラス。例: "w-32"） */
  className?: string;

  /** ヘッダーセルにだけ付けるクラス */
  headerClassName?: string;

  /**
   * 並び替え可能な列。true にするとヘッダーがボタンになり、`onSortChange` を呼ぶ。
   * 並び替えそのものは行わない（Table の props の `sort` を見て矢印を描くだけ）。
   */
  sortable?: boolean;
}

export interface TableSort {
  /** 並び替え中の列の key */
  key: string;
  direction: "asc" | "desc";
}

export type TableRowKey = string | number;

export type TableVariant = "framed" | "plain";

export interface TableSelection<T> {
  /** 選択中の行の key（rowKey の戻り値） */
  selectedKeys: readonly TableRowKey[];
  /** 選択が変わったときに、選択中の key 一式で呼ばれる */
  onChange: (keys: TableRowKey[]) => void;
  /** 選択できない行（省略時はすべて選択可） */
  isRowSelectable?: (row: T) => boolean;
  /**
   * 行のチェックボックスの読み上げラベル
   * @default "行を選択"
   */
  ariaLabel?: (row: T) => string;
  /**
   * ヘッダーの全選択チェックボックスの読み上げラベル
   * @default "すべて選択"
   */
  selectAllLabel?: string;
}

export interface TableProps<T> {
  /** 列定義 */
  columns: TableColumn<T>[];

  /** 表示するデータ */
  rows: T[];

  /**
   * 各行の React key を返す。省略すると index を使う（並び替えがある場合は必ず指定）。
   * `selection` を使うときは必須（選択中の行をこの key で表す）。
   */
  rowKey?: (row: T, index: number) => TableRowKey;

  /**
   * データが 0 件のときに表示する文言。
   * 「なぜ空なのか」「次に何をすればよいか」が分かる文にする。
   * @default "データがありません"
   */
  emptyMessage?: React.ReactNode;

  /** 空状態の補足説明 */
  emptySubMessage?: React.ReactNode;

  /**
   * 行クリック時の処理。渡すと行にホバー・カーソルが付く。
   *
   * 第3引数は click event。行の中にボタンやラジオなど独自に反応する要素を
   * 置く場合は、`event.target` を見てその要素由来のクリックを無視する
   * （無視しないと、要素側の処理と行クリックが二重に走る）。
   * `selection` のチェックボックスは部品側で無視している。
   */
  onRowClick?: (row: T, index: number, event: React.MouseEvent<HTMLTableRowElement>) => void;

  /**
   * 行ごとに付けるクラス。選択中・警告などの強調に使う。
   * 行の意味そのもの（無効・エラー）は文字やバッジでも分かるようにする
   * （背景色だけで伝えると色覚特性によって読めない）。
   */
  rowClassName?: (row: T, index: number) => string | undefined;

  /** テーブルの用途を支援技術に伝える説明（視覚的には非表示） */
  caption?: string;

  /**
   * 並び替えの状態（制御）。`sortable` な列のヘッダーに矢印と aria-sort を描く。
   * 実際の並び替えは呼び出し側が行い、rows を作り直す。
   */
  sort?: TableSort | null;

  /** sortable な列のヘッダーが押されたときに、次の状態で呼ばれる（asc → desc → asc） */
  onSortChange?: (next: TableSort) => void;

  /** 行選択。渡すと先頭に選択列が付く。rowKey が必須 */
  selection?: TableSelection<T>;

  /**
   * ヘッダーを固定する。表はスクロール容器になるため `maxHeight` と組で使う
   * （高さ制限が無いと容器が伸びきってスクロールせず、固定の意味が無い）。
   * @default false
   */
  stickyHeader?: boolean;

  /** スクロール容器の高さ（stickyHeader と組で使う。例: 480 / "60vh"） */
  maxHeight?: number | string;

  /**
   * 面の有無。"framed" は枠・角丸・背景を持つ作業面、"plain" は枠を持たずページの地や
   * PageSection の中にそのまま置く（decisions/adr-0009）。Card の中に置くときも "plain" にする。
   * テンプレート側の `.data-table` は "plain" と同じ見た目。
   * @default "framed"
   */
  variant?: TableVariant;

  className?: string;
}

const ALIGN_CLASS = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
} as const;

const ARIA_SORT = { asc: "ascending", desc: "descending" } as const;

/**
 * Table コンポーネント
 *
 * @example
 * ```tsx
 * type Row = { id: number; name: string; amount: number }
 *
 * <Table<Row>
 *   columns={[
 *     { key: "name", header: "名前", cell: (r) => r.name, sortable: true },
 *     { key: "amount", header: "金額", align: "right", sortable: true,
 *       cell: (r) => `${r.amount.toLocaleString()} 円` },
 *   ]}
 *   rows={sortedRows}
 *   rowKey={(r) => r.id}
 *   sort={sort}
 *   onSortChange={setSort}       // 並び替えは呼び出し側（またはサーバー）
 *   selection={{ selectedKeys: selected, onChange: setSelected }}
 *   emptyMessage="申請がありません"
 *   emptySubMessage="「新規申請」から作成してください"
 * />
 * ```
 */
export function Table<T>({
  columns,
  rows,
  rowKey,
  emptyMessage = "データがありません",
  emptySubMessage,
  onRowClick,
  rowClassName,
  caption,
  sort,
  onSortChange,
  selection,
  stickyHeader = false,
  maxHeight,
  variant = "framed",
  className,
}: TableProps<T>) {
  const isEmpty = rows.length === 0;

  React.useEffect(() => {
    if (selection && !rowKey) {
      console.warn(
        "[Table] selection を使うときは rowKey を指定してください（選択中の行を key で表します）",
      );
    }
  }, [selection, rowKey]);

  const keyOf = (row: T, index: number): TableRowKey => (rowKey ? rowKey(row, index) : index);

  const selectableRows = selection
    ? rows
        .map((row, i) => ({ row, key: keyOf(row, i) }))
        .filter(({ row }) => selection.isRowSelectable?.(row) ?? true)
    : [];
  const selectedSet = new Set(selection?.selectedKeys ?? []);
  const selectedSelectableCount = selectableRows.filter(({ key }) => selectedSet.has(key)).length;
  const allSelected =
    selectableRows.length > 0 && selectedSelectableCount === selectableRows.length;
  const someSelected = selectedSelectableCount > 0 && !allSelected;

  const toggleAll = (checked: boolean) => {
    if (!selection) return;
    const selectableKeys = selectableRows.map(({ key }) => key);
    if (checked) {
      const merged = new Set([...selection.selectedKeys, ...selectableKeys]);
      selection.onChange(Array.from(merged));
    } else {
      const remove = new Set(selectableKeys);
      selection.onChange(selection.selectedKeys.filter((key) => !remove.has(key)));
    }
  };

  const toggleRow = (key: TableRowKey, checked: boolean) => {
    if (!selection) return;
    if (checked) {
      if (!selectedSet.has(key)) selection.onChange([...selection.selectedKeys, key]);
    } else {
      selection.onChange(selection.selectedKeys.filter((k) => k !== key));
    }
  };

  const handleSort = (col: TableColumn<T>) => {
    if (!onSortChange) return;
    const direction = sort?.key === col.key && sort.direction === "asc" ? "desc" : "asc";
    onSortChange({ key: col.key, direction });
  };

  const colCount = columns.length + (selection ? 1 : 0);

  return (
    <TablePrimitive
      className={className}
      containerClassName={cn(
        variant === "plain" && "cn-table-container-plain",
        stickyHeader && "cn-table-container-sticky",
      )}
      containerStyle={maxHeight !== undefined ? { maxHeight } : undefined}
    >
      {caption && <TableCaption className="sr-only">{caption}</TableCaption>}

      <TableHeader>
        <TableRow>
          {selection && (
            <TableHead scope="col" className="w-10">
              <Checkbox
                aria-label={selection.selectAllLabel ?? "すべて選択"}
                checked={allSelected}
                indeterminate={someSelected}
                disabled={selectableRows.length === 0}
                onCheckedChange={(checked) => toggleAll(Boolean(checked))}
              />
            </TableHead>
          )}
          {columns.map((col) => {
            const isSorted = sort?.key === col.key;
            const sortable = Boolean(col.sortable && onSortChange);
            return (
              <TableHead
                key={col.key}
                scope="col"
                aria-sort={
                  sortable ? (isSorted && sort ? ARIA_SORT[sort.direction] : "none") : undefined
                }
                className={cn(
                  ALIGN_CLASS[col.align ?? "left"],
                  sortable && "cn-table-head-sortable",
                  col.className,
                  col.headerClassName,
                )}
              >
                {sortable ? (
                  <button
                    type="button"
                    className="cn-table-sort"
                    data-sorted={isSorted || undefined}
                    onClick={() => handleSort(col)}
                  >
                    <span>{col.header}</span>
                    {isSorted && sort ? (
                      sort.direction === "asc" ? (
                        <ArrowUp aria-hidden="true" />
                      ) : (
                        <ArrowDown aria-hidden="true" />
                      )
                    ) : (
                      <ArrowUpDown aria-hidden="true" className="cn-table-sort-idle" />
                    )}
                  </button>
                ) : (
                  col.header
                )}
              </TableHead>
            );
          })}
        </TableRow>
      </TableHeader>

      <TableBody>
        {isEmpty ? (
          <TableRow>
            <TableCell colSpan={colCount} className="py-12">
              {/* 空状態は shadcn/ui の Empty に揃える */}
              <Empty>
                <EmptyHeader>
                  <EmptyTitle>{emptyMessage}</EmptyTitle>
                  {emptySubMessage && <EmptyDescription>{emptySubMessage}</EmptyDescription>}
                </EmptyHeader>
              </Empty>
            </TableCell>
          </TableRow>
        ) : (
          rows.map((row, i) => {
            const key = keyOf(row, i);
            const selected = selection ? selectedSet.has(key) : false;
            const selectable = selection ? (selection.isRowSelectable?.(row) ?? true) : false;
            return (
              <TableRow
                key={key}
                onClick={onRowClick ? (event) => onRowClick(row, i, event) : undefined}
                aria-selected={selection ? selected : undefined}
                data-state={selected ? "selected" : undefined}
                className={cn(
                  onRowClick && "cursor-pointer hover:bg-accent focus-within:bg-accent",
                  rowClassName?.(row, i),
                )}
              >
                {selection && (
                  <TableCell
                    className="w-10"
                    // 選択の操作は行クリックと二重に走らせない
                    onClick={(event) => event.stopPropagation()}
                  >
                    <Checkbox
                      aria-label={selection.ariaLabel?.(row) ?? "行を選択"}
                      checked={selected}
                      disabled={!selectable}
                      onCheckedChange={(checked) => toggleRow(key, Boolean(checked))}
                    />
                  </TableCell>
                )}
                {columns.map((col) => (
                  <TableCell
                    key={col.key}
                    className={cn(ALIGN_CLASS[col.align ?? "left"], col.className)}
                  >
                    {col.cell(row, i)}
                  </TableCell>
                ))}
              </TableRow>
            );
          })
        )}
      </TableBody>
    </TablePrimitive>
  );
}

Table.displayName = "Table";
