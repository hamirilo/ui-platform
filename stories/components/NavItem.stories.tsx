import type { Meta, StoryObj } from "@storybook/react-vite";
import { Archive, Clock, Heart, Inbox, Pin } from "lucide-react";
import { useState } from "react";
import { AnimatedNavItem } from "../../components/application/AnimatedNavItem";
import { NavItem } from "../../components/application/NavItem";
import { Section, Showcase } from "../_showcase";

const meta = {
  title: "コンポーネント/NavItem",
  component: NavItem,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
**NavItem** は、サイドバー等に並べる標準ナビゲーション項目です。

- **セマンティック切り替え**: \`href\` 指定時は \`<a>\` (Link)、未指定時は \`<button>\` に自動切替
- **アクティブ表示**: 色と背景の 2 つで示す。背景は CSS だけで描き、framer-motion に依存しない
- **カラー選択**: \`primary\`, \`blue\`, \`indigo\`, \`teal\`, \`amber\`, \`rose\`, \`emerald\`

### NavItem と AnimatedNavItem

| | NavItem | AnimatedNavItem |
|---|---|---|
| アクティブ背景 | 静的（CSS） | 項目間を移動する（framer-motion の shared layout animation） |
| バンドル | framer-motion を含まない | framer-motion / motion-dom を含む（gzip で約 40 kB） |
| 使う場面 | ページ遷移がフルリロードになる構成（Django Templates + Islands）。**既定はこちら** | 同じページ内で active を切り替えるナビ |

props と見た目は同じなので、後から入れ替えられます。フルリロードの画面で AnimatedNavItem を使っても
アニメーションは見えず、バンドルだけが増えます（decisions/adr-0008）。
        `,
      },
    },
  },
  args: {
    label: "受信トレイ",
    icon: <Inbox />,
    active: true,
    href: "#",
  },
} satisfies Meta<typeof NavItem>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 状態と色を 1 画面で比較する。
 *
 * アクティブ表示の移動アニメーションは `AnimatedNavigationGroup`（AnimatedNavItem）で確認する。
 */
export const Overview: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Showcase>
      <Section title="States" note="アクティブは色と背景の 2 つで示す。色だけに頼らない。">
        <div className="w-64 space-y-1 rounded-xl border border-border bg-card p-3">
          <NavItem href="#" active icon={<Inbox className="w-4 h-4" />} label="受信トレイ" />
          <NavItem href="#" icon={<Clock className="w-4 h-4" />} label="いつか読む" />
          <NavItem href="#" icon={<Archive className="w-4 h-4" />} label="アーカイブ" />
        </div>
      </Section>

      <Section title="With Badge" note="件数は badge に渡す。0 件のときは渡さない（0 を出しても意味がない）。">
        <div className="w-64 space-y-1 rounded-xl border border-border bg-card p-3">
          <NavItem
            href="#"
            active
            icon={<Inbox className="w-4 h-4" />}
            label="受信トレイ"
            badge={12}
          />
          <NavItem
            href="#"
            icon={<Pin className="w-4 h-4" />}
            label="ピン留め"
            badge={3}
          />
        </div>
      </Section>

      <Section
        title="Active Colors"
        note="アプリ内で色を使い分けるのは、区分（受信 / お気に入り等）を色で覚えてもらう場合だけ。"
      >
        <div className="w-64 space-y-1 rounded-xl border border-border bg-card p-3">
          <NavItem href="#" active activeColor="primary" icon={<Inbox className="w-4 h-4" />} label="primary" />
          <NavItem href="#" active activeColor="blue" icon={<Inbox className="w-4 h-4" />} label="blue" />
          <NavItem href="#" active activeColor="indigo" icon={<Clock className="w-4 h-4" />} label="indigo" />
          <NavItem href="#" active activeColor="teal" icon={<Archive className="w-4 h-4" />} label="teal" />
          <NavItem href="#" active activeColor="amber" icon={<Pin className="w-4 h-4" />} label="amber" />
          <NavItem href="#" active activeColor="rose" icon={<Heart className="w-4 h-4" />} label="rose" />
          <NavItem href="#" active activeColor="emerald" icon={<Inbox className="w-4 h-4" />} label="emerald" />
        </div>
      </Section>

      <Section title="Link / Button" note="href があれば a、なければ button になる。画面遷移しないものに href を付けない。">
        <div className="w-64 space-y-1 rounded-xl border border-border bg-card p-3">
          <NavItem href="#" icon={<Inbox className="w-4 h-4" />} label="href あり（a 要素）" />
          <NavItem icon={<Inbox className="w-4 h-4" />} label="href なし（button 要素）" />
        </div>
      </Section>
    </Showcase>
  ),
};

export const Default: Story = {};

export const Inactive: Story = {
  args: { active: false },
};

export const WithBadge: Story = {
  args: { badge: 12 },
};

/**
 * `AnimatedNavItem` を並べ、クリックで active を切り替える。
 * 同じ `layoutId` を渡した項目の間で背景が移動する。
 */
export const AnimatedNavigationGroup: Story = {
  render: () => {
    const [activeTab, setActiveTab] = useState("inbox");

    const items = [
      {
        id: "inbox",
        label: "受信トレイ",
        icon: <Inbox />,
        badge: 5,
        color: "blue" as const,
      },
      {
        id: "someday",
        label: "いつか読む",
        icon: <Clock />,
        badge: 2,
        color: "indigo" as const,
      },
      {
        id: "archive",
        label: "アーカイブ",
        icon: <Archive />,
        color: "teal" as const,
      },
      {
        id: "pinned",
        label: "ピン留め",
        icon: <Pin />,
        color: "amber" as const,
      },
      {
        id: "favorites",
        label: "お気に入り",
        icon: <Heart />,
        color: "rose" as const,
      },
    ];

    return (
      <div className="w-64 space-y-1 rounded-xl border border-border bg-card p-3">
        {items.map((item) => (
          <AnimatedNavItem
            key={item.id}
            active={activeTab === item.id}
            onClick={() => setActiveTab(item.id)}
            icon={item.icon}
            label={item.label}
            badge={item.badge}
            activeColor={item.color}
            layoutId="storybook-nav-demo"
          />
        ))}
      </div>
    );
  },
};

/** 同じ操作を `NavItem` で行う。背景は移動せず、切り替わるだけ。 */
export const StaticNavigationGroup: Story = {
  parameters: { controls: { disable: true } },
  render: () => {
    const [activeTab, setActiveTab] = useState("inbox");
    const items = [
      { id: "inbox", label: "受信トレイ", icon: <Inbox />, badge: 5 },
      { id: "someday", label: "いつか読む", icon: <Clock />, badge: 2 },
      { id: "archive", label: "アーカイブ", icon: <Archive /> },
    ];

    return (
      <div className="w-64 space-y-1 rounded-xl border border-border bg-card p-3">
        {items.map((item) => (
          <NavItem
            key={item.id}
            active={activeTab === item.id}
            onClick={() => setActiveTab(item.id)}
            icon={item.icon}
            label={item.label}
            badge={item.badge}
          />
        ))}
      </div>
    );
  },
};
