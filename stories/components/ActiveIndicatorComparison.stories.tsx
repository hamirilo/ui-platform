import type { Meta, StoryObj } from "@storybook/react-vite";
import { Archive, Inbox, Pin, Send, Trash2 } from "lucide-react";
import * as React from "react";
import { ActiveIndicator } from "../../components/application";
import { cn } from "../../lib/utils";
import { FadeIndicator, NavList } from "./_active-indicator-css";

/**
 * ActiveIndicator を framer-motion で実装し続けるかを決めるための比較。
 * 3 つを同じ操作で同時に動かし、見た目の差だけを見る。
 */
const meta = {
  title: "コンポーネント/ActiveIndicator/実装比較（試作）",
  parameters: {
    layout: "padded",
    controls: { disable: true },
    docs: {
      description: {
        component: `
## 何を比べているか

現行の \`ActiveIndicator\` は Framer Motion の Shared Layout（\`layoutId\`）で
指標を項目間で移動させている。**このためだけに \`framer-motion\` が依存に入っている。**

| 利用側の import | bundle (gzip) |
|---|---|
| \`Button\` / \`Input\` / \`Table\` / \`Dialog\` / \`Badge\` | 43 KB |
| 上記 + \`NavItem\` | 83 KB |

一方 \`tokens/motion.css\` は冒頭でこう宣言している。

> 実装は CSS transform + cubic-bezier を使い、framer-motion 等ライブラリに依存しない。
> \`--motion-duration-base: 200ms\` … ナビ切り替え・ハイライト移動等

**Token 側は最初から CSS 実装を前提にしていて、framer-motion の方が逸脱している。**

## 3 案

| 案 | 動き | API | bundle |
|---|---|---|---|
| 現行（framer-motion） | 移動する | 項目だけ置けばよい | +40 KB |
| A: フェードのみ | その場で現れる | 変わらない（差し替えるだけ） | 0 |
| B: 移動する（CSS） | 移動する | 親 \`NavList\` が要る | 0 |

左の項目をクリックすると 3 つが同時に動く。見るべきは「移動が要るか」と、
要るなら「API が変わる代償を払うか」の 2 点。

\`prefers-reduced-motion: reduce\` では A / B とも duration が 0 になる
（\`tokens/motion.css\` が Token をゼロ化するため）。
        `,
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const ITEMS = [
  { label: "受信トレイ", icon: <Inbox className="size-4" /> },
  { label: "送信済み", icon: <Send className="size-4" /> },
  { label: "ピン留め", icon: <Pin className="size-4" /> },
  { label: "アーカイブ", icon: <Archive className="size-4" /> },
  { label: "ゴミ箱", icon: <Trash2 className="size-4" /> },
];

/** 3 案に共通の項目の見た目。指標の描き方だけが案ごとに違う。 */
const ITEM_CLASS =
  "relative flex w-full items-center gap-2 rounded-lg border border-transparent px-3 py-2 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring";

function Column({
  title,
  note,
  children,
}: {
  title: string;
  note: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 space-y-2">
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      <p className="min-h-10 text-xs text-muted-foreground">{note}</p>
      <div className="rounded-xl border border-border bg-card p-2">{children}</div>
    </div>
  );
}

export const 比較: Story = {
  render: function Comparison() {
    const [active, setActive] = React.useState(0);

    return (
      <div className="sb-unstyled max-w-5xl space-y-4">
        <div className="flex flex-col gap-6 md:flex-row">
          <Column title="現行（framer-motion）" note="移動する。+40KB gzip。">
            <div className="space-y-1">
              {ITEMS.map((item, i) => (
                <button
                  type="button"
                  key={item.label}
                  onClick={() => setActive(i)}
                  className={cn(
                    ITEM_CLASS,
                    active === i
                      ? "font-semibold text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {item.icon}
                    {item.label}
                  </span>
                  {active === i && <ActiveIndicator layoutId="compare-motion" />}
                </button>
              ))}
            </div>
          </Column>

          <Column title="A: フェードのみ（CSS）" note="その場で現れる。API 据え置き。0KB。">
            <div className="space-y-1">
              {ITEMS.map((item, i) => (
                <button
                  type="button"
                  key={item.label}
                  onClick={() => setActive(i)}
                  className={cn(
                    ITEM_CLASS,
                    active === i
                      ? "font-semibold text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {item.icon}
                    {item.label}
                  </span>
                  {active === i && <FadeIndicator />}
                </button>
              ))}
            </div>
          </Column>

          <Column title="B: 移動する（CSS）" note="移動する。親 NavList が要る。0KB。">
            <NavList className="space-y-1">
              {ITEMS.map((item, i) => (
                <button
                  type="button"
                  key={item.label}
                  data-active={active === i}
                  onClick={() => setActive(i)}
                  className={cn(
                    ITEM_CLASS,
                    active === i
                      ? "font-semibold text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {item.icon}
                    {item.label}
                  </span>
                </button>
              ))}
            </NavList>
          </Column>
        </div>

        <p className="text-xs text-muted-foreground">
          離れた項目へ飛ぶ（受信トレイ → ゴミ箱）と差が出やすい。
        </p>
      </div>
    );
  },
};
