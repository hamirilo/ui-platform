/**
 * Stat - KPI・統計タイル（ラベル・値・単位・増減・補足）
 *
 * ダッシュボードや詳細画面の上部に並ぶ「件数・率・金額」の表示を 1 つの形に固定したもの。
 * Card はこの構造（値を主役にした階層）を持たないため、別部品にしている。
 *
 * テンプレート側の `.stat`（tokens/classes.css）と 1:1。
 *
 * 並べるときは StatGroup で包む。タイルの枠をやめ、区切り線で並べる（decisions/adr-0009）。
 * 画面の主指標は 1 つだけ `size="lg"` にし、大きさと位置で主役を示す。
 *
 * <important>
 * - 値は tabular-nums で描く。桁が揃わないと並べたときに読み比べられない。
 * - `tone` は増減（delta）の色で、値そのものには色を付けない。「増えたら良い」か
 *   「減ったら良い」かは指標ごとに違うため、呼び出し側が positive / negative を決める。
 * - 数値の整形（`toLocaleString()` 等）は呼び出し側で行い、文字列で渡す。
 * - `size="lg"` は 1 画面に 1 つ。主役を枠の色や背景色で示さない。
 * </important>
 */

import * as React from "react";
import { cn } from "../../lib/utils";

export type StatTone = "neutral" | "positive" | "negative" | "warning";

export type StatSize = "default" | "lg";

export interface StatProps extends React.ComponentPropsWithoutRef<"div"> {
  /** 指標の名前（「未対応」「今月の申請」など） */
  label: React.ReactNode;

  /** 値。整形済みの文字列を渡す */
  value: React.ReactNode;

  /** 単位（「件」「%」など）。値の右に小さく添える */
  unit?: React.ReactNode;

  /** 増減・比較（「+3 前週比」など） */
  delta?: React.ReactNode;

  /**
   * delta の色。値には付かない
   * @default "neutral"
   */
  tone?: StatTone;

  /** 補足（「2026-09-01 時点」など） */
  hint?: React.ReactNode;

  /** ラベルの左に置くアイコン */
  icon?: React.ReactNode;

  /**
   * 値の大きさ。画面の主指標 1 つだけを "lg" にする
   * @default "default"
   */
  size?: StatSize;
}

const TONE_CLASS: Record<StatTone, string> = {
  neutral: "cn-stat-delta-neutral",
  positive: "cn-stat-delta-positive",
  negative: "cn-stat-delta-negative",
  warning: "cn-stat-delta-warning",
};

/**
 * Stat コンポーネント
 *
 * @example
 * ```tsx
 * <Stat label="未対応" value="12" unit="件" delta="+3 前週比" tone="negative" />
 * <Stat label="完了率" value="86.5" unit="%" delta="+2.1pt" tone="positive" hint="2026-09-01 時点" />
 * <Stat label="今月の申請" value={count.toLocaleString()} unit="件" />
 *
 * // 主指標を大きく、補助の値を小さく並べる
 * <StatGroup>
 *   <Stat size="lg" label="ユニーク" value="57" unit="人" />
 *   <Stat label="総クリック" value="64" />
 * </StatGroup>
 * ```
 */
export const Stat = React.forwardRef<HTMLDivElement, StatProps>(
  (
    {
      label,
      value,
      unit,
      delta,
      tone = "neutral",
      hint,
      icon,
      size = "default",
      className,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        data-size={size === "default" ? undefined : size}
        className={cn("cn-stat", className)}
        {...props}
      >
        <div className="cn-stat-label">
          {icon}
          <span>{label}</span>
        </div>
        <div className="cn-stat-value">
          {value}
          {unit && <span className="cn-stat-unit">{unit}</span>}
        </div>
        {delta && <div className={cn("cn-stat-delta", TONE_CLASS[tone])}>{delta}</div>}
        {hint && <div className="cn-stat-hint">{hint}</div>}
      </div>
    );
  },
);

Stat.displayName = "Stat";

export type StatGroupProps = React.ComponentPropsWithoutRef<"div">;

/**
 * StatGroup - Stat を枠なしで横に並べる
 *
 * 中の Stat はタイルの枠と背景を失い、間に区切り線が入る。ページの地の上にそのまま置ける。
 * テンプレート側の `.stat-group` と 1:1。
 */
export const StatGroup = React.forwardRef<HTMLDivElement, StatGroupProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("cn-stat-group", className)} {...props} />
  ),
);

StatGroup.displayName = "StatGroup";
