import type { Meta, StoryObj } from "@storybook/react-vite";
import { FileText, Inbox, LayoutDashboard, Plus, Settings, Users } from "lucide-react";
import * as React from "react";
import {
  Badge,
  Button,
  Input,
  PageHeader,
  Pagination,
  Select,
  Stat,
  Table,
  type TableColumn,
  type TableSort,
} from "../../components/application";
import { StandardShell } from "./_shell";

/**
 * Standard App — 一般的な業務システム、管理画面、マスタ管理。
 *
 * Global Header（左: アプリ名 / 右: 通知・User Menu）+ 左 Sidebar + Page Header + Main。
 * Primary Action は Page Header の右。
 */
const meta = {
  title: "テンプレート/標準アプリ（Standard App）",
  parameters: {
    layout: "fullscreen",
    controls: { disable: true },
    docs: {
      description: {
        component: `
## 目的

Application UI Standard §7 の **Standard App** を、このキットの部品で組んだ実物。
一般的な業務システム・管理画面・マスタ管理の起点。

\`\`\`
+--------------------------------------------------------------+
| Global Header: [アプリ名]                  [通知] [User Menu]  |
+----------+---------------------------------------------------+
| Sidebar  | PageHeader: [見出し]              [Primary Action] |
| (NavItem)+---------------------------------------------------+
|          | Stat 行 → 絞り込み → Table → Pagination            |
+----------+---------------------------------------------------+
\`\`\`

## 強く揃えるもの

- Header の位置と、右端の User Menu
- Sidebar の役割（主要ナビゲーション）と位置（左）
- Page Header の役割と、Primary Action の位置（右）

## アプリ要件で変えてよいもの

- Content 幅、Grid の列構成、Filter Bar、Dashboard Widget や情報密度

## 注意事項

- **シェル（base.html / layout）はアプリが所有する。** この Story はコピー元ではなく、位置と階層の見本
- 一覧の組み立て方は「パターン/一覧表」、テンプレートで描くなら「テンプレート/一覧画面（テンプレート版）」
        `,
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

type Request = { id: number; code: string; title: string; applicant: string; status: "new" | "active" | "done"; amount: number };
const STATUS: Record<Request["status"], string> = { new: "未対応", active: "対応中", done: "完了" };
const ROWS: Request[] = [
  { id: 1, code: "SYS-2026-0001", title: "備品購入（モニター 2 台）", applicant: "山田 太郎", status: "new", amount: 78000 },
  { id: 2, code: "SYS-2026-0002", title: "出張費精算（大阪）", applicant: "鈴木 花子", status: "active", amount: 45800 },
  { id: 3, code: "SYS-2026-0003", title: "書籍購入", applicant: "佐藤 次郎", status: "done", amount: 3200 },
  { id: 4, code: "SYS-2026-0004", title: "研修参加費", applicant: "田中 三郎", status: "done", amount: 120000 },
  { id: 5, code: "SYS-2026-0005", title: "名刺の追加発注", applicant: "山田 太郎", status: "active", amount: 6600 },
];

const NAV = [
  { label: "ダッシュボード", href: "#dashboard", icon: <LayoutDashboard className="mr-2 size-4" /> },
  { label: "申請一覧", href: "#requests", icon: <Inbox className="mr-2 size-4" />, active: true, badge: 12 },
  { label: "レポート", href: "#reports", icon: <FileText className="mr-2 size-4" /> },
  { label: "ユーザー", href: "#users", icon: <Users className="mr-2 size-4" /> },
  { label: "設定", href: "#settings", icon: <Settings className="mr-2 size-4" /> },
];

/** 一覧画面。Stat 行 + 絞り込み + Table + Pagination。 */
export const ListScreen: Story = {
  render: () => {
    const [sort, setSort] = React.useState<TableSort | null>({ key: "code", direction: "asc" });
    const [selected, setSelected] = React.useState<(string | number)[]>([]);
    const [page, setPage] = React.useState(1);
    const columns: TableColumn<Request>[] = [
      { key: "code", header: "申請番号", className: "w-40", sortable: true, cell: (r) => <span className="font-mono text-xs">{r.code}</span> },
      { key: "title", header: "件名", cell: (r) => <a href="#" className="hover:underline">{r.title}</a> },
      { key: "status", header: "ステータス", className: "w-28", cell: (r) => <Badge tone={r.status}>{STATUS[r.status]}</Badge> },
      { key: "applicant", header: "申請者", className: "w-32", sortable: true, cell: (r) => r.applicant },
      { key: "amount", header: "金額", className: "w-32", align: "right", sortable: true, cell: (r) => `${r.amount.toLocaleString()} 円` },
    ];
    return (
      <StandardShell appName="DX ポータル" nav={NAV}>
        <PageHeader
          title="申請一覧"
          description="経費・備品の申請を確認し、対応状況を更新します"
          actions={
            <Button variant="primary" leftIcon={<Plus />}>
              新規申請
            </Button>
          }
        />
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="未対応" value="12" unit="件" delta="+3 前週比" tone="negative" />
          <Stat label="対応中" value="38" unit="件" delta="±0" tone="neutral" />
          <Stat label="今月の完了" value="27" unit="件" delta="+9 前月比" tone="positive" />
          <Stat label="期限超過" value="4" unit="件" delta="要確認" tone="warning" />
        </div>
        <div className="mb-3 flex flex-wrap items-end gap-3">
          <Input placeholder="件名・申請番号で検索" aria-label="検索" className="max-w-xs" />
          <Select
            items={[
              { value: "", label: "すべてのステータス" },
              { value: "new", label: "未対応" },
              { value: "active", label: "対応中" },
              { value: "done", label: "完了" },
            ]}
            placeholder="ステータス"
            aria-label="ステータス"
          />
          {selected.length > 0 && (
            <div className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
              {selected.length} 件を選択中
              <Button variant="secondary" size="sm">
                担当者を割り当て
              </Button>
            </div>
          )}
        </div>
        <Table<Request>
          columns={columns}
          rows={ROWS}
          rowKey={(r) => r.id}
          sort={sort}
          onSortChange={setSort}
          selection={{ selectedKeys: selected, onChange: setSelected, ariaLabel: (r) => `${r.title} を選択` }}
          caption="申請の一覧"
        />
        <Pagination className="mt-4" page={page} totalCount={238} pageSize={20} onPageChange={setPage} pageSizeOptions={[20, 50, 100]} onPageSizeChange={() => setPage(1)} />
      </StandardShell>
    );
  },
};
