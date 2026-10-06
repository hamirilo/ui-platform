---
version: alpha
name: Application UI Kit
description: 社内業務システム向けの、落ち着いた操作性と情報把握のしやすさを最優先にしたデザインシステム
# colors は tokens/tokens.css の @theme から生成しています。手で編集しないでください。
# 更新: just sync-design（`just check` が差分を検出します）
colors:
  background: "#ffffff"
  foreground: "#15151c"
  primary: "#2b7fff"
  primary-hover: "#2c6af0"
  primary-active: "#2c55d8"
  primary-foreground: "#ffffff"
  secondary: "#ffffff"
  secondary-hover: "#f9fafb"
  secondary-active: "#f1f5f9"
  secondary-foreground: "#364153"
  secondary-border: "#d1d5dc"
  success: "#00bc7d"
  success-hover: "#009966"
  success-active: "#007a55"
  success-foreground: "#ffffff"
  danger: "#fb2c36"
  danger-hover: "#e7000b"
  danger-active: "#c10007"
  danger-foreground: "#ffffff"
  warning: "#f09339"
  warning-hover: "#e87825"
  warning-foreground: "#ffffff"
  info: "#77bfee"
  info-hover: "#4caae4"
  info-foreground: "#ffffff"
  card: "#ffffff"
  card-foreground: "#15151c"
  popover: "#ffffff"
  popover-foreground: "#15151c"
  muted: "#f1f5f9"
  muted-foreground: "#6e737a"
  accent: "#f1f5f9"
  accent-foreground: "#1e2735"
  border: "#d7dee5"
  input: "#d7dee5"
  ring: "#2b7fff"
  disabled: "#f1f5f9"
  disabled-foreground: "#6e737a"
  disabled-border: "#d7dee5"
  status-new: "#fefce8"
  status-new-foreground: "#d08700"
  status-active: "#f0f9ff"
  status-active-foreground: "#0084d1"
  status-done: "#ecfdf5"
  status-done-foreground: "#009966"
  status-warning: "#fff7ed"
  status-warning-foreground: "#f54900"
  status-danger: "#fff1f2"
  status-danger-foreground: "#ec003f"
  status-pending: "#faf5ff"
  status-pending-foreground: "#9810fa"
  status-neutral: "#f1f5f9"
  status-neutral-foreground: "#6e737a"
  nav-blue: "#155dfc"
  nav-indigo: "#4f39f6"
  nav-teal: "#009689"
  nav-amber: "#e17100"
  nav-rose: "#ec003f"
  nav-emerald: "#009966"
typography:
  h1:
    fontFamily: Inter, "IBM Plex Sans JP", sans-serif
    fontSize: 36px
    fontWeight: 700
    lineHeight: 1.2
  h2:
    fontFamily: Inter, "IBM Plex Sans JP", sans-serif
    fontSize: 30px
    fontWeight: 700
    lineHeight: 1.2
  h3:
    fontFamily: Inter, "IBM Plex Sans JP", sans-serif
    fontSize: 24px
    fontWeight: 700
    lineHeight: 1.2
  h4:
    fontFamily: Inter, "IBM Plex Sans JP", sans-serif
    fontSize: 20px
    fontWeight: 600
    lineHeight: 1.2
  body-lg:
    fontFamily: Inter, "IBM Plex Sans JP", sans-serif
    fontSize: 18px
    fontWeight: 400
    lineHeight: 1.6
  body-md:
    fontFamily: Inter, "IBM Plex Sans JP", sans-serif
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.6
  body-sm:
    fontFamily: Inter, "IBM Plex Sans JP", sans-serif
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.4
  label-sm:
    fontFamily: Inter, "IBM Plex Sans JP", sans-serif
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.4
  caption:
    fontFamily: Inter, "IBM Plex Sans JP", sans-serif
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.4
rounded:
  sm: 4px
  md: 8px
  lg: 12px
  xl: 16px
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.md}"
    height: 32px
    padding: 0 16px
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-secondary:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.secondary-foreground}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.md}"
    height: 32px
    padding: 0 16px
  button-danger:
    backgroundColor: "{colors.danger}"
    textColor: "{colors.danger-foreground}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.md}"
    height: 32px
    padding: 0 16px
  card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.card-foreground}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
  input-field:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    height: 32px
    padding: 0 12px
---

# Application UI Kit

## Overview

社内業務システム向けの、落ち着いて分かりやすい設計を基本とします。
装飾よりも操作性と情報の把握しやすさを最優先とし、情報密度は「中〜やや高め」を基準とします。

- 主操作（Primary Action）は PageHeader 付近（通常は右上）の明確な位置に配置します。
- 画面レイアウトは業務フローに応じた 3 系統（Standard / Simple / Focus）を起点とします。
- 原則として shadcn/ui + Tailwind CSS v4 の構成に準拠し、生のユーティリティの ad-hoc な組み合わせではなくセマンティックトークンを活用します。

## Colors

色は「何色か」ではなく「何のための表現か」というセマンティクスで選択します。生のカラーユーティリティ（例: `bg-blue-600` など）を直接指定せず、トークンを使用します。

- **Primary (`#2563eb`)**: メインアクション（作成・送信・保存）。1画面に原則1つのみ配置します。
- **Secondary (`#ffffff` + `#cbd5e1` ボーダー)**: 補助操作（キャンセル・戻る）。キャンセル操作には必ずこれを使用します。
- **Danger (`#ef4444`)**: 削除や取り消し不能な破壊的操作に限定して使用します。
- **Success (`#10b981`)**: 保存完了、確定、承認などの成功状態を表します。
- **Warning (`#f97316`)**: 警告や注意喚起に使用します。
- **Info (`#38bdf8`)**: 補足的な情報提示に使用します。
- **Status Colors**: 業務ステータス（`status-new`: 新規, `status-active`: 進行中, `status-done`: 完了, `status-warning`: 差戻し, `status-danger`: 緊急/エラー, `status-pending`: 保留, `status-neutral`: 終了/アーカイブ）は淡い背景と濃い文字の組み合わせで統一します。

WCAG 適合性として主要テキストはコントラスト比 4.5:1 以上（AA 合格）を維持し、無効（Disabled）状態は彩度を落とした専用トークン（`disabled`）で表現します。

## Typography

フォントファミリーは `"Inter", "IBM Plex Sans JP", sans-serif` を基本とします。

- **H1 (`36px` / `700` / `1.2`)**: ページタイトル。1画面に1つ配置します。
- **H2 (`30px` / `700` / `1.2`)**: セクションタイトル。
- **H3 (`24px` / `700` / `1.2`)**: サブセクション見出し。
- **H4 (`20px` / `600` / `1.2`)**: カード見出し・小見出し。
- **Body-MD (`16px` / `400` / `1.6`)**: 標準本文テキスト。読みやすさを重視した行間を設定します。
- **Body-SM (`14px` / `400` / `1.4`)**: 補足情報およびボタン内テキスト。
- **Label-SM (`14px` / `500` / `1.4`)**: 入力フィールドのラベルやテーブルヘッダー。
- **Caption (`12px` / `400` / `1.4`)**: メタ情報、注記、バッジテキスト。アクセシビリティの最小サイズ基準です。

## Layout

Tailwind CSS の標準スペーシング（0.25rem = 4px 刻み）に準拠します。任意値（`p-[13px]` 等）は禁止し、スケール値を使用します。

- **余白ルール**:
  - ラベルと入力欄の間: `6px` (`mb-1.5` で固定、混在禁止)
  - フォーム項目の垂直間隔: `16px` (`space-y-4`)
  - カード内パディング: `16px` (`padding: 16px` / `card` 標準)
  - セクション間の間隔: `24px` (`spacing.lg`)
  - 空状態（Empty state）の上下余白: `48px` (`spacing.2xl`)
- **画面レイアウト 3 系統**:
  - **Standard (一覧・ダッシュボード)**: 上部に PageHeader、フィルターバー、メインコンテンツ領域（Table またはグリッド）。
  - **Simple (単一目的・設定)**: 幅を絞った単一カラム。入力ステップの明瞭化。
  - **Focus (集中作業・ウィザード)**: ナビゲーションを最小化し、Steps コンポーネントと連動した入力・確認フロー。

## Elevation & Depth

シャドウは最小限にとどめ、情報の階層を強調しすぎないフラット寄りの設計とします。

- **標準 (`shadow-sm`)**: カード、パネル、ボタンの標準的な浮遊感。原則としてこれのみを使用します。
- **浮遊要素 (`shadow-lg`)**: ドロップダウンメニュー、ポップオーバー、モーダルダイアログのみ例外的に許可します。
- **非推奨**: `shadow-md` や `shadow-xl` など中途半端または過大なシャドウは使用しません。

## Shapes

角丸（Border Radius）の基準は `--radius: 0.5rem` (`8px`) です。

- **Small (`4px` / `rounded-sm`)**: チェックボックス等の小さなコントロール（8px を適用すると円形に見えてしまうため必ず 4px を使用）。
- **Medium (`8px` / `rounded-md`)**: ボタン、入力欄、セレクトボックス（標準コントロール）。
- **Large (`12px` / `rounded-lg`)**: カード（Card）、パネル。
- **Extra Large (`16px` / `rounded-xl`)**: ダイアログ、モーダルウィンドウ。
- **Full (`9999px` / `rounded-full`)**: バッジ、アバター、丸型インジケーター。

## Components

既存のコンポーネントライブラリを優先して使用します。

| 部品種別 | 推奨コンポーネント | 用途・基準 |
|---|---|---|
| アクション | Button, ButtonGroup | variant は `primary`, `secondary`, `danger`, `success` の 4 種。 |
| 入力 | Input, SearchInput, Select, Combobox, DatePicker | ラベル・エラーメッセージの配置には FormField / FormFieldSet を必ず組み合わせる。 |
| データ表示 | Table, RadioTable | テーブルは必ず空状態（Empty state）ハンドリングを含む。 |
| 構造・案内 | PageHeader, Breadcrumbs, Tabs | 画面の見出し、主操作ボタン、階層パンくずを一体で提供。 |
| 状態・通知 | Badge, ActiveIndicator, Alert, Toast | 一時的な通知は Toast、持続的な案内は Alert、状態表現は Badge（tone を指定）。 |
| 対話 | ConfirmDialog, FormDialog | 破壊的操作の確認には `window.confirm` を使わず ConfirmDialog を使用。 |

## Do's and Don'ts

### Do
- **主操作を明確にする**: 画面ごとに主要なアクション（Primary）を 1 つに絞り、右上などの定位置に置く。
- **セマンティックトークンを使う**: 色やサイズは用途別のトークン名（`primary`, `border`, `status-active`）で指定する。
- **アクセシビリティを確保する**: エラー時は見た目の枠線だけでなく `aria-invalid` とテキストメッセージを両方付与する。
- **空状態を必ず定義する**: データが 0 件の Table やリストには、次に取るべきアクションを示す空状態を置く。

### Don't
- **過剰なカード分割をしない**: 業務システムにおいて関連する情報を細切れのカードに分割しすぎない。
- **装飾的なグラデーションやアニメーションを避ける**: 背景グラデーションや意味のない移動アニメーションは業務の集中を阻害するため排除する。
- **生の色（raw color utilities）を直接書かない**: `bg-blue-600` や `text-gray-900` を直書きせず、ダークモードやテーマ変更に耐えうるトークンを使用する。
- **キャンセルに Primary スタイルを使わない**: キャンセル・戻る操作には必ず Secondary スタイルを適用する。
