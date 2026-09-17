import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Rating } from "../../components/application";
import { Section, Showcase } from "../_showcase";

/**
 * Rating は星による評価。`onChange` を渡すと入力、渡さなければ表示専用になる。
 */
const meta = {
  title: "コンポーネント/Rating",
  component: Rating,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
## 目的

「点数を付ける」と「点数を読む」を 1 つの形に固定する。
テンプレート側の \`.rating\` と同じ見た目で、入力は Islands の \`rating\`。

## 使う場面

- 5 段階の満足度・評価の入力（フォーム）
- 一覧・詳細での点数の表示

## 使わない場面

| 場面 | 代わりに使うもの |
|---|---|
| 「また買う / もう買わない」のような意思の選択 | \`RadioGroup\` / \`ButtonGroup\`。星は量であって意思ではない |
| 0〜100 の連続値 | \`Progress\` か数値入力 |
| 平均値の比較を並べる | 数値（\`Stat\`）。星は 1 件の印象を読ませるもの |

## 注意事項

- **一覧に何十個も並ぶ表示専用の星は Island にしない**。テンプレート側の \`.rating\` で
  サーバーが描く（見た目が変わるだけのものに React を載せても得がない）
- 星の色は \`--color-warning\`。raw な amber を使わない
- \`value={0}\` は未評価。\`showValue\` を付けると \`emptyText\`（既定「未評価」）が出る
- 入力のとき Tab は 1 回だけ止まり、星の選択は矢印キーで動かす
        `,
      },
    },
  },
  argTypes: {
    size: { control: "select", options: ["sm", "md", "lg"] },
  },
  args: {
    value: 3,
    max: 5,
    size: "md",
    showValue: true,
  },
} satisfies Meta<typeof Rating>;

export default meta;
type Story = StoryObj<typeof meta>;

function Interactive() {
  const [score, setScore] = useState(0);
  return <Rating value={score} onChange={setScore} size="lg" showValue />;
}

/** 表示専用と入力、大きさ、未評価を見比べる。 */
export const Overview: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Showcase>
      <Section title="表示専用" note="onChange を渡さないと role=img。一覧・詳細で使う。">
        <div className="flex flex-col gap-2">
          <Rating value={5} showValue />
          <Rating value={3} showValue />
          <Rating value={0} showValue />
        </div>
      </Section>

      <Section title="入力" note="onChange を渡すと radiogroup。押しても矢印キーでも変えられる。">
        <Interactive />
      </Section>

      <Section title="大きさ" note="一覧は sm、詳細は md、フォームの主役は lg。">
        <div className="flex flex-col gap-2">
          <Rating value={4} size="sm" showValue />
          <Rating value={4} size="md" showValue />
          <Rating value={4} size="lg" showValue />
        </div>
      </Section>
    </Showcase>
  ),
};

/** 基本形。 */
export const Default: Story = {};

/** 未評価。 */
export const Empty: Story = {
  args: { value: 0 },
};

/** 入力（値を持つ）。 */
export const Editable: Story = {
  parameters: { controls: { disable: true } },
  render: () => <Interactive />,
};
