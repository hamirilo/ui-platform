import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { Alert, Button } from "../../components/application";
import { Section, Showcase, Stack } from "../_showcase";

/**
 * Alert は「利用者が対処または確認するまでページ上に残す」注意・案内。
 * Toast（一時的な結果通知）と役割を分ける。
 */
const meta = {
  title: "コンポーネント/Alert",
  component: Alert,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
## 目的

継続して伝える注意・案内の表現を統一する（Application UI Standard §4「Form Error / Alert」）。
テンプレート側の \`.alert .alert-{tone}\` と同じ見た目。

## 使う場面

- フォーム全体・業務ルールのエラー（「担当者が未設定のため送信できません」）
- 未完了の設定、権限による制限、期限が近いことの注意
- ページ幅のお知らせ・環境バナー（\`variant="banner"\`）

## 使わない場面

| 場面 | 代わりに使うもの |
|---|---|
| 入力項目 1 つの不備 | \`FormField\` の \`error\`（対象フィールドの近く） |
| 保存成功などの一時的な結果 | \`toast\` |
| 削除など取り消しにくい操作の確認 | \`ConfirmDialog\` |
| データが 0 件 | \`Empty\`（パターン/空の状態） |
| 画面自体が使えない | パターン/エラー表示 |

## tone の対応

| tone | 意味 | role |
|---|---|---|
| \`info\`（既定） | 案内・補足 | status |
| \`success\` | 完了・承認済みの状態を継続して示す | status |
| \`warning\` | 注意。未完了の設定、期限が近い | alert |
| \`danger\` | 対処が必要。権限がない、失敗した、削除される | alert |

## 注意事項

- **色だけに意味を持たせない。** tone ごとのアイコンと、見出し・本文で伝える
- 見出しは 1 行で要点を言う。本文に「次に何をすればよいか」を書く
- 閉じる（\`onDismiss\`）を付けるのは、読めば済む案内だけ。対処が要るものは閉じさせない
- 1 画面に同じ tone の Alert を何枚も並べない。まとめて 1 枚にする
        `,
      },
    },
  },
  argTypes: {
    tone: { control: "select", options: ["info", "success", "warning", "danger"] },
    variant: { control: "select", options: ["inline", "banner"] },
  },
  args: {
    tone: "info",
    title: "下書きは 30 日間保存されます",
    children: "期限を過ぎると自動的に削除されます。",
  },
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

/** tone・見出しの有無・操作付き・閉じられる・バナーを 1 画面で比較する。 */
export const Overview: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Showcase>
      <Section title="Tones" note="意味で選ぶ。danger / warning は role=alert で即時に読み上げられる。">
        <Stack className="max-w-2xl">
          <Alert tone="info" title="下書きは 30 日間保存されます">
            期限を過ぎると自動的に削除されます。
          </Alert>
          <Alert tone="success" title="承認済み">
            2026-09-01 に部長承認が完了しています。
          </Alert>
          <Alert tone="warning" title="通知先が設定されていません">
            通知先を設定するまで、担当者へメールが届きません。
          </Alert>
          <Alert tone="danger" title="この操作を行う権限がありません">
            管理者に権限の付与を依頼してください。
          </Alert>
        </Stack>
      </Section>

      <Section title="操作付き" note="次にすべき操作を本文の下に置く。primary は使わず secondary の小サイズ。">
        <Stack className="max-w-2xl">
          <Alert
            tone="warning"
            title="通知先が設定されていません"
            actions={
              <Button variant="secondary" size="sm">
                通知先を設定する
              </Button>
            }
          >
            通知先を設定するまで、担当者へメールが届きません。
          </Alert>
        </Stack>
      </Section>

      <Section title="見出しだけ / 本文だけ" note="短い案内は見出しだけ。本文だけのときは 1 文で。">
        <Stack className="max-w-2xl">
          <Alert tone="info" title="この一覧は 1 時間ごとに更新されます" />
          <Alert tone="info">絞り込み条件は URL に保存されるため、ブックマークで再現できます。</Alert>
        </Stack>
      </Section>

      <Section title="バナー" note="ページ幅のお知らせ。角丸と左右の枠を外し、上下の罫線だけにする。">
        <Alert variant="banner" tone="warning" title="9/10 21:00〜22:00 はメンテナンスのため利用できません" />
      </Section>
    </Showcase>
  ),
};

/** 基本形。 */
export const Default: Story = {};

/** 対処を促す。 */
export const Danger: Story = {
  args: {
    tone: "danger",
    title: "送信できませんでした",
    children: "担当者が未設定です。担当者を選んでから再度送信してください。",
  },
};

/** 閉じられる案内。閉じた状態の保持は呼び出し側が持つ。 */
export const Dismissible: Story = {
  render: () => {
    const [shown, setShown] = React.useState(true);
    if (!shown) {
      return (
        <Button variant="secondary" size="sm" onClick={() => setShown(true)}>
          もう一度表示
        </Button>
      );
    }
    return (
      <Alert tone="success" title="保存しました" onDismiss={() => setShown(false)}>
        変更内容は公開画面にも反映されています。
      </Alert>
    );
  },
};

/** ページ幅のバナー。 */
export const Banner: Story = {
  parameters: { layout: "fullscreen" },
  args: {
    variant: "banner",
    tone: "info",
    title: "これはステージング環境です",
    children: undefined,
  },
};
