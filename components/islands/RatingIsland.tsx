/**
 * RatingIsland - Django Form の点数フィールドに差し込める星の入力 Island
 *
 * 責務は「見た目と操作」だけです。値は Django Form が描いた
 * `<input type="hidden">` が持ち、送信は通常の Django Form フィールドとして
 * 行われます（DatePickerIsland と同じ契約）。
 *
 * Django テンプレートでの使い方:
 *
 * ```html
 * {{ form.score }}   {# forms.HiddenInput() で描く #}
 * <div
 *   data-react="rating"
 *   data-target="id_score"
 *   data-value="3"
 *   data-max="5"
 *   data-label="評価"
 * ></div>
 * ```
 *
 * <important>
 * hidden input の value を書き換えたあと input / change を発火させます。
 * 素の DOM 代入だけでは htmx の `hx-trigger="change"` や field-visibility Island が
 * 気づかず、同じフォームの中で連動する部分が動かないためです。
 * </important>
 */

import { useCallback, useState } from "react";
import { Rating, type RatingSize } from "../application/Rating";

export interface RatingIslandProps {
  /** 値を書き込む hidden input の id */
  target: string;

  /** 初期値。0 は未評価 */
  value?: number;

  /**
   * 星の数
   * @default 5
   */
  max?: number;

  /**
   * 星の大きさ
   * @default "lg"
   */
  size?: RatingSize;

  /**
   * 読み上げ用の主語
   * @default "評価"
   */
  label?: string;

  /** 星の右に「3 / 5」を添える */
  showValue?: boolean;
}

export function RatingIsland({
  target,
  value = 0,
  max = 5,
  size = "lg",
  label = "評価",
  showValue = true,
}: RatingIslandProps) {
  const [score, setScore] = useState(value);

  const commit = useCallback(
    (next: number) => {
      setScore(next);
      const input = document.getElementById(target) as HTMLInputElement | null;
      if (!input) return;
      input.value = String(next);
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
    },
    [target],
  );

  return (
    <Rating
      value={score}
      max={max}
      size={size}
      label={label}
      showValue={showValue}
      onChange={commit}
    />
  );
}
