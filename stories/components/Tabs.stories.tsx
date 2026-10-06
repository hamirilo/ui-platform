import type { Meta, StoryObj } from "@storybook/react-vite";
import { Bell, Settings, User } from "lucide-react";
import * as React from "react";
import { Card, Tabs } from "../../components/application";
import { Section, Showcase } from "../_showcase";

/**
 * Tabs は同一画面内で複数のビューを切り替えるためのコンポーネント。
 *
 * <important>
 * URL 遷移を伴う切り替え（ページの移動）には使わない。
 * その場合はリンク + ナビゲーション（`sidebar.html` / `global_nav.html`）を使う。
 * </important>
 */
const meta = {
  title: "コンポーネント/Tabs",
  component: Tabs,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
## 目的

同一画面内のビュー切り替え（概要 / 履歴 / 設定 等）を統一する。

## 使う場面

- 詳細画面のタブ切り替え（概要・コメント・履歴）
- 設定画面のセクション切り替え

## 使わない場面

| 場面 | 代わりに使うもの |
|---|---|
| サーバー（Django テンプレート）が描いたパネルの切替 | Islands の \`data-react="tabs"\`（はじめに/Django Islands）。中身を React へ持ち上げない |

| 場面 | 代わりに使うもの |
|---|---|
| URL が変わるページ遷移 | リンク + ナビゲーション |
| 2〜3個の状態を切り替えるだけの絞り込み | ボタン群（\`btn-secondary\` のトグル） |

## Props

タブは JSX の子要素ではなく **\`items\` 配列**で渡す。各項目の \`content\` に
パネルの内容を渡す（選択中のタブだけが DOM に残る）。

見た目と並びは shadcn/ui の Tabs が持つものをそのまま通す。

| Prop | 値 | 使い分け |
|---|---|---|
| \`variant\` | \`default\`（既定）/ \`line\` | \`line\` は下線だけ。パネルを本文と地続きに見せたいとき |
| \`orientation\` | \`horizontal\`（既定）/ \`vertical\` | \`vertical\` はタブ名が長い・数が多い設定画面向け |

## 注意事項

- 矢印キーでタブ間を移動できる（\`Tab\`/\`Enter\`/\`Space\` で確定）
- 無効なタブは初期選択されない
- タブの数は画面幅に収まる程度（5〜6個まで）に留める。増える場合は \`Select\` に切り替える
        `,
      },
    },
  },
  argTypes: {
    items: { table: { disable: true } },
  },
  args: {
    items: [
      {
        value: "overview",
        label: "概要",
        content: <p className="text-sm text-foreground">概要の内容がここに入ります。</p>,
      },
      {
        value: "history",
        label: "履歴",
        content: <p className="text-sm text-foreground">変更履歴の一覧がここに入ります。</p>,
      },
      {
        value: "settings",
        label: "設定",
        content: <p className="text-sm text-foreground">設定項目がここに入ります。</p>,
      },
    ],
  },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * タブの構成パターンを 1 画面で比較する。
 *
 * タブは同一画面内のビュー切り替えに使う。URL が変わる遷移には使わない。
 */
export const Overview: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Showcase>
      <Section title="Default" note="1 つ目のタブが初期選択される。タブ名は 2〜6 文字程度に収める。">
        <Tabs items={BASIC_ITEMS} />
      </Section>

      <Section title="With Icons" note="アイコンはラベルの補助。アイコンだけのタブにしない。">
        <Tabs
          items={[
            {
              value: "profile",
              label: "プロフィール",
              icon: <User className="h-4 w-4" />,
              content: <p className="text-sm text-foreground">プロフィール情報。</p>,
            },
            {
              value: "notifications",
              label: "通知",
              icon: <Bell className="h-4 w-4" />,
              content: <p className="text-sm text-foreground">通知設定。</p>,
            },
            {
              value: "settings",
              label: "設定",
              icon: <Settings className="h-4 w-4" />,
              content: <p className="text-sm text-foreground">その他の設定。</p>,
            },
          ]}
        />
      </Section>

      <Section
        title="Variant"
        note="default は面で囲む。line は下線だけで、本文と地続きに見せたいときに使う。"
      >
        <div className="flex flex-col gap-6">
          <Tabs items={BASIC_ITEMS} />
          <Tabs items={BASIC_ITEMS} variant="line" />
        </div>
      </Section>

      <Section
        title="Orientation"
        note="vertical はタブを左、パネルを右に置く。タブ名が長い・数が多い設定画面向け。"
      >
        <Tabs items={BASIC_ITEMS} orientation="vertical" />
      </Section>

      <Section
        title="With Disabled Tab"
        note="権限がない等で開けないタブは disabled にする。隠すと存在に気づけない。"
      >
        <Tabs
          items={[
            {
              value: "overview",
              label: "概要",
              content: <p className="text-sm text-foreground">概要の内容。</p>,
            },
            {
              value: "audit",
              label: "監査ログ",
              disabled: true,
              content: <p className="text-sm text-foreground">閲覧権限が必要です。</p>,
            },
          ]}
        />
      </Section>
    </Showcase>
  ),
};

const BASIC_ITEMS = meta.args.items;

/** 基本形。1つ目のタブが初期選択される。 */
export const Default: Story = {
  args: { items: BASIC_ITEMS },
};

/** アイコン付き。 */
export const WithIcons: Story = {
  args: {
    items: [
      {
        value: "profile",
        label: "プロフィール",
        icon: <User className="h-4 w-4" />,
        content: <p className="text-sm text-foreground">プロフィール情報。</p>,
      },
      {
        value: "notifications",
        label: "通知",
        icon: <Bell className="h-4 w-4" />,
        content: <p className="text-sm text-foreground">通知設定。</p>,
      },
      {
        value: "settings",
        label: "設定",
        icon: <Settings className="h-4 w-4" />,
        content: <p className="text-sm text-foreground">アカウント設定。</p>,
      },
    ],
  },
};

/** 一部のタブを無効化した例（権限がない機能等）。 */
export const WithDisabledTab: Story = {
  args: {
    items: [
      {
        value: "overview",
        label: "概要",
        content: <p className="text-sm text-foreground">概要の内容。</p>,
      },
      {
        value: "billing",
        label: "請求（権限なし）",
        disabled: true,
        content: <p className="text-sm text-foreground">閲覧できません。</p>,
      },
      {
        value: "settings",
        label: "設定",
        content: <p className="text-sm text-foreground">設定項目。</p>,
      },
    ],
  },
};

/**
 * 制御コンポーネントとして使う場合。
 *
 * 選択中のタブに応じて別の要素（見出し等）を出し分けたいときに使う。
 */
export const Controlled: Story = {
  render: () => {
    const [value, setValue] = React.useState("overview");
    return (
      <div className="space-y-3">
        <Tabs items={BASIC_ITEMS} value={value} onValueChange={setValue} />
        <p className="text-sm text-muted-foreground">
          選択中のタブ: <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{value}</code>
        </p>
      </div>
    );
  },
};

/** Card の中で使う実際の使い方。 */
export const WithCard: Story = {
  render: () => (
    <Card title="申請 #1024">
      <Tabs items={BASIC_ITEMS} />
    </Card>
  ),
};

/** 下線だけのタブ。パネルを本文と地続きに見せたいときに使う。 */
export const LineVariant: Story = {
  args: { items: BASIC_ITEMS, variant: "line" },
};

/** 縦並び。タブ名が長い、または数が多い設定画面で使う。 */
export const Vertical: Story = {
  args: { items: BASIC_ITEMS, orientation: "vertical" },
};
