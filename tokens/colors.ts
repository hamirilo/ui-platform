/**
 * カラートークン定義（意味 → トークン名の対応表）
 *
 * <important>
 * ここは「値の定義」ではない。値の SSOT は tokens/tokens.css の `@theme`（theme.css は入口）。
 * このファイルは Storybook の Foundations や TS 側から
 * 「どんなトークンがあり、どういう意味で、いつ使うのか」を参照するためのメタ情報。
 *
 * CSS 変数の実値をここにハードコードしない（二重管理になり必ず分裂する）。
 * 実際の色は `var(--color-*)` 経由か Tailwind クラス経由で解決する。
 * </important>
 *
 * 出典: tokens/tokens.css
 * ルール: design-system/README.md §2 と Storybook「基礎/色」
 */

/** セマンティックカラーの役割 */
export interface SemanticColor {
  /** トークン名（`--color-` を除いた部分） */
  name: string;
  /** 背景色として使う Tailwind クラス（リテラル文字列。動的組立は禁止） */
  bgClass: string;
  /** 対応する CSS 変数名 */
  token: string;
  /** どういう意味・いつ使うのか */
  usage: string;
}

/**
 * アクションカラー
 *
 * ボタン・操作系の色。1画面に primary は原則1つ。
 * React では `<Button variant="primary">` を使う。
 */
export const ACTION_COLORS: SemanticColor[] = [
  {
    name: "primary",
    bgClass: "bg-primary",
    token: "--color-primary",
    usage: "メインアクション（作成・送信・保存）。1画面に原則1つ",
  },
  {
    name: "secondary",
    bgClass: "bg-secondary",
    token: "--color-secondary",
    usage: "補助操作（キャンセル・戻る）。キャンセルは必ずこれ",
  },
  {
    name: "success",
    bgClass: "bg-success",
    token: "--color-success",
    usage: "保存完了・確定・承認",
  },
  {
    name: "danger",
    bgClass: "bg-danger",
    token: "--color-danger",
    usage: "削除・取り消し不可の操作。削除は必ずこれ",
  },
  {
    name: "warning",
    bgClass: "bg-warning",
    token: "--color-warning",
    usage: "警告・注意喚起",
  },
  {
    name: "info",
    bgClass: "bg-info",
    token: "--color-info",
    usage: "情報表示・補足",
  },
];

/**
 * ベース・ニュートラルカラー
 *
 * 背景・文字・ボーダー。ダークモード時はこれらが `.dark` で上書きされる。
 * 新規コンポーネントはこのトークン群を使うこと（`bg-white` 直書きは dark で破綻する）。
 */
export const BASE_COLORS: SemanticColor[] = [
  {
    name: "background",
    bgClass: "bg-background",
    token: "--color-background",
    usage: "ページ全体の背景",
  },
  {
    name: "foreground",
    bgClass: "bg-foreground",
    token: "--color-foreground",
    usage: "本文テキスト色",
  },
  {
    name: "card",
    bgClass: "bg-card",
    token: "--color-card",
    usage: "カード・パネルの背景。`bg-white` の代わりに使う",
  },
  {
    name: "popover",
    bgClass: "bg-popover",
    token: "--color-popover",
    usage: "ドロップダウン・ポップオーバーの背景",
  },
  {
    name: "muted",
    bgClass: "bg-muted",
    token: "--color-muted",
    usage: "控えめな背景（表のヘッダー行・補足の帯）",
  },
  {
    name: "muted-foreground",
    bgClass: "bg-muted-foreground",
    token: "--color-muted-foreground",
    usage: "補助テキスト（説明文・プレースホルダー）",
  },
  {
    name: "accent",
    bgClass: "bg-accent",
    token: "--color-accent",
    usage: "ホバー時の淡い強調背景",
  },
  {
    name: "border",
    bgClass: "bg-border",
    token: "--color-border",
    usage: "標準ボーダー。`border-gray-200` の代わりに使う",
  },
  {
    name: "ring",
    bgClass: "bg-ring",
    token: "--color-ring",
    usage: "フォーカスリング",
  },
  {
    name: "disabled",
    bgClass: "bg-disabled",
    token: "--color-disabled",
    usage: "無効なコントロールの面。バリアント色を薄めずこれに差し替える",
  },
  {
    name: "disabled-foreground",
    bgClass: "bg-disabled-foreground",
    token: "--color-disabled-foreground",
    usage: "無効なコントロールの文字・アイコン",
  },
  {
    name: "disabled-border",
    bgClass: "bg-disabled-border",
    token: "--color-disabled-border",
    usage: "無効なコントロールの枠",
  },
];

/**
 * ドメインステータスカラー（意味 → tone → Token）
 *
 * ステータス・優先度・種別のバッジに使う。
 * **同じ意味の状態には全アプリで同じ tone を使う**（乖離すると統一コストが跳ね上がる）。
 *
 * 値は tokens/tokens.css の `--color-status-{tone}` / `-foreground`（light / dark の両方）。
 * React は `<Badge tone="…">`、テンプレートは `class="badge badge-{tone}"` で同じ Token を引く。
 * 以前は Tailwind パレットを直接使っていたが、テンプレート側に契約として配るために Token 化した。
 */
export const STATUS_COLORS = [
  { tone: "new", meaning: "新規・未対応・要注意", cls: "badge-new", token: "--color-status-new" },
  { tone: "active", meaning: "進行中", cls: "badge-active", token: "--color-status-active" },
  { tone: "done", meaning: "完了・解決・承認", cls: "badge-done", token: "--color-status-done" },
  {
    tone: "warning",
    meaning: "差戻し・警告",
    cls: "badge-warning",
    token: "--color-status-warning",
  },
  {
    tone: "danger",
    meaning: "緊急・エラー・却下",
    cls: "badge-danger",
    token: "--color-status-danger",
  },
  {
    tone: "pending",
    meaning: "検討中・保留",
    cls: "badge-pending",
    token: "--color-status-pending",
  },
  {
    tone: "neutral",
    meaning: "終了・無効・アーカイブ",
    cls: "badge-neutral",
    token: "--color-status-neutral",
  },
] as const;

/**
 * アバターの色
 *
 * ユーザーは blue、システム・匿名は gray に統一する。
 * 対応するテンプレート用クラスは design-system/README.md §3 の `.avatar-sm` / `.avatar-md` / `.avatar-lg`。
 */
export const AVATAR_COLORS = {
  user: "bg-blue-100 text-blue-700",
  system: "bg-gray-200 text-gray-600",
} as const;
