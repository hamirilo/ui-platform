/**
 * Rating - 星による 5 段階評価（入力と表示）
 *
 * 「点数を付ける」「点数を読む」の両方を 1 つの形に固定したもの。
 * `onChange` を渡すと入力（radiogroup）、渡さなければ表示専用（role="img"）になる。
 *
 * テンプレート側の `.rating`（tokens/classes.css）と 1:1。一覧に何十個も並ぶ
 * 表示専用の星は Island にせず、テンプレート側のクラスでサーバーが描く。
 *
 * <important>
 * - 星の色は `--color-warning`。raw な amber を足さない（Token で暗所も追従する）。
 * - `value` は 0 を「未評価」として扱う。`emptyText` がそのときの表示。
 * - 入力のときは矢印キーで増減できる。1 つの星を 1 つの radio にすると
 *   Tab が星の数だけ止まるため、radiogroup の中はロービングフォーカスにしない
 *   （押せる的を減らさないために button は残し、tabIndex で 1 つだけ拾う）。
 * </important>
 */

import * as React from "react";
import { cn } from "../../lib/utils";

export type RatingSize = "sm" | "md" | "lg";

export interface RatingProps extends Omit<React.ComponentPropsWithoutRef<"div">, "onChange"> {
  /** 現在の点数。0 は未評価 */
  value?: number;

  /**
   * 星の数
   * @default 5
   */
  max?: number;

  /** 渡すと入力になる。省略すると表示専用 */
  onChange?: (value: number) => void;

  /** `onChange` を渡したうえで一時的に操作を止める */
  readOnly?: boolean;

  /**
   * 星の大きさ
   * @default "md"
   */
  size?: RatingSize;

  /**
   * 読み上げ用の主語
   * @default "評価"
   */
  label?: string;

  /** 星の右に「3 / 5」を添える */
  showValue?: boolean;

  /**
   * 未評価のときに `showValue` が出す文字
   * @default "未評価"
   */
  emptyText?: string;
}

const SIZE_CLASS: Record<RatingSize, string> = {
  sm: "cn-rating-sm",
  md: "cn-rating-md",
  lg: "cn-rating-lg",
};

/** lucide の Star と同じ形。fill を切り替えるだけで塗り／輪郭になる */
function StarShape({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
    </svg>
  );
}

/**
 * Rating コンポーネント
 *
 * @example 表示専用
 * ```tsx
 * <Rating value={4} showValue />
 * ```
 *
 * @example 入力
 * ```tsx
 * const [score, setScore] = useState(0);
 * <Rating value={score} onChange={setScore} size="lg" showValue />
 * ```
 */
export const Rating = React.forwardRef<HTMLDivElement, RatingProps>(
  (
    {
      value = 0,
      max = 5,
      onChange,
      readOnly = false,
      size = "md",
      label = "評価",
      showValue = false,
      emptyText = "未評価",
      className,
      ...props
    },
    ref,
  ) => {
    const [hovered, setHovered] = React.useState(0);
    const interactive = Boolean(onChange) && !readOnly;
    const shown = interactive && hovered ? hovered : value;
    const positions = Array.from({ length: max }, (_, index) => index + 1);
    const valueText = value ? `${value} / ${max}` : emptyText;

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (!interactive || !onChange) return;
      if (event.key === "ArrowRight" || event.key === "ArrowUp") {
        event.preventDefault();
        onChange(Math.min(max, value + 1));
      } else if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
        event.preventDefault();
        onChange(Math.max(0, value - 1));
      }
    };

    return (
      <div
        ref={ref}
        className={cn("cn-rating", SIZE_CLASS[size], className)}
        role={interactive ? "radiogroup" : "img"}
        aria-label={interactive ? label : `${label}: ${max} 段階中 ${value}`}
        onKeyDown={handleKeyDown}
        onMouseLeave={interactive ? () => setHovered(0) : undefined}
        {...props}
      >
        {positions.map((position) =>
          interactive ? (
            <button
              key={position}
              type="button"
              role="radio"
              aria-checked={value === position}
              aria-label={`${max} 段階中 ${position}`}
              tabIndex={position === (value || 1) ? 0 : -1}
              className="cn-rating-item"
              onClick={() => onChange?.(position)}
              onMouseEnter={() => setHovered(position)}
            >
              <span className={cn("cn-rating-star", position > shown && "cn-rating-star-empty")}>
                <StarShape filled={position <= shown} />
              </span>
            </button>
          ) : (
            <span
              key={position}
              className={cn("cn-rating-star", position > shown && "cn-rating-star-empty")}
            >
              <StarShape filled={position <= shown} />
            </span>
          ),
        )}
        {showValue && <span className="cn-rating-value">{valueText}</span>}
      </div>
    );
  },
);

Rating.displayName = "Rating";
