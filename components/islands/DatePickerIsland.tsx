/**
 * DatePickerIsland - Django Form の日付フィールドに宣言的に差し込める日付選択 Island
 *
 * このコンポーネントの責務は「見た目（カレンダー UI）」だけです。
 * 実際の値は Django Form がレンダリングした素の `<input type="hidden">` が保持し、
 * フォーム送信時は通常の Django Form フィールドとして POST されます（フォーム自体を JSON 化しない）。
 * React 側は選択結果でその hidden input の value を書き換えるだけで、
 * 自前の hidden input は生成しません（name の重複を避けるため）。
 *
 * Django Form 側では対象フィールドの widget を `forms.HiddenInput()` にしておき、
 * `{{ form.start_date }}` をそのまま出力した横にこの Island を配置します。
 *
 * Django テンプレートでの使い方（単一日付）:
 *
 * ```html
 * {{ form.start_date }}
 * <div
 *   data-react="date-picker"
 *   data-mode="single"
 *   data-target="id_{{ form.start_date.html_name }}"
 *   data-value="{{ form.start_date.value|date:'Y-m-d'|default:'' }}"
 *   data-placeholder="開始日を選択"
 * ></div>
 * ```
 *
 * 日付範囲選択（開始日〜終了日）:
 *
 * ```html
 * {{ filter_form.date_from }}
 * {{ filter_form.date_to }}
 * <div
 *   data-react="date-picker"
 *   data-mode="range"
 *   data-target-from="id_date_from"
 *   data-target-to="id_date_to"
 *   data-value-from="{{ filter_form.date_from.value|default:'' }}"
 *   data-value-to="{{ filter_form.date_to.value|default:'' }}"
 * ></div>
 * ```
 */

import { useEffect, useState } from "react";
import type { DateRange } from "react-day-picker";
import { DatePicker, formatIsoDate, parseIsoDate } from "../application/DatePicker";

export interface DatePickerIslandProps {
  /**
   * 選択モード
   * @default "single"
   */
  mode?: "single" | "range";

  /**
   * 値を書き込む対象 hidden input の id（mode="single" のとき必須）
   * Django Form が `forms.HiddenInput()` でレンダリングした input の id を指定する
   */
  target?: string;

  /**
   * 初期値（ISO 形式 "YYYY-MM-DD"。mode="single" のとき使用）
   */
  value?: string;

  /**
   * 開始日側 hidden input の id（mode="range" のとき必須）
   */
  targetFrom?: string;

  /**
   * 終了日側 hidden input の id（mode="range" のとき必須）
   */
  targetTo?: string;

  /**
   * 開始日の初期値（ISO 形式。mode="range" のとき使用）
   */
  valueFrom?: string;

  /**
   * 終了日の初期値（ISO 形式。mode="range" のとき使用）
   */
  valueTo?: string;

  /**
   * 未選択時のプレースホルダー
   */
  placeholder?: string;

  /**
   * 選択可能な最小日付（ISO 形式）
   */
  minDate?: string;

  /**
   * 選択可能な最大日付（ISO 形式）
   */
  maxDate?: string;

  /**
   * プリセットボタンの表示
   */
  presets?: boolean;
}

function useHiddenInputSync(targetId: string | undefined, isoValue: string) {
  useEffect(() => {
    if (!targetId) return;
    const el = document.getElementById(targetId) as HTMLInputElement | null;
    if (el) el.value = isoValue;
  }, [targetId, isoValue]);
}

export function DatePickerIsland({
  mode = "single",
  target,
  value,
  targetFrom,
  targetTo,
  valueFrom,
  valueTo,
  placeholder,
  minDate,
  maxDate,
  presets,
}: DatePickerIslandProps) {
  const [singleDate, setSingleDate] = useState<Date | undefined>(() => parseIsoDate(value));
  const [range, setRange] = useState<DateRange | undefined>(() => {
    const from = parseIsoDate(valueFrom);
    const to = parseIsoDate(valueTo);
    return from || to ? { from, to } : undefined;
  });

  const singleIso = formatIsoDate(singleDate);
  const fromIso = formatIsoDate(range?.from);
  const toIso = formatIsoDate(range?.to);

  useHiddenInputSync(target, singleIso);
  useHiddenInputSync(targetFrom, fromIso);
  useHiddenInputSync(targetTo, toIso);

  if (mode === "range") {
    return (
      <DatePicker
        mode="range"
        value={range}
        onChange={(v) => setRange(v as DateRange | undefined)}
        placeholder={placeholder}
        minDate={parseIsoDate(minDate)}
        maxDate={parseIsoDate(maxDate)}
        presets={presets}
      />
    );
  }

  return (
    <DatePicker
      mode="single"
      value={singleDate}
      onChange={(v) => setSingleDate(v as Date | undefined)}
      placeholder={placeholder}
      minDate={parseIsoDate(minDate)}
      maxDate={parseIsoDate(maxDate)}
      presets={presets}
    />
  );
}
