import type { Meta, StoryObj } from "@storybook/react-vite";
import { MoreVertical } from "lucide-react";
import * as React from "react";
import {
  Badge,
  type BadgeTone,
  Button,
  Checkbox,
  Dropdown,
  PageSection,
  Table,
  type TableColumn,
  type TableSort,
} from "../../components/application";
import { Section, Showcase } from "../_showcase";

type Request = {
  id: number;
  code: string;
  title: string;
  status: "new" | "in_progress" | "done";
  applicant: string;
  amount: number;
};

const STATUS_LABEL: Record<Request["status"], { label: string; tone: BadgeTone }> = {
  new: { label: "未対応", tone: "new" },
  in_progress: { label: "対応中", tone: "active" },
  done: { label: "完了", tone: "done" },
};

const ROWS: Request[] = [
  {
    id: 1,
    code: "SYS-2026-0001",
    title: "備品購入（モニター 2 台）",
    status: "new",
    applicant: "山田 太郎",
    amount: 78000,
  },
  {
    id: 2,
    code: "SYS-2026-0002",
    title: "出張費精算（大阪）",
    status: "in_progress",
    applicant: "鈴木 花子",
    amount: 45800,
  },
  {
    id: 3,
    code: "SYS-2026-0003",
    title: "書籍購入",
    status: "done",
    applicant: "佐藤 次郎",
    amount: 3200,
  },
  {
    id: 4,
    code: "SYS-2026-0004",
    title: "研修参加費",
    status: "done",
    applicant: "田中 三郎",
    amount: 120000,
  },
];

const COLUMNS: TableColumn<Request>[] = [
  {
    key: "code",
    header: "申請番号",
    className: "w-40",
    cell: (r) => <span className="font-mono text-xs">{r.code}</span>,
  },
  { key: "title", header: "件名", cell: (r) => r.title },
  {
    key: "status",
    header: "ステータス",
    className: "w-28",
    cell: (r) => <Badge tone={STATUS_LABEL[r.status].tone}>{STATUS_LABEL[r.status].label}</Badge>,
  },
  { key: "applicant", header: "申請者", className: "w-32", cell: (r) => r.applicant },
  {
    key: "amount",
    header: "金額",
    align: "right",
    className: "w-28",
    cell: (r) => `${r.amount.toLocaleString()} 円`,
  },
];

/**
 * Table は列定義とデータを渡して一覧を描画するコンポーネント。
 *
 * <important>
 * サーバーレンダリング側の一覧はテンプレートで描画する。Table は使わない。
 * テンプレート側の見本は Foundations の「テーブル」を参照。
 * </important>
 */
const meta = {
  title: "コンポーネント/Table",
  component: Table,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
## 目的

一覧の見た目（外枠・ヘッダー・行の区切り・寄せ）と**空状態**を統一する。
空状態のメッセージを prop で必ず意識させることで、
「0 件のときに何も表示されない画面」が生まれないようにしている。

## 使う場面

- React コンポーネント内の一覧表示
- 数十行程度までの表

## 使わない場面

| 場面 | 代わりに使うもの |
|---|---|
| サーバーレンダリングの一覧画面 | テンプレートの \`{% for %}\` で描画。Foundations の HTML を使う |
| ソート・ページング・絞り込みの実装 | **Table は持たない。** 業務ロジックなのでアプリ側で実装し、結果を \`rows\` に渡す |
| 数百行以上の表示 | 仮想スクロールやページングを別途検討する（Table は全行を描画する） |
| 数値の集計・編集ができる表 | 表計算的な UI が必要。Table の範囲外 |
| 項目が 2〜3 個で縦に読ませたい | テーブルではなく \`DescriptionList\` を使う |
| 1 行しかない、割合が 100% になる | 表にせず文章で書く（decisions/adr-0009） |

## 枠の有無（\`variant\`）

| variant | 使う場面 |
|---|---|
| \`framed\`（既定） | 一覧画面の主となる表など、作業領域として境界が要るとき |
| \`plain\` | \`PageSection\` や \`Card\` の中、ページの地の上。面の中に面を作らない |

テンプレート側の \`.data-table\` は \`plain\` と同じ見た目。

## Props

\`\`\`ts
type TableColumn<T> = {
  key: string                                       // React の key
  header: React.ReactNode                           // ヘッダーの表示内容
  cell: (row: T, rowIndex: number) => React.ReactNode  // セルの内容
  align?: 'left' | 'center' | 'right'               // 寄せ（既定 left）
  className?: string                                // 列幅など（例: 'w-32'）
  headerClassName?: string                          // ヘッダーセルだけに付ける
}
\`\`\`

| Prop | 説明 |
|---|---|
| \`columns\` / \`rows\` | 列定義とデータ |
| \`rowKey\` | 行の key を返す関数。**並び替えがある場合は必須** |
| \`emptyMessage\` / \`emptySubMessage\` | 0 件時の表示 |
| \`onRowClick\` | 行クリック時の処理。渡すとホバーとカーソルが付く |
| \`caption\` | 表の用途を支援技術に伝える説明（視覚的には非表示） |

## 注意事項

- **\`rowKey\` を省略すると index が使われる。** 並び替え・絞り込みで行が入れ替わると
  React が別の行を再利用して表示が壊れるため、id があるなら必ず渡す
- **数値は \`align: 'right'\` + \`toLocaleString()\`。** 桁が揃って比較しやすくなる
- **\`onRowClick\` だけで操作を提供しない。** \`<tr>\` はキーボードでフォーカスできないため、
  行内にリンクかボタンを置くこと（\`onRowClick\` は補助）
- \`caption\` を渡すと \`<caption class="sr-only">\` になる。
  同じ画面に表が複数あるときは付けたほうが区別できる
- 横スクロールは内部の \`overflow-x-auto\` が受ける。列を詰め込みすぎないこと
- モバイルでは列数を減らす検討をする（\`className\` に \`hidden md:table-cell\` を付ける）
- **並び替えはロジックを持たない。** 列に \`sortable\`、Table に \`sort\` / \`onSortChange\` を渡すと
  ヘッダーがボタンになり矢印と \`aria-sort\` を描く。rows を並び替えるのは呼び出し側（またはサーバー）
- **行選択は \`selection\`（\`rowKey\` 必須）。** 選択中の key 一式で \`onChange\` が呼ばれる。
  一括操作のボタンは表の**上**に置く
- **固定ヘッダは \`stickyHeader\` + \`maxHeight\`。** 表がスクロール容器になるため高さ制限が要る
        `,
      },
    },
  },
  argTypes: {
    columns: { table: { disable: true } },
    rows: { table: { disable: true } },
    rowKey: { table: { disable: true } },
    onRowClick: { table: { disable: true } },
    emptyMessage: { control: "text" },
    emptySubMessage: { control: "text" },
    caption: { control: "text" },
  },
  args: {
    columns: COLUMNS as TableColumn<unknown>[],
    rows: ROWS,
    caption: "申請の一覧",
  },
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * データあり / 0 件 / 操作列つきを 1 画面で比較する。
 *
 * 一覧を作るときに最初に決めるのは「0 件のとき何を出すか」。
 * `emptyMessage` を渡さない一覧を作らない。
 */
export const Overview: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Showcase className="max-w-none">
      <Section title="Default" note="数値は align='right' + toLocaleString() で桁を揃える。">
        <Table<Request>
          columns={COLUMNS}
          rows={ROWS.slice(0, 3)}
          rowKey={(r) => r.id}
          caption="申請の一覧"
        />
      </Section>

      <Section
        title="Empty"
        note="0 件は必ず文章で伝える。emptySubMessage には次にすべき操作を書く。"
      >
        <div className="space-y-4">
          <Table<Request>
            columns={COLUMNS}
            rows={[]}
            emptyMessage="申請がありません"
            emptySubMessage="「新規申請」から作成してください"
            caption="申請の一覧（0 件）"
          />
          <Table<Request>
            columns={COLUMNS}
            rows={[]}
            emptyMessage="検索条件に一致する申請が見つかりませんでした"
            caption="申請の一覧（検索結果 0 件）"
          />
        </div>
      </Section>

      <Section
        title="With Actions"
        note="行の操作は右端に置く。tr はフォーカスできないため、操作は行内のボタン・リンクで提供する。"
      >
        <Table<Request>
          columns={[
            ...COLUMNS.slice(0, 3),
            {
              key: "actions",
              header: "",
              align: "right",
              className: "w-12",
              cell: () => (
                <Dropdown
                  trigger={
                    <Button variant="ghost" size="icon" aria-label="操作メニュー">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  }
                  items={[
                    { key: "edit", label: "編集" },
                    { key: "delete", label: "削除", danger: true, separatorBefore: true },
                  ]}
                />
              ),
            },
          ]}
          rows={ROWS.slice(0, 3)}
          rowKey={(r) => r.id}
          caption="申請の一覧（操作列つき）"
        />
      </Section>
    </Showcase>
  ),
};

/** 基本形。 */
export const Default: Story = {
  args: { rowKey: (r) => (r as Request).id },
};

/**
 * 0 件のとき。
 *
 * **必ず `emptyMessage` を渡す。** 何も表示しないと、
 * 読み込み失敗なのかデータが無いのか区別できない。
 * `emptySubMessage` には「次に何をすればよいか」を書く。
 */
export const Empty: Story = {
  args: {
    rows: [],
    emptyMessage: "申請がありません",
    emptySubMessage: "「新規申請」から作成してください",
  },
};

/** `emptySubMessage` を省略した場合（最低限だが、行き止まりになりやすい）。 */
export const EmptyMinimal: Story = {
  args: { rows: [], emptyMessage: "検索条件に一致する申請が見つかりませんでした" },
};

/**
 * 行クリックで詳細へ移動する例。
 *
 * `<tr>` はキーボードでフォーカスできないため、
 * **件名をリンクにして本来の操作経路を確保している**。
 * `onRowClick` はマウス利用者向けの補助でしかない。
 */
export const RowClickable: Story = {
  args: {
    rowKey: (r) => (r as Request).id,
    columns: [
      COLUMNS[0],
      {
        key: "title",
        header: "件名",
        cell: (r) => (
          <a
            href="#"
            className="text-primary underline-offset-2 hover:underline"
            onClick={(e) => e.preventDefault()}
          >
            {(r as Request).title}
          </a>
        ),
      },
      ...COLUMNS.slice(2),
    ] as TableColumn<unknown>[],
    onRowClick: () => {},
  },
};

/**
 * 操作列を持つ例。
 *
 * 操作は右端に置き、`align: 'right'` で寄せる。
 * 項目が 3 つ以上ならボタンを並べずメニューにまとめる。
 */
export const WithActions: Story = {
  args: {
    rowKey: (r) => (r as Request).id,
    columns: [
      ...COLUMNS,
      {
        key: "actions",
        header: <span className="sr-only">操作</span>,
        align: "right",
        className: "w-12",
        cell: () => (
          <Dropdown
            trigger={
              <Button variant="ghost" size="sm" aria-label="操作メニュー">
                <MoreVertical />
              </Button>
            }
            items={[
              { key: "edit", label: "編集" },
              { key: "duplicate", label: "複製" },
              { key: "delete", label: "削除", danger: true, separatorBefore: true },
            ]}
          />
        ),
      },
    ] as TableColumn<unknown>[],
  },
};

/**
 * 行選択を持つ例。
 *
 * ヘッダーの「すべて選択」は、選択数に応じて `indeterminate` を計算する。
 * 選択に対する操作は表の上に置く（下に置くとスクロールで見えなくなる）。
 */
export const WithRowSelection: Story = {
  render: () => {
    const [selected, setSelected] = React.useState<number[]>([2]);

    const allChecked = selected.length === ROWS.length;
    const someChecked = selected.length > 0 && !allChecked;

    const columns: TableColumn<Request>[] = [
      {
        key: "select",
        className: "w-10",
        header: (
          <Checkbox
            aria-label="すべて選択"
            checked={allChecked}
            indeterminate={someChecked}
            onCheckedChange={(checked) => setSelected(checked ? ROWS.map((r) => r.id) : [])}
          />
        ),
        cell: (row) => (
          <Checkbox
            aria-label={`${row.title} を選択`}
            checked={selected.includes(row.id)}
            onCheckedChange={(checked) =>
              setSelected((prev) =>
                checked ? [...prev, row.id] : prev.filter((id) => id !== row.id),
              )
            }
          />
        ),
      },
      ...COLUMNS,
    ];

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">{selected.length} 件を選択中</p>
          <Button variant="danger" size="sm" disabled={selected.length === 0}>
            一括削除
          </Button>
        </div>
        <Table<Request>
          columns={columns}
          rows={ROWS}
          rowKey={(r) => r.id}
          caption="申請の一覧（選択可能）"
        />
      </div>
    );
  },
};

/**
 * モバイルで列を減らす例。
 *
 * ツールバーの Viewport を Mobile にすると、申請番号と申請者が隠れる。
 * 横スクロールに頼るより、**画面幅に応じて情報を落とす**ほうが読みやすい。
 */
export const Responsive: Story = {
  args: {
    rowKey: (r) => (r as Request).id,
    columns: [
      { ...COLUMNS[0], className: "w-40 hidden md:table-cell" },
      COLUMNS[1],
      COLUMNS[2],
      { ...COLUMNS[3], className: "w-32 hidden lg:table-cell" },
      COLUMNS[4],
    ] as TableColumn<unknown>[],
  },
  parameters: {
    viewport: { defaultViewport: "mobile" },
  },
};

/**
 * 並び替えの状態表示。Table は矢印と aria-sort を描くだけで、rows の並び替えは画面側。
 * サーバーで並び替える画面では onSortChange で URL（?sort=&dir=）を書き換えて再取得する。
 */
export const Sortable: Story = {
  render: () => {
    const [sort, setSort] = React.useState<TableSort | null>({ key: "amount", direction: "desc" });
    const sortedRows = React.useMemo(() => {
      if (!sort) return ROWS;
      const dir = sort.direction === "asc" ? 1 : -1;
      return [...ROWS].sort((a, b) => {
        const av = a[sort.key as keyof Request];
        const bv = b[sort.key as keyof Request];
        return (av > bv ? 1 : av < bv ? -1 : 0) * dir;
      });
    }, [sort]);
    const columns: TableColumn<Request>[] = COLUMNS.map((c) =>
      c.key === "code" || c.key === "amount" || c.key === "applicant" ? { ...c, sortable: true } : c,
    );
    return (
      <Table<Request>
        columns={columns}
        rows={sortedRows}
        rowKey={(r) => r.id}
        sort={sort}
        onSortChange={setSort}
        caption="申請の一覧（並び替え可能）"
      />
    );
  },
};

/**
 * 行選択。`selection` を渡すと先頭に選択列が付き、全選択（中間状態つき）も部品が持つ。
 * 選択に対する操作は表の上に置く。
 */
export const Selectable: Story = {
  render: () => {
    const [selected, setSelected] = React.useState<(string | number)[]>([2]);
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">{selected.length} 件を選択中</p>
          <Button variant="danger" size="sm" disabled={selected.length === 0}>
            一括削除
          </Button>
        </div>
        <Table<Request>
          columns={COLUMNS}
          rows={ROWS}
          rowKey={(r) => r.id}
          selection={{
            selectedKeys: selected,
            onChange: setSelected,
            isRowSelectable: (r) => r.status !== "done",
            ariaLabel: (r) => `${r.title} を選択`,
          }}
          caption="申請の一覧（選択可能。完了は選べない）"
        />
      </div>
    );
  },
};

/** 固定ヘッダ。表がスクロール容器になるので maxHeight と組で使う。 */
export const StickyHeader: Story = {
  render: () => (
    <Table<Request>
      columns={COLUMNS}
      rows={[...ROWS, ...ROWS, ...ROWS].map((r, i) => ({ ...r, id: i + 1, code: `SYS-2026-${String(i + 1).padStart(4, "0")}` }))}
      rowKey={(r) => r.id}
      stickyHeader
      maxHeight={240}
      caption="申請の一覧（固定ヘッダ）"
    />
  ),
};

/** 枠なし。PageSection の中やページの地の上に置く。テンプレートの .data-table と同じ見た目。 */
export const Plain: Story = {
  render: () => (
    <PageSection title="最近の申請" description="直近 4 件">
      <Table<Request>
        variant="plain"
        columns={COLUMNS}
        rows={ROWS}
        rowKey={(r) => r.id}
        caption="最近の申請"
      />
    </PageSection>
  ),
};
