/**
 * Border radius / Shadow / Animation トークン
 *
 * radius の SSOT: tokens/tokens.css の `--radius`（0.5rem、`tokens/theme.css` は入口）
 * 見本: Storybook「基礎/角丸と影」（stories/foundations/RadiusAndShadow.mdx）
 */

/**
 * 角丸
 *
 * <important>
 * 素の `rounded` は `--radius`（0.5rem）を引くため 0.25rem ではない。
 * 16px 程度の小さい箱に当てると円に見える（チェックボックスがラジオボタンと
 * 区別できなくなった原因）。小さい要素には `rounded-sm` を使う。
 * </important>
 */
export const RADIUS_SCALE = [
  { cls: "rounded-sm", rem: "0.25rem", usage: "チェックボックス等の小さい要素" },
  { cls: "rounded-lg", rem: "0.5rem", usage: "ボタン・入力欄（--radius と同値・標準）" },
  { cls: "rounded-xl", rem: "0.75rem", usage: "カード（card / card-sm / card-lg）" },
  { cls: "rounded-2xl", rem: "1rem", usage: "大きなパネル・モーダル" },
  { cls: "rounded-full", rem: "9999px", usage: "バッジ・アバター" },
] as const;

/**
 * シャドウ
 *
 * <important>
 * `shadow-sm` のみを使う。`shadow-md` 以上は使わない。
 * 例外: ドロップダウン・ポップオーバーの浮遊要素のみ `shadow-lg` を許可。
 * 出典: design-system/README.md §1「避ける表現」（強い Shadow）
 * </important>
 */
export const SHADOW_SCALE = [
  { cls: "shadow-sm", usage: "カード・ボタン（標準）", allowed: true },
  { cls: "shadow-lg", usage: "ドロップダウン・ポップオーバーのみ", allowed: true },
  { cls: "shadow-md", usage: "使わない（shadow-sm を使う）", allowed: false },
  { cls: "shadow-xl", usage: "使わない", allowed: false },
] as const;

/**
 * アニメーション
 *
 * ダイアログ・ドロップダウンの出入りは tw-animate-css の
 * `animate-in` / `fade-in-0` / `zoom-in-95` / `slide-in-from-*` を使う。
 * これらは theme.css が `@import "tw-animate-css"` していないため、
 * 各プロジェクトの input.css 側の import に依存している。
 */
export const TRANSITIONS = [
  { cls: "transition-colors", usage: "色の変化（ボタンのホバー等）・標準" },
  { cls: "duration-150", usage: "短い変化（スウォッチ等）" },
  { cls: "duration-200", usage: "標準の変化" },
] as const;

/**
 * モーション配慮
 *
 * `prefers-reduced-motion` を尊重する。
 * 装飾的なアニメーション（pulse 等）は必ず無効化できるようにする。
 * 出典: design-system/README.md §5「基本操作性」（reduced motion 等の利用者設定を無視しない）
 */
export const REDUCED_MOTION_NOTE =
  "装飾アニメーションは @media (prefers-reduced-motion: reduce) で無効化する";
