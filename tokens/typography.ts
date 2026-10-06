/**
 * タイポグラフィトークン
 *
 * このファイルが「どの class をどう使うか」の正。値そのものは Tailwind の既定スケール。
 * フォント定義の SSOT: tokens/tokens.css の `--font-sans`（`tokens/theme.css` は入口）
 * 見本: Storybook「基礎/文字」（stories/foundations/Typography.mdx）
 */

/** 見出しレベル */
export const HEADINGS = [
  { level: "H1", cls: "text-4xl font-bold", px: "36px", usage: "ページタイトル" },
  { level: "H2", cls: "text-3xl font-bold", px: "30px", usage: "セクションタイトル" },
  { level: "H3", cls: "text-2xl font-bold", px: "24px", usage: "サブセクション" },
  { level: "H4", cls: "text-xl font-semibold", px: "20px", usage: "小見出し" },
  { level: "本文", cls: "text-base", px: "16px", usage: "標準テキスト" },
  { level: "小", cls: "text-sm", px: "14px", usage: "補足情報・ボタン" },
  { level: "極小", cls: "text-xs", px: "12px", usage: "ラベル・メタ情報" },
] as const;

/** 行間 */
export const LINE_HEIGHTS = [
  { cls: "leading-tight", value: "1.2", usage: "見出し（コンパクト・視認性重視）" },
  { cls: "leading-normal", value: "1.4", usage: "短い要素（標準）" },
  { cls: "leading-relaxed", value: "1.6", usage: "本文（読みやすさ重視）" },
] as const;

/**
 * テキストカラーとコントラスト比
 *
 * <important>
 * `text-gray-500` 以下は小さいテキストに使わない（コントラスト不足）。
 * 無効テキストの `text-gray-400` は WCAG AA を満たさないため、
 * 無効状態は色だけでなく `disabled` 属性・アイコンでも示す。
 * </important>
 */
export const TEXT_COLORS = [
  { cls: "text-gray-900", name: "主要テキスト", contrast: "17.6:1", wcag: "AA 合格" },
  { cls: "text-gray-700", name: "標準テキスト", contrast: "7.5:1", wcag: "AA 合格" },
  { cls: "text-gray-600", name: "補足テキスト", contrast: "4.5:1", wcag: "AA 合格（境界）" },
  { cls: "text-gray-500", name: "淡色テキスト", contrast: "3.5:1", wcag: "大きい文字のみ" },
  { cls: "text-gray-400", name: "無効テキスト", contrast: "1.9:1", wcag: "不合格" },
] as const;

/** フォントウェイト */
export const FONT_WEIGHTS = [
  { cls: "font-normal", value: "400", usage: "本文・標準" },
  { cls: "font-medium", value: "500", usage: "ボタン・ラベル" },
  { cls: "font-semibold", value: "600", usage: "小見出し・強調" },
  { cls: "font-bold", value: "700", usage: "見出し" },
  { cls: "font-extrabold", value: "800", usage: "ロゴ・特別な強調" },
] as const;

/**
 * アクセシビリティ最小サイズ
 * このファイルが正。Storybook「基礎/文字」が表示する。
 */
export const MIN_SIZES = {
  body: "16px",
  caption: "12px",
  button: "14px",
} as const;
