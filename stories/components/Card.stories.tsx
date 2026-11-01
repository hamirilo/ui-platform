import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Badge,
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/application";
import { Grid, Section, Showcase } from "../_showcase";

function MetricBody({ value, delta }: { value: string; delta: string }) {
  return (
    <div className="space-y-1">
      <p className="text-2xl font-semibold tabular-nums">{value}</p>
      <p className="text-xs text-muted-foreground">{delta}</p>
    </div>
  );
}

/**
 * Card は「もの」を並べるときの面。カテゴリ・状態の色は左罫線ではなく、タイトル行の下の罫線で示す。
 */
const meta = {
  title: "コンポーネント/Card",
  component: Card,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
## 目的

同じ形の「もの」（一覧の各項目・選択肢・指標）を面に載せて並べる。
まとまり（節）を作るだけなら \`PageSection\` を使う（decisions/adr-0009）。
shadcn/ui の Card と同じ組み立て（\`CardHeader\` / \`CardContent\` / \`CardFooter\`）に、
次の 2 つを足している。テンプレート側は \`.card-title-rule\` / \`.card-footer-band\`。

| prop | 値 | 使う場面 |
|---|---|---|
| \`titleRule\` | \`none\`（既定） | 区切りが要らない単独のカード |
| | \`neutral\` | 見出しと本文を分けるだけ。1px の border 色 |
| | \`accent\` | カテゴリ・警告など意味のある色を示すときだけ。2px、1 カード 1 色。色は \`accentColor\`（既定 \`var(--color-primary)\`） |
| \`footerVariant\` | \`plain\`（既定） | 操作ボタンを右に置くフッター（上に 1px の罫線） |
| | \`band\` | 補足の数値・注記を muted の帯に載せる。カード幅いっぱいに広がる |

## 注意事項

- 角丸のカードに \`border-l-*\` で色を付けない。太い直線が角の弧を切る（「基礎/角丸と影」）
- 罫線は \`CardHeader\` の直後に描かれる。\`CardHeader\` がなければ \`titleRule\` は何も描かない
- \`accentColor\` には Token（\`var(--color-*)\`）を渡す。raw color を書かない
- 罫線と帯の負のマージンは余白（\`--card-optical\`）から取る。\`className="p-6"\` で余白を上書きしない
        `,
      },
    },
  },
  args: {
    titleRule: "neutral",
    footerVariant: "plain",
  },
  argTypes: {
    titleRule: { control: "inline-radio", options: ["none", "neutral", "accent"] },
    footerVariant: { control: "inline-radio", options: ["plain", "band"] },
    accentColor: { control: "text" },
  },
  render: (args) => (
    <Card {...args} className="w-72">
      <CardHeader>
        <CardTitle>月間の受付件数</CardTitle>
        <CardAction>
          <Badge tone="active">集計中</Badge>
        </CardAction>
      </CardHeader>
      <CardContent>
        <MetricBody value="1,284 件" delta="前月比 +9.5%" />
      </CardContent>
      <CardFooter>直近 30 日 ｜ 1 日平均 42.8 件</CardFooter>
    </Card>
  ),
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** タイトル行の下の罫線を、なし / neutral / accent で比べる。 */
export const TitleRule: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Showcase>
      <Section
        title="titleRule"
        note="neutral が既定の区切り。accent は意味のある色を示すときだけ使い、1 カード 1 色にする。"
      >
        <Grid className="sm:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>none</CardTitle>
              <CardDescription>区切りが要らない単独のカード</CardDescription>
            </CardHeader>
            <CardContent>
              <MetricBody value="¥2,148" delta="前年同月比 +4.1%" />
            </CardContent>
          </Card>
          <Card titleRule="neutral">
            <CardHeader>
              <CardTitle>neutral</CardTitle>
              <CardDescription>見出しと本文を分けるだけ</CardDescription>
            </CardHeader>
            <CardContent>
              <MetricBody value="¥2,148" delta="前年同月比 +4.1%" />
            </CardContent>
          </Card>
          <Card titleRule="accent" accentColor="var(--color-warning)">
            <CardHeader>
              <CardTitle>accent</CardTitle>
              <CardAction>
                <Badge tone="warning">要確認</Badge>
              </CardAction>
            </CardHeader>
            <CardContent>
              <MetricBody value="¥2,436" delta="直近 30 回の上限を超過" />
            </CardContent>
          </Card>
        </Grid>
      </Section>

      <Section
        title="size"
        note="余白は見出しの文字サイズから導出されるため、罫線の負のマージンも size に追従してカードの縁まで届く。"
      >
        <Grid className="sm:grid-cols-3">
          {(["sm", "default", "lg"] as const).map((size) => (
            <Card key={size} size={size} titleRule="accent">
              <CardHeader>
                <CardTitle>size="{size}"</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">既定の accent は primary。</p>
              </CardContent>
            </Card>
          ))}
        </Grid>
      </Section>
    </Showcase>
  ),
};

/** フッターを muted の帯にする。補足の数値・注記を本文から分けて載せる。 */
export const FooterBand: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Showcase>
      <Section
        title="footerVariant"
        note="plain は操作ボタン向け（右寄せ・上に罫線）。band は補足を帯に載せ、カードの縁まで広げる。"
      >
        <Grid>
          <Card titleRule="neutral">
            <CardHeader>
              <CardTitle>plain（既定）</CardTitle>
            </CardHeader>
            <CardContent>
              <MetricBody value="1,284 件" delta="前月比 +9.5%" />
            </CardContent>
            <CardFooter>
              <span className="text-xs text-muted-foreground">直近 30 日</span>
            </CardFooter>
          </Card>
          <Card titleRule="accent" footerVariant="band">
            <CardHeader>
              <CardTitle>band</CardTitle>
              <CardAction>
                <Badge tone="active">集計中</Badge>
              </CardAction>
            </CardHeader>
            <CardContent>
              <MetricBody value="1,284 件" delta="前月比 +9.5%" />
            </CardContent>
            <CardFooter>直近 30 日 ｜ 1 日平均 42.8 件</CardFooter>
          </Card>
        </Grid>
      </Section>
    </Showcase>
  ),
};
