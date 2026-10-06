import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import {
  Button,
  Dialog,
  FormField,
  Input,
} from "../../components/application";
import { Cluster, Section, Showcase } from "../_showcase";

/**
 * Dialog は汎用のモーダルダイアログ。
 *
 * <important>
 * 用途が決まっている場合は専用コンポーネントを使う。
 * 確認 → `ConfirmDialog` / フォーム → `FormDialog`。
 * Dialog を直接使うのは、それらに当てはまらない場合だけ。
 * </important>
 */
const meta = {
  title: "コンポーネント/Dialog",
  component: Dialog,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
## 目的

モーダルの枠（オーバーレイ・見出し・本文・フッター）と、
開閉・フォーカストラップ・\`Esc\` での閉じる動作を統一する。

## 使う場面

- 確認でもフォームでもない内容を、画面遷移せずに見せたい場合
- 詳細情報の表示、選択ウィザードなど

## 使わない場面

| 場面 | 代わりに使うもの |
|---|---|
| はい / いいえ の確認 | \`ConfirmDialog\`（アイコン・エラー表示・非同期処理が組み込み済み） |
| フォームの入力と送信 | \`FormDialog\`（Enter 送信・送信中の入力無効化が組み込み済み） |
| 操作結果の通知 | \`toast\`。完了を伝えるだけでダイアログを出さない |
| \`confirm()\` / \`alert()\` | **禁止。** 見た目が OS 依存で、文言も制御できない |
| テンプレート（.html） | 各プロジェクトのモーダル partial かサーバーレンダリング。React コンポーネントを新設しない |
| 情報量が多い（1 画面ぶん以上） | 専用ページへ遷移する。モーダル内スクロールは読みにくい |

## Props

| Prop | 説明 |
|---|---|
| \`open\` / \`onOpenChange\` | 開閉状態（**必ず制御する**） |
| \`title\` | 見出し（必須） |
| \`description\` | 見出し下の説明 |
| \`children\` | 本文 |
| \`footer\` | フッターを自前で組む場合 |
| \`confirmText\` / \`cancelText\` | \`footer\` 未指定時にボタンを自動生成する |
| \`onConfirm\` / \`onCancel\` | 自動生成ボタンのハンドラ |
| \`confirmVariant\` | \`primary\` / \`danger\` / \`success\` |
| \`confirmLoading\` | 処理中。**閉じる操作を全て無効化**する（後述） |
| \`maxWidth\` | \`sm\` / \`md\` / \`lg\`（既定） / \`xl\` / \`2xl\` |

## 注意事項

- **\`confirmText\` / \`cancelText\` を渡さないとフッターが出ない。**
  閉じる手段が右上の × と \`Esc\` だけになるため、意図しているか確認する
- **\`confirmLoading\` 中は Esc・背景クリック・× の全てが無効になる。**
  二重送信と、処理中の離脱を防ぐため。処理が長い場合は本文に進捗を出す
- **キャンセルは左、主アクションは右。** 自動生成フッターはこの順で並ぶ
- 開いている間は背後のスクロールが止まり、フォーカスがダイアログ内に閉じ込められる
- **ダイアログを重ねない。** 確認の中に確認を出す構造は、Esc の対象が分からなくなる
- \`title\` は \`aria-labelledby\`、\`description\` は \`aria-describedby\` で紐づく。
  空文字を渡さないこと
        `,
      },
    },
  },
  argTypes: {
    open: { table: { disable: true } },
    onOpenChange: { table: { disable: true } },
    title: { control: "text" },
    description: { control: "text" },
    confirmText: { control: "text" },
    cancelText: { control: "text" },
    confirmVariant: { control: "select", options: ["primary", "danger", "success"] },
    confirmLoading: { control: "boolean" },
    maxWidth: { control: "select", options: ["sm", "md", "lg", "xl", "2xl", "4xl", "6xl"] },
    children: { table: { disable: true } },
    footer: { table: { disable: true } },
  },
  args: {
    title: "申請の詳細",
    description: "申請の内容を確認できます。",
    children: null,
    open: false,
    onOpenChange: () => {},
  },
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

type DialogVariation = {
  key: string;
  label: string;
  props: Partial<React.ComponentProps<typeof Dialog>>;
  body: React.ReactNode;
};

const DIALOG_VARIATIONS: DialogVariation[] = [
  {
    key: "default",
    label: "標準",
    props: { title: "申請の詳細", description: "内容を確認してください" },
    body: <p className="text-sm text-muted-foreground">申請番号 SYS-2026-0001 の内容です。</p>,
  },
  {
    key: "no-footer",
    label: "フッターなし",
    props: { title: "お知らせ", footer: null },
    body: (
      <p className="text-sm text-muted-foreground">
        読むだけの内容。閉じる手段は右上の × と Esc になる。
      </p>
    ),
  },
  {
    key: "danger",
    label: "危険な操作",
    props: {
      title: "申請の削除",
      confirmText: "削除する",
      confirmVariant: "danger",
      cancelText: "キャンセル",
    },
    body: (
      <p className="text-sm text-muted-foreground">
        この申請を削除します。削除すると元に戻せません。
      </p>
    ),
  },
  {
    key: "loading",
    label: "確定中",
    props: { title: "申請の送信", confirmText: "送信", confirmLoading: true },
    body: (
      <p className="text-sm text-muted-foreground">
        確定ボタンが loading の状態。二重送信を防ぐため閉じるまで押せない。
      </p>
    ),
  },
  {
    key: "wide",
    label: "幅 2xl",
    props: { title: "一覧の確認", maxWidth: "2xl" },
    body: (
      <p className="text-sm text-muted-foreground">
        表や一覧を入れる場合だけ広げる。既定（md）で足りるなら広げない。
      </p>
    ),
  },
];

/**
 * ダイアログの構成パターンを 1 画面から開いて比較する。
 *
 * ダイアログは重ねて並べられないため、Overview はトリガーの一覧にしている。
 * 押すとその構成のダイアログが開く。
 */
export const Overview: Story = {
  parameters: { controls: { disable: true } },
  render: () => {
    const [openKey, setOpenKey] = React.useState<string | null>(null);
    const current = DIALOG_VARIATIONS.find((v) => v.key === openKey);

    return (
      <Showcase>
        <Section
          title="Variations"
          note="open は必ず呼び出し側が持つ。確定ボタンの色は操作の意味に合わせる（削除は danger）。"
        >
          <Cluster>
            {DIALOG_VARIATIONS.map((v) => (
              <Button key={v.key} variant="secondary" onClick={() => setOpenKey(v.key)}>
                {v.label}
              </Button>
            ))}
          </Cluster>
        </Section>

        {current && (
          <Dialog
            key={current.key}
            title=""
            {...current.props}
            open
            onOpenChange={(next) => !next && setOpenKey(null)}
            onConfirm={() => setOpenKey(null)}
            onCancel={() => setOpenKey(null)}
          >
            {current.body}
          </Dialog>
        )}
      </Showcase>
    );
  },
};

/**
 * 開くボタンと組み合わせた基本形。
 *
 * Story では `useState` で開閉を持っているが、実際の画面でも同じ形になる
 * （`open` は必ず呼び出し側が制御する）。
 */
export const Default: Story = {
  render: (args) => {
    const [open, setOpen] = React.useState(false);
    return (
      <>
        <Button variant="primary" onClick={() => setOpen(true)}>
          ダイアログを開く
        </Button>
        <Dialog {...args} open={open} onOpenChange={setOpen}>
          <p className="text-sm text-muted-foreground">申請番号 SYS-2026-0001 の内容です。</p>
        </Dialog>
      </>
    );
  },
};

/**
 * フッターなし。
 *
 * 閉じる手段が右上の × と `Esc` だけになる。
 * 「読むだけ」の内容には成立するが、閉じ方が分かりにくい場合は
 * `cancelText="閉じる"` を渡したほうがよい。
 */
export const WithoutFooter: Story = {
  render: (args) => {
    const [open, setOpen] = React.useState(false);
    return (
      <>
        <Button variant="secondary" onClick={() => setOpen(true)}>
          フッターなしで開く
        </Button>
        <Dialog
          {...args}
          open={open}
          onOpenChange={setOpen}
          title="お知らせ"
          description={undefined}
          confirmText={undefined}
          cancelText={undefined}
        >
          <p className="text-sm text-foreground">2026 年 8 月 1 日にメンテナンスを実施します。</p>
        </Dialog>
      </>
    );
  },
};

/** 確定・キャンセルボタン付き。キャンセルが左、主アクションが右に並ぶ。 */
export const WithButtons: Story = {
  render: (args) => {
    const [open, setOpen] = React.useState(false);
    return (
      <>
        <Button variant="primary" onClick={() => setOpen(true)}>
          確認して進む
        </Button>
        <Dialog
          {...args}
          open={open}
          onOpenChange={setOpen}
          title="この内容で申請しますか？"
          description="送信後は編集できません。"
          confirmText="申請する"
          cancelText="キャンセル"
          onConfirm={() => setOpen(false)}
        >
          <dl className="space-y-2 text-sm">
            <div className="flex gap-3">
              <dt className="w-20 shrink-0 text-muted-foreground">件名</dt>
              <dd className="text-foreground">備品購入（モニター 2 台）</dd>
            </div>
            <div className="flex gap-3">
              <dt className="w-20 shrink-0 text-muted-foreground">金額</dt>
              <dd className="text-foreground">78,000 円</dd>
            </div>
          </dl>
        </Dialog>
      </>
    );
  },
};

/**
 * 処理中（`confirmLoading`）。
 *
 * ボタンにスピナーが出るだけでなく、**`Esc`・背景クリック・× の全てが無効**になる。
 * 二重送信と、処理中に画面を離れることを防ぐため。
 * 開いてから 3 秒で解除される。
 */
export const Loading: Story = {
  render: (args) => {
    const [open, setOpen] = React.useState(false);
    const [loading, setLoading] = React.useState(false);

    const handleConfirm = () => {
      setLoading(true);
      window.setTimeout(() => {
        setLoading(false);
        setOpen(false);
      }, 3000);
    };

    return (
      <>
        <Button variant="primary" onClick={() => setOpen(true)}>
          送信を試す
        </Button>
        <Dialog
          {...args}
          open={open}
          onOpenChange={setOpen}
          title="申請を送信します"
          description="送信中はダイアログを閉じられません。"
          confirmText="送信"
          cancelText="キャンセル"
          onConfirm={handleConfirm}
          confirmLoading={loading}
        >
          <p className="text-sm text-muted-foreground">
            送信ボタンを押すと 3 秒間ローディング状態になります。
          </p>
        </Dialog>
      </>
    );
  },
};

/**
 * 危険な操作（`confirmVariant="danger"`）。
 *
 * ただし削除確認は `ConfirmDialog type="danger"` を使うほうがよい
 * （アイコンとエラー表示が付く）。
 */
export const DangerVariant: Story = {
  render: (args) => {
    const [open, setOpen] = React.useState(false);
    return (
      <>
        <Button variant="danger" onClick={() => setOpen(true)}>
          削除
        </Button>
        <Dialog
          {...args}
          open={open}
          onOpenChange={setOpen}
          title="申請を削除しますか？"
          description="削除すると元に戻せません。"
          confirmText="削除する"
          cancelText="キャンセル"
          confirmVariant="danger"
          onConfirm={() => setOpen(false)}
          maxWidth="md"
        >
          <p className="text-sm text-muted-foreground">SYS-2026-0001 備品購入</p>
        </Dialog>
      </>
    );
  },
};

/**
 * フッターを自前で組む例（`footer`）。
 *
 * 「下書き保存」のように 3 つ目の操作が必要な場合に使う。
 * ただしボタンが増えるほど判断が難しくなるため、2 つで済むか先に検討する。
 */
export const CustomFooter: Story = {
  render: (args) => {
    const [open, setOpen] = React.useState(false);
    return (
      <>
        <Button variant="secondary" onClick={() => setOpen(true)}>
          カスタムフッター
        </Button>
        <Dialog
          {...args}
          open={open}
          onOpenChange={setOpen}
          title="申請の作成"
          description={undefined}
          footer={
            <div className="flex w-full items-center justify-between gap-2">
              <Button variant="ghost" onClick={() => setOpen(false)}>
                下書き保存
              </Button>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => setOpen(false)}>
                  キャンセル
                </Button>
                <Button variant="primary" onClick={() => setOpen(false)}>
                  申請する
                </Button>
              </div>
            </div>
          }
        >
          <FormField label="件名" required>
            <Input placeholder="例: 備品購入の申請" />
          </FormField>
        </Dialog>
      </>
    );
  },
};

const WIDTHS = ["sm", "md", "lg", "xl", "2xl", "4xl", "6xl"] as const;

/** 最大幅の比較。内容量に合わせて選ぶ（既定は `lg`）。`4xl` / `6xl` は表や画像の拡大表示向け。 */
export const MaxWidths: Story = {
  render: (args) => {
    const [width, setWidth] = React.useState<(typeof WIDTHS)[number] | null>(null);

    return (
      <>
        <div className="flex flex-wrap gap-2">
          {WIDTHS.map((w) => (
            <Button key={w} variant="secondary" size="sm" onClick={() => setWidth(w)}>
              maxWidth=&quot;{w}&quot;
            </Button>
          ))}
        </div>
        <Dialog
          {...args}
          open={width !== null}
          onOpenChange={(next) => !next && setWidth(null)}
          title={`maxWidth="${width}"`}
          description="内容量に合わせて選びます。"
          cancelText="閉じる"
          maxWidth={width ?? "lg"}
        >
          <p className="text-sm text-muted-foreground">
            大きくすれば読みやすくなるわけではありません。1 行が長すぎると視線が戻れなくなります。
          </p>
        </Dialog>
      </>
    );
  },
};
