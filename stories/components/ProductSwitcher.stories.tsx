import type { Meta, StoryObj } from "@storybook/react-vite";
import { ProductSwitcher, type ProductSwitcherItem } from "../../components/application/ProductSwitcher";
import { Section, Showcase } from "../_showcase";

const items: ProductSwitcherItem[] = [
  {
    key: "ledger",
    name: "ledger",
    monogram: "le",
    description: "家計と固定費の記録",
    href: "#ledger",
    current: true,
  },
  { key: "library", name: "library", monogram: "li", description: "動画・写真のライブラリ", href: "#library" },
  { key: "reader", name: "reader", monogram: "re", description: "RSS リーダーとブックマーク", href: "#reader" },
  { key: "words", name: "words", description: "英単語を間隔反復で覚える", href: "#words" },
];

const meta = {
  title: "コンポーネント/ProductSwitcher",
  component: ProductSwitcher,
  args: { items },
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
**ProductSwitcher** は、同じ組織の別プロダクトへ移るための切り替え（ヘッダー右上の 9 点アイコン）です。

- 一覧は \`items\` で渡します。**一覧の取得はしません。** どこから得るか（設定・共有 JSON・API）は利用側が決めます（ADR-0003）。
- 現在のプロダクトは \`current: true\`。行に \`aria-current="page"\` とチェックが付きます。
- 別ドメインへの遷移でも同じタブで開きます（\`target\` は付けません）。
- 同じプロダクトの中の画面・アプリの切り替えには使いません（それはヘッダー左のナビゲーションの役目です）。
        `,
      },
    },
  },
} satisfies Meta<typeof ProductSwitcher>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <Showcase>
      <Section
        title="In Header"
        note="ヘッダー右端、アバターの左に置く。押すとパネルが右端揃えで開く。"
      >
        <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
          <span className="text-sm font-extrabold text-foreground">ledger</span>
          <div className="flex-1" />
          <ProductSwitcher {...args} title="組織のプロダクト" />
          <span className="flex size-8 items-center justify-center rounded-full bg-primary text-xs font-extrabold text-primary-foreground">
            le
          </span>
        </div>
      </Section>
    </Showcase>
  ),
};

/** 一覧が取れず自分だけのとき。壊れずに自分の行だけを出す。 */
export const OnlySelf: Story = {
  args: { items: items.slice(0, 1) },
};
