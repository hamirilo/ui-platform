import type { Meta, StoryObj } from "@storybook/react-vite";
import { AlertCircle, CheckCircle2, Inbox } from "lucide-react";
import { PageSection, Stat, StatGroup } from "../../components/application";
import { Grid, Section, Showcase } from "../_showcase";

/**
 * Stat は KPI・統計タイル。値を主役に、ラベル・単位・増減・補足を定位置に置く。
 */
const meta = {
  title: "コンポーネント/Stat",
  component: Stat,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
## 目的

ダッシュボード・詳細画面の上部に並ぶ「件数・率・金額」の表示を統一する。
テンプレート側の \`.stat\` と同じ見た目。

## 使う場面

- 集計・分析画面の主指標と補助の値（\`StatGroup\` で枠なしに並べる。既定はこちら）
- 詳細画面の要約（受講者数・完了率など）
- ダッシュボードで、各値を 1 つずつ押して絞り込むなど「もの」として並べる KPI 行（タイルのまま並べる）

## 使わない場面

| 場面 | 代わりに使うもの |
|---|---|
| 項目名と値の組が多い（住所・電話・担当…） | \`DescriptionList\`（予定）。数値が主役でないなら Stat にしない |
| 時系列の推移 | チャート（利用側で選定） |
| 進捗率の可視化 | \`Progress\` |

## 注意事項

- **数値の整形は呼び出し側**（\`toLocaleString()\` 等）。部品は文字列をそのまま描く
- \`tone\` は増減（\`delta\`）の色。値そのものに色は付かない。「増えたら良い」指標か「減ったら良い」指標かで
  positive / negative を呼び出し側が決める
- **並べるときは \`StatGroup\` で包む。** タイルの枠が消え、区切り線で並ぶ。タイルのまま並べるのは、
  各値が 1 つずつ操作の対象になるときだけ（decisions/adr-0009）
- **主指標は 1 つだけ \`size="lg"\`。** 主役は大きさと位置で示し、枠の色や背景色を足さない
- 値が 0 の参考値や補足の件数は Stat にせず、注記（本文の小さい文字）へ下げる
- 枚数は 3〜5。それ以上なら Table にする
        `,
      },
    },
  },
  argTypes: {
    tone: { control: "select", options: ["neutral", "positive", "negative", "warning"] },
  },
  args: {
    label: "未対応",
    value: "12",
    unit: "件",
    delta: "+3 前週比",
    tone: "negative",
  },
} satisfies Meta<typeof Stat>;

export default meta;
type Story = StoryObj<typeof meta>;

/** KPI 行として並べたときの見た目と、tone・補足・アイコンの有無を比較する。 */
export const Overview: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Showcase>
      <Section title="KPI 行" note="同じ幅で 3〜5 枚。tone は増減の色で、値には付かない。">
        <Grid className="sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="未対応" value="12" unit="件" delta="+3 前週比" tone="negative" />
          <Stat label="対応中" value="38" unit="件" delta="±0" tone="neutral" />
          <Stat label="今月の完了" value="27" unit="件" delta="+9 前月比" tone="positive" />
          <Stat label="期限超過" value="4" unit="件" delta="要確認" tone="warning" />
        </Grid>
      </Section>

      <Section title="補足・アイコン付き" note="集計時点や母数は hint に。アイコンは意味の補助。">
        <Grid className="sm:grid-cols-3">
          <Stat
            label="完了率"
            value="86.5"
            unit="%"
            delta="+2.1pt"
            tone="positive"
            hint="2026-09-01 時点 · 受講対象 213 名"
            icon={<CheckCircle2 />}
          />
          <Stat label="受付" value="1,204" unit="件" hint="2026 年度累計" icon={<Inbox />} />
          <Stat label="未読の返信" value="7" unit="件" tone="warning" icon={<AlertCircle />} />
        </Grid>
      </Section>
    </Showcase>
  ),
};

/** 基本形。 */
export const Default: Story = {};

/** 値だけ。 */
export const ValueOnly: Story = {
  args: { label: "今月の申請", value: "1,204", unit: "件", delta: undefined, tone: "neutral" },
};

/** 主指標を大きく、補助の値を小さく、枠なしで並べる。集計画面の既定。 */
export const Group: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Showcase>
      <Section title="主指標 + 補助の値" note="size=lg は 1 画面に 1 つ。補助の値は小さく、区切り線で並べる。">
        <StatGroup>
          <Stat size="lg" label="ユニーク（主指標）" value="57" unit="人" />
          <Stat label="総クリック" value="64" />
          <Stat label="前回の周知" value="48" unit="人" delta="+9 前回比" tone="positive" />
        </StatGroup>
      </Section>

      <Section title="PageSection の中に置く" note="面の中に面を作らない。節の中では StatGroup で並べる。">
        <PageSection title="今月の対応状況" description="2026-10-01 〜 10-09">
          <StatGroup>
            <Stat label="未対応" value="12" unit="件" delta="+3 前週比" tone="negative" />
            <Stat label="対応中" value="38" unit="件" />
            <Stat label="完了" value="27" unit="件" delta="+9 前月比" tone="positive" />
          </StatGroup>
        </PageSection>
      </Section>
    </Showcase>
  ),
};
