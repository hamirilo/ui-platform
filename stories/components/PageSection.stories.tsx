import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  DescriptionList,
  PageSection,
  Stat,
  StatGroup,
  Table,
  type TableColumn,
} from "../../components/application";
import { Section, Showcase } from "../_showcase";

type ChannelRow = { channel: string; clicks: number; unique: number };

const CHANNEL_ROWS: ChannelRow[] = [
  { channel: "Garoon", clicks: 52, unique: 46 },
  { channel: "メール", clicks: 12, unique: 11 },
];

const CHANNEL_COLUMNS: TableColumn<ChannelRow>[] = [
  { key: "channel", header: "チャネル", cell: (r) => r.channel },
  { key: "clicks", header: "クリック", align: "right", className: "w-24", cell: (r) => r.clicks },
  { key: "unique", header: "ユニーク", align: "right", className: "w-24", cell: (r) => r.unique },
];

const BREAKDOWN = [
  { title: "ブラウザ", items: [["Chrome", 32], ["Edge", 19], ["Safari", 13]] },
  { title: "OS", items: [["Windows", 39], ["Android", 11], ["iOS", 10], ["macOS", 4]] },
  { title: "デバイス", items: [["PC", 43], ["スマートフォン", 21]] },
] as const;

/**
 * PageSection はページの地の上に置く節。面（枠・背景・影）を持たず、見出しと余白でまとまりを作る。
 */
const meta = {
  title: "コンポーネント/PageSection",
  component: PageSection,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
## 目的

まとまりを **Card ではなく見出しと余白で作る**ための部品（decisions/adr-0009）。
面を持たないので、画面に箱が並ばず、主役（大きな値・主となる一覧）が目立つ。
テンプレート側の \`.page-section\` と同じ見た目。

## 使う場面

- 詳細画面の各節（申請内容・承認履歴…）
- 集計・分析画面の各節（チャネル別・環境別…）
- 設定画面の項目群

## 使わない場面

| 場面 | 代わりに使うもの |
|---|---|
| 同じ形のものが並び、1 つずつ開く・選ぶ・操作する | \`Card\`（一覧の各項目、選択肢） |
| 画面全体の見出しと主操作 | \`PageHeader\` |
| 開閉して補助情報を隠す | \`Accordion\` |

## 注意事項

- 見出しは既定で h2。PageSection の中に PageSection を置くときは \`headingLevel={3}\` にする
- 注記は \`description\` に置く。節の下に浮かせると、どの節の話か読み手が対応づけることになる
- \`divider\` は節が長い・続けて並ぶなど、境目が読み取りにくいときだけ付ける
- 中の Table は \`variant="plain"\`、並べる Stat は \`StatGroup\` で包む。面の中に面を作らない
        `,
      },
    },
  },
  args: {
    title: "チャネル別",
    description: "クリックの多い順",
    children: null,
  },
} satisfies Meta<typeof PageSection>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 同じ集計を Card で区切った場合と、PageSection で区切った場合を比べる。 */
export const Overview: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Showcase>
      <Section
        title="避ける: Card で区切る"
        note="箱がすべて同じ重さで並び、主指標も参考値も同じに見える。切り口違いの集計が 3 枚のカードに分かれている。"
      >
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <Stat label="ユニーク（主指標）" value="57" />
            <Stat label="総クリック" value="64" />
            <Stat label="開封（参考値）" value="0" />
          </div>
          <Card>
            <CardHeader>
              <CardTitle>チャネル別</CardTitle>
            </CardHeader>
            <CardContent>
              <Table<ChannelRow> columns={CHANNEL_COLUMNS} rows={CHANNEL_ROWS} rowKey={(r) => r.channel} />
            </CardContent>
          </Card>
          <div className="grid gap-4 sm:grid-cols-3">
            {BREAKDOWN.map((b) => (
              <Card key={b.title} size="sm">
                <CardHeader>
                  <CardTitle>{b.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <BreakdownList items={b.items} />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Section>

      <Section
        title="推奨: PageSection で区切る"
        note="主指標だけを大きくし、参考値は注記へ下げる。節は見出しと区切り線で分け、表と内訳は地の上に置く。"
      >
        <div>
          <StatGroup>
            <Stat size="lg" label="ユニーク（主指標）" value="57" unit="人" />
            <Stat label="総クリック" value="64" />
          </StatGroup>
          <p className="mt-2 text-xs text-muted-foreground">
            開封 0（参考値。Outlook は画像を読み込まないため少なく出ます）
          </p>

          <PageSection divider title="チャネル別" className="mt-6">
            <Table<ChannelRow>
              variant="plain"
              columns={CHANNEL_COLUMNS}
              rows={CHANNEL_ROWS}
              rowKey={(r) => r.channel}
            />
          </PageSection>

          <PageSection divider title="環境別（クリック）" description="判別できないものは「不明」にまとめています">
            <div className="grid gap-6 sm:grid-cols-3">
              {BREAKDOWN.map((b) => (
                <div key={b.title}>
                  <h3 className="mb-2 text-xs font-medium text-muted-foreground">{b.title}</h3>
                  <BreakdownList items={b.items} />
                </div>
              ))}
            </div>
          </PageSection>
        </div>
      </Section>
    </Showcase>
  ),
};

/** 基本形。見出しと本文だけ。 */
export const Default: Story = {
  render: (args) => (
    <PageSection {...args}>
      <Table<ChannelRow>
        variant="plain"
        columns={CHANNEL_COLUMNS}
        rows={CHANNEL_ROWS}
        rowKey={(r) => r.channel}
      />
    </PageSection>
  ),
};

/** 詳細画面の節。操作は見出しの右に置き、項目は DescriptionList で並べる。 */
export const WithActions: Story = {
  render: () => (
    <div className="max-w-3xl">
      <PageSection
        title="申請内容"
        actions={
          <Button variant="secondary" size="sm">
            編集
          </Button>
        }
      >
        <DescriptionList
          columns={2}
          items={[
            { term: "申請番号", description: "SYS-2026-0001" },
            { term: "申請者", description: "山田 太郎" },
            { term: "件名", description: "備品購入（モニター 2 台）" },
            { term: "金額", description: "78,000 円" },
          ]}
        />
      </PageSection>
      <PageSection divider title="承認履歴" description="新しい順">
        <p className="text-sm text-muted-foreground">まだ承認されていません。</p>
      </PageSection>
    </div>
  ),
};

function BreakdownList({ items }: { items: ReadonlyArray<readonly [string, number]> }) {
  return (
    <ul className="space-y-1.5 text-sm">
      {items.map(([name, count]) => (
        <li key={name} className="flex justify-between gap-3">
          <span>{name}</span>
          <span className="tabular-nums text-muted-foreground">{count}</span>
        </li>
      ))}
    </ul>
  );
}
