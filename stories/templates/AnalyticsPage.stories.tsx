import type { Meta, StoryObj } from "@storybook/react-vite";
import { BarChart3, FileText, Inbox, LayoutDashboard, Pencil } from "lucide-react";
import {
  Button,
  CopyButton,
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemSeparator,
  ItemTitle,
  PageHeader,
  PageSection,
  Stat,
  StatGroup,
  Table,
  type TableColumn,
} from "../../components/application";
import { StandardShell } from "./_shell";

/**
 * 集計画面。主指標（StatGroup）+ PageSection の節（内訳の表・切り口別の内訳・配布物）。
 */
const meta = {
  title: "テンプレート/集計画面",
  parameters: {
    layout: "fullscreen",
    controls: { disable: true },
    docs: {
      description: {
        component: `
## 目的

1 つの対象（お知らせ・キャンペーン・フォーム等）の反応を集計して見せる画面の構成を固定する。
カードを並べると、主指標も参考値も同じ重さに見え、何が重要か読み取れなくなる（decisions/adr-0009）。

\`\`\`
1. PageHeader     パンくず → 見出し（対象の名前）→ 説明 → 主操作（右）
2. 主指標         StatGroup。主指標 1 つだけ size="lg"、補助の値は小さく。参考値・0 件の値は注記へ
3. 節             PageSection を divider で区切って縦に並べる（Card で囲まない）
   - 内訳の表     Table variant="plain"
   - 切り口別     同じ母数を切り口ごとに見せるなら、1 つの節の中で列に並べる
   - 1 行の内訳   表にせず文章で書く
   - 配布物       1 つずつ操作する対象なので Item で並べる
\`\`\`

| 決めごと | ルール |
|---|---|
| 主役 | 主指標 1 つ。大きさと位置で示し、枠の色・背景色・アクセント色で示さない |
| 参考値 | 値が 0 や参考程度のものは Stat にせず、主指標の下の注記へ |
| 節 | PageSection。注記は \`description\` に置き、節の外へ浮かせない |
| 割合の棒 | 色は付けない（中立の色）。色を付けるのは警告など意味があるときだけ |
| 切り口別 | ブラウザ・OS・デバイスのような切り口違いは、カードに分けず 1 つの節で列にする |

## 使わない場面

| 場面 | 代わりに使うもの |
|---|---|
| 複数の対象を並べて比べる | 一覧画面（Table）。各行に主な数値を置く |
| 時系列の推移が主役 | チャート（利用側で選定）を主指標の下に置く |
        `,
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const NAV = [
  { label: "ダッシュボード", href: "#dashboard", icon: <LayoutDashboard className="mr-2 size-4" /> },
  { label: "お知らせ", href: "#notices", icon: <Inbox className="mr-2 size-4" /> },
  { label: "反応の集計", href: "#analytics", icon: <BarChart3 className="mr-2 size-4" />, active: true },
  { label: "レポート", href: "#reports", icon: <FileText className="mr-2 size-4" /> },
];

type ChannelRow = { channel: string; clicks: number; unique: number };

const CHANNELS: ChannelRow[] = [
  { channel: "社内ポータル", clicks: 52, unique: 46 },
  { channel: "メール", clicks: 12, unique: 11 },
];

const TOTAL_CLICKS = CHANNELS.reduce((sum, r) => sum + r.clicks, 0);

const BREAKDOWN = [
  { title: "ブラウザ", items: [["Chrome", 32], ["Edge", 19], ["Safari", 13]] },
  { title: "OS", items: [["Windows", 39], ["Android", 11], ["iOS", 10], ["macOS", 4]] },
  { title: "デバイス", items: [["PC", 43], ["スマートフォン", 21]] },
] as const;

const DISTRIBUTION = [
  { channel: "社内ポータル", url: "https://example.test/r/DjbU4YFoNKM" },
  { channel: "メール", url: "https://example.test/r/Qm7Hc2LwP0a" },
];

const percent = (count: number) => `${Math.round((count / TOTAL_CLICKS) * 1000) / 10}%`;

/** 割合の棒。色は付けず、長さだけで比べさせる */
function ShareBar({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted" aria-hidden="true">
        <div className="h-full rounded-full bg-muted-foreground/60" style={{ width: percent(count) }} />
      </div>
      <span className="w-12 text-right text-xs tabular-nums text-muted-foreground">{percent(count)}</span>
    </div>
  );
}

const CHANNEL_COLUMNS: TableColumn<ChannelRow>[] = [
  { key: "channel", header: "チャネル", cell: (r) => r.channel },
  { key: "clicks", header: "クリック", align: "right", className: "w-24 tabular-nums", cell: (r) => r.clicks },
  { key: "unique", header: "ユニーク", align: "right", className: "w-24 tabular-nums", cell: (r) => r.unique },
  { key: "share", header: "割合", className: "w-56", cell: (r) => <ShareBar count={r.clicks} /> },
];

/** お知らせ 1 件の反応の集計。 */
export const NoticeReaction: Story = {
  render: () => (
    <StandardShell appName="DX ポータル" nav={NAV}>
      <div className="max-w-5xl">
        <PageHeader
          breadcrumbs={[{ label: "反応の集計", href: "#analytics" }, { label: "第 1 号" }]}
          title="社内報 第 1 号：AI の「それっぽいけど違う」回答にご用心"
          description={<span className="font-mono text-xs">https://example.test/magazine/1/</span>}
          actions={
            <Button variant="primary" leftIcon={<Pencil />}>
              編集
            </Button>
          }
        />

        <StatGroup aria-label="主な指標">
          <Stat size="lg" label="ユニーク（主指標）" value="57" unit="人" />
          <Stat label="総クリック" value={String(TOTAL_CLICKS)} unit="回" />
        </StatGroup>
        <p className="mt-2 text-xs text-muted-foreground">
          開封 0（参考値。メールソフトが画像を読み込まない設定だと少なく出ます）・ 自動アクセスとして除外 0
        </p>

        <PageSection divider title="チャネル別" className="mt-8">
          <Table<ChannelRow>
            variant="plain"
            columns={CHANNEL_COLUMNS}
            rows={CHANNELS}
            rowKey={(r) => r.channel}
            caption="チャネル別のクリック数"
          />
        </PageSection>

        <PageSection
          divider
          title="環境別（クリック）"
          description="スマートフォンの割合が高いときは、遷移先が狭い画面で読めるか確認してください。判別できないものは「不明」にまとめています。"
        >
          <div className="grid gap-x-10 gap-y-6 sm:grid-cols-3">
            {BREAKDOWN.map((b) => (
              <div key={b.title} className="min-w-0">
                <h3 className="mb-2 text-xs font-medium text-muted-foreground">{b.title}</h3>
                <ul className="space-y-2 text-sm">
                  {b.items.map(([name, count]) => (
                    <li key={name}>
                      <div className="mb-1 flex justify-between gap-3">
                        <span>{name}</span>
                        <span className="tabular-nums text-muted-foreground">{count}</span>
                      </div>
                      <div className="h-1 overflow-hidden rounded-full bg-muted" aria-hidden="true">
                        <div className="h-full rounded-full bg-muted-foreground/60" style={{ width: percent(count) }} />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </PageSection>

        <PageSection
          divider
          title="参照元"
          description="メールやチャットのアプリは参照元を送らないため「直接アクセス」に入ります"
        >
          <p className="text-sm">
            すべて直接アクセス（メール・チャット等）
            <span className="text-muted-foreground">
              {" "}
              — {TOTAL_CLICKS} クリック / 57 人
            </span>
          </p>
        </PageSection>

        <PageSection divider title="配布用 URL" description="チャネルごとに発行した URL。クリックはチャネル別に集計されます">
          <ItemGroup>
            {DISTRIBUTION.map((d, i) => (
              <div key={d.channel}>
                {i > 0 && <ItemSeparator />}
                <Item size="sm" className="px-0">
                  <ItemContent>
                    <ItemTitle>{d.channel}</ItemTitle>
                    <ItemDescription className="font-mono text-xs">{d.url}</ItemDescription>
                  </ItemContent>
                  <ItemActions>
                    <CopyButton value={d.url} size="sm" />
                    <Button variant="secondary" size="sm">
                      QR コード
                    </Button>
                  </ItemActions>
                </Item>
              </div>
            ))}
          </ItemGroup>
        </PageSection>
      </div>
    </StandardShell>
  ),
};
