import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { ActiveIndicator } from "../../components/application";
import { Section, Showcase } from "../_showcase";

const meta = {
  title: "コンポーネント/ActiveIndicator",
  component: ActiveIndicator,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
選択中の項目を示す装飾用インジケーターです。単体では操作を持たず、親要素に \`relative\` を設定して使います。
\`layoutId\` を共有した要素間では shared layout animation が働きます。
選択状態そのものは親側の \`aria-current\` などで伝えてください。

framer-motion に依存します（import した利用側のバンドルに gzip で約 40 kB 加わります）。
ページ遷移がフルリロードになる構成ではアニメーションが見えないため、ナビゲーションには
静的な背景を持つ \`NavItem\` を使い、移動を見せたい場合だけ \`AnimatedNavItem\` を使ってください。
        `,
      },
    },
  },
} satisfies Meta<typeof ActiveIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

const ITEMS = ["ダッシュボード", "アイデア一覧", "プロジェクト", "設定"];

function MovingExample() {
  const [active, setActive] = useState(0);

  return (
    <nav className="max-w-xs space-y-1" aria-label="サンプルナビゲーション">
      {ITEMS.map((item, index) => (
        <button
          key={item}
          type="button"
          onClick={() => setActive(index)}
          aria-current={active === index ? "page" : undefined}
          className="relative block w-full rounded-lg px-3 py-2 text-left text-sm"
        >
          {active === index && <ActiveIndicator layoutId="active-indicator-story" />}
          <span className="relative z-10">{item}</span>
        </button>
      ))}
    </nav>
  );
}

export const Overview: Story = {
  render: () => (
    <Showcase>
      <Section
        title="選択位置の移動"
        note="親要素が操作とアクセシビリティを持ち、ActiveIndicator は装飾だけを担当する"
      >
        <MovingExample />
      </Section>
    </Showcase>
  ),
};
