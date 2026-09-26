/**
 * DatePicker - 共有 UI ライブラリの日付選択コンポーネント
 *
 * shadcn/ui の Calendar（react-day-picker）+ Popover をラップし、
 * 単一日付選択（mode="single"）・日付範囲選択（mode="range"）・
 * 複数日選択（mode="multiple"）を提供します。
 * カレンダーからの選択に加え、キーボードによるテキスト直接入力（YYYY/MM/DD, YYYY-MM-DD, YYYYMMDD, YYYY年M月d日等）にも対応しています。
 * 画面側では DatePicker のみを使用し、Calendar/Popover を直接使用しないでください。
 */

import {
  addDays,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isValid,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subDays,
  subMonths,
} from "date-fns";
import { ja } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import * as React from "react";
import type { DateRange } from "react-day-picker";

import { cn } from "../../lib/utils";
import { Calendar } from "../ui/calendar";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "../ui/input-group";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "./Button";

const DISPLAY_FORMAT = "yyyy-MM-dd";
const SHORT_FORMAT = "M/d";

/** multiple モードでトリガーに列挙する最大日数（超過分は「他N件」に畳む） */
const MULTIPLE_LABEL_LIMIT = 3;

export type DatePickerMode = "single" | "range" | "multiple";
export type DatePickerValue = Date | DateRange | Date[];

/**
 * プリセットの定義
 */
export interface DatePickerPreset<T = DatePickerValue> {
  label: string;
  value: T | (() => T);
}

export interface DatePickerProps {
  /**
   * 選択モード
   * - single: 単一日付選択
   * - range: 日付範囲選択（開始日〜終了日）
   * - multiple: 複数日選択（連続でない日付を任意の件数だけ選ぶ）
   */
  mode?: DatePickerMode;

  /**
   * 選択中の値
   * - mode="single" のとき Date
   * - mode="range" のとき DateRange
   * - mode="multiple" のとき Date[]
   */
  value?: DatePickerValue;

  /**
   * 値変更時のコールバック
   */
  onChange?: (value: DatePickerValue | undefined) => void;

  /**
   * 未選択時のプレースホルダー
   */
  placeholder?: string;

  /**
   * 無効化
   */
  disabled?: boolean;

  /**
   * エラー状態
   */
  error?: boolean;

  /**
   * 選択可能な最小日付
   */
  minDate?: Date;

  /**
   * 選択可能な最大日付
   */
  maxDate?: Date;

  /**
   * 追加クラス
   */
  className?: string;

  /**
   * プリセットボタンの表示設定
   * - true: モードに応じた標準プリセットを表示
   *   - single: 「今日」「明日」「昨日」
   *   - range: 「今日」「今週」「今月」「先月」「過去7日間」「過去30日間」
   * - DatePickerPreset[]: カスタムプリセット配列を表示
   * - false / undefined: プリセットを表示しない（デフォルト）
   */
  presets?: boolean | DatePickerPreset[];

  /**
   * 入力欄の id。
   *
   * <important>
   * FormField はラベルの htmlFor をこの id に向ける。受け取らないと
   * `<label for>` が実在しない要素を指し、ラベルクリックが効かず、
   * 読み上げ名も付かない。
   * </important>
   */
  id?: string;

  /** ラベル文字列（画面上にラベルが無い場合） */
  "aria-label"?: string;

  /** ラベルとなる要素の id */
  "aria-labelledby"?: string;

  /** 説明・エラー文言の id（FormField が自動で渡す） */
  "aria-describedby"?: string;

  /** エラー状態（FormField が自動で渡す） */
  "aria-invalid"?: boolean;
}

/**
 * ISO 形式の日付文字列（`YYYY-MM-DD`）を Date にする（ローカル時刻の 0 時）。
 *
 * DatePicker の値は Date だが、API のレスポンスやフォームの state、hidden input は
 * 日付を文字列で持つことが多い。その間の変換に使う。末尾に時刻が付いていても日付部分だけを読む。
 * 空・不正な値は undefined（DatePicker の「未選択」）。
 *
 * ```tsx
 * <DatePicker
 *   value={parseIsoDate(startedOn)}
 *   onChange={(next) => setStartedOn(formatIsoDate(next as Date | undefined))}
 * />
 * ```
 */
export function parseIsoDate(value?: string | null): Date | undefined {
  if (!value) return undefined;
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) return undefined;
  const [, year, month, day] = match;
  return new Date(Number(year), Number(month) - 1, Number(day));
}

/**
 * Date を ISO 形式の日付文字列（`YYYY-MM-DD`）にする。未選択（undefined）は空文字。
 *
 * `toISOString()` は UTC に直すため、日本時間の 0〜9 時台は前日の日付になる。
 * こちらはローカル時刻の年月日をそのまま使う。
 */
export function formatIsoDate(date?: Date | null): string {
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * 単一日付文字列をパースする
 * 対応形式:
 * - 2026-08-23, 2026/08/23, 2026.08.23, 2026-8-3
 * - 2026年8月23日, 2026年08月23日, 2026年8月3日
 * - 20260823 (8桁)
 */
export function parseSingleDateString(str: string): Date | null {
  const trimmed = str.trim();
  if (!trimmed) return null;

  // 8桁数字 (20260823)
  if (/^\d{8}$/.test(trimmed)) {
    const y = Number(trimmed.slice(0, 4));
    const m = Number(trimmed.slice(4, 6)) - 1;
    const d = Number(trimmed.slice(6, 8));
    const date = new Date(y, m, d);
    if (
      date.getFullYear() === y &&
      date.getMonth() === m &&
      date.getDate() === d &&
      isValid(date)
    ) {
      return date;
    }
  }

  // YYYY-MM-DD, YYYY/MM/DD, YYYY.MM.DD
  const matchStandard = trimmed.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  if (matchStandard) {
    const y = Number(matchStandard[1]);
    const m = Number(matchStandard[2]) - 1;
    const d = Number(matchStandard[3]);
    const date = new Date(y, m, d);
    if (
      date.getFullYear() === y &&
      date.getMonth() === m &&
      date.getDate() === d &&
      isValid(date)
    ) {
      return date;
    }
  }

  // YYYY年M月D日
  const matchJa = trimmed.match(/^(\d{4})年\s*(\d{1,2})月\s*(\d{1,2})日?$/);
  if (matchJa) {
    const y = Number(matchJa[1]);
    const m = Number(matchJa[2]) - 1;
    const d = Number(matchJa[3]);
    const date = new Date(y, m, d);
    if (
      date.getFullYear() === y &&
      date.getMonth() === m &&
      date.getDate() === d &&
      isValid(date)
    ) {
      return date;
    }
  }

  return null;
}

/**
 * 範囲文字列をパースする (例: "2026/08/01 〜 2026/08/31", "2026-08-01 - 2026-08-31")
 */
export function parseRangeString(str: string): DateRange | null {
  const trimmed = str.trim();
  if (!trimmed) return null;

  const parts = trimmed.split(/\s*(?:〜|~|\.\.|to)\s*|\s+-\s+/);
  if (parts.length === 1) {
    const from = parseSingleDateString(parts[0]);
    return from ? { from, to: undefined } : null;
  }
  if (parts.length >= 2) {
    const from = parseSingleDateString(parts[0]);
    const to = parseSingleDateString(parts[1]);
    if (from && to) {
      return from.getTime() <= to.getTime() ? { from, to } : { from: to, to: from };
    }
    if (from) return { from, to: undefined };
    if (to) return { from: to, to: undefined };
  }
  return null;
}

/**
 * 複数日文字列をパースする (例: "2026/08/01, 2026/08/02", "2026-08-01、2026-08-02")
 */
export function parseMultipleString(str: string): Date[] | null {
  const trimmed = str.trim();
  if (!trimmed) return null;

  const parts = trimmed.split(/[,、\s]+/);
  const dates: Date[] = [];
  for (const part of parts) {
    const parsed = parseSingleDateString(part);
    if (parsed) {
      dates.push(parsed);
    }
  }
  if (!dates.length) return null;
  const unique = Array.from(new Map(dates.map((d) => [d.getTime(), d])).values()).sort(
    (a, b) => a.getTime() - b.getTime(),
  );
  return unique;
}

function isDateWithinLimits(date: Date, minDate?: Date, maxDate?: Date): boolean {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  if (minDate) {
    const min = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate()).getTime();
    if (d < min) return false;
  }
  if (maxDate) {
    const max = new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate()).getTime();
    if (d > max) return false;
  }
  return true;
}

/**
 * 選択モードに応じた標準プリセットを生成する
 */
export function getDefaultPresets(
  mode: DatePickerMode,
  referenceDate: Date = new Date(),
): DatePickerPreset[] {
  const today = startOfDay(referenceDate);

  if (mode === "single") {
    return [
      {
        label: "今日",
        value: () => today,
      },
      {
        label: "明日",
        value: () => addDays(today, 1),
      },
      {
        label: "昨日",
        value: () => subDays(today, 1),
      },
    ];
  }

  if (mode === "range") {
    return [
      {
        label: "今日",
        value: () => ({ from: today, to: today }),
      },
      {
        label: "今週",
        value: () => ({
          from: startOfWeek(today, { weekStartsOn: 1 }),
          to: endOfWeek(today, { weekStartsOn: 1 }),
        }),
      },
      {
        label: "今月",
        value: () => ({
          from: startOfMonth(today),
          to: endOfMonth(today),
        }),
      },
      {
        label: "先月",
        value: () => {
          const lastMonth = subMonths(today, 1);
          return {
            from: startOfMonth(lastMonth),
            to: endOfMonth(lastMonth),
          };
        },
      },
      {
        label: "過去7日間",
        value: () => ({
          from: subDays(today, 6),
          to: today,
        }),
      },
      {
        label: "過去30日間",
        value: () => ({
          from: subDays(today, 29),
          to: today,
        }),
      },
    ];
  }

  return [];
}

/**
 * プリセット値が選択可能範囲内（minDate/maxDate）にあるかを判定する
 */
export function isPresetDisabled(val: DatePickerValue, minDate?: Date, maxDate?: Date): boolean {
  if (val instanceof Date) {
    return !isDateWithinLimits(val, minDate, maxDate);
  }
  if (Array.isArray(val)) {
    return !val.every((d) => isDateWithinLimits(d, minDate, maxDate));
  }
  if (typeof val === "object" && val !== null && "from" in val) {
    const range = val as DateRange;
    if (range.from && !isDateWithinLimits(range.from, minDate, maxDate)) return true;
    if (range.to && !isDateWithinLimits(range.to, minDate, maxDate)) return true;
    return false;
  }
  return false;
}

/**
 * プリセット値が現在選択中の値と一致しているかを判定する
 */
export function isPresetActive(
  presetVal: DatePickerValue,
  currentVal?: DatePickerValue,
  mode: DatePickerMode = "single",
): boolean {
  if (!currentVal) return false;

  if (mode === "single") {
    if (!(presetVal instanceof Date) || !(currentVal instanceof Date)) return false;
    return isSameDay(presetVal, currentVal);
  }

  if (mode === "range") {
    const pRange = presetVal as DateRange;
    const cRange = currentVal as DateRange;
    if (!pRange.from || !cRange.from) return false;

    const fromMatch = isSameDay(pRange.from, cRange.from);
    if (!fromMatch) return false;

    if (!pRange.to && !cRange.to) return true;
    if (pRange.to && cRange.to) {
      return isSameDay(pRange.to, cRange.to);
    }
    return false;
  }

  if (mode === "multiple") {
    if (!Array.isArray(presetVal) || !Array.isArray(currentVal)) return false;
    if (presetVal.length !== currentVal.length) return false;
    return presetVal.every((d, i) => isSameDay(d, currentVal[i]));
  }

  return false;
}

export function formatValue(mode: DatePickerMode, value?: DatePickerValue): string {
  if (!value) return "";

  if (mode === "multiple") {
    const dates = value as Date[];
    if (!dates.length) return "";
    const sorted = [...dates].sort((a, b) => a.getTime() - b.getTime());
    const shown = sorted
      .slice(0, MULTIPLE_LABEL_LIMIT)
      .map((d) => format(d, SHORT_FORMAT, { locale: ja }))
      .join(", ");
    const rest = sorted.length - MULTIPLE_LABEL_LIMIT;
    const detail = rest > 0 ? `${shown} 他${rest}件` : shown;
    return `${sorted.length}日選択（${detail}）`;
  }

  if (mode === "range") {
    const range = value as DateRange;
    if (!range.from) return "";
    const fromLabel = format(range.from, DISPLAY_FORMAT, { locale: ja });
    if (!range.to) return `${fromLabel} 〜`;
    return `${fromLabel} 〜 ${format(range.to, DISPLAY_FORMAT, { locale: ja })}`;
  }

  return format(value as Date, DISPLAY_FORMAT, { locale: ja });
}

/**
 * DatePicker コンポーネント
 *
 * @example
 * ```tsx
 * // 単一日付選択（直接入力 & カレンダー選択対応）
 * const [date, setDate] = useState<Date>()
 * <DatePicker mode="single" value={date} onChange={(v) => setDate(v as Date)} />
 *
 * // 日付範囲選択
 * const [range, setRange] = useState<DateRange>()
 * <DatePicker mode="range" value={range} onChange={(v) => setRange(v as DateRange)} />
 *
 * // 複数日選択（日程調整の候補日など）
 * const [dates, setDates] = useState<Date[]>([])
 * <DatePicker mode="multiple" value={dates} onChange={(v) => setDates((v as Date[]) ?? [])} />
 * ```
 */
export function DatePicker({
  mode = "single",
  value,
  onChange,
  placeholder = "日付を選択",
  disabled = false,
  error = false,
  minDate,
  maxDate,
  className,
  presets,
  id,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = React.useState<DatePickerValue | undefined>(value);
  const currentValue = isControlled ? value : internalValue;

  const [inputValue, setInputValue] = React.useState(() => formatValue(mode, currentValue));
  const [isFocused, setIsFocused] = React.useState(false);

  const resolvedPresets: DatePickerPreset[] = React.useMemo(() => {
    if (!presets) return [];
    if (Array.isArray(presets)) return presets;
    return getDefaultPresets(mode);
  }, [presets, mode]);

  const updateValue = React.useCallback(
    (newVal: DatePickerValue | undefined) => {
      if (!isControlled) {
        setInternalValue(newVal);
      }
      onChange?.(newVal);
    },
    [isControlled, onChange],
  );

  // 外部からの value 更新時にテキスト入力を同期
  React.useEffect(() => {
    if (isControlled && !isFocused) {
      setInputValue(formatValue(mode, value));
    }
  }, [value, mode, isFocused, isControlled]);

  const dateLimits = [
    ...(minDate ? [{ before: minDate }] : []),
    ...(maxDate ? [{ after: maxDate }] : []),
  ];
  const disabledMatcher = dateLimits.length > 0 ? dateLimits : undefined;

  // カレンダーの表示月（入力または選択値に基づく初期値）
  const getInitialMonth = React.useCallback(() => {
    if (mode === "single") {
      const d =
        (currentValue as Date | undefined) ??
        (inputValue ? parseSingleDateString(inputValue) : undefined);
      return d ?? new Date();
    }
    if (mode === "range") {
      const r = currentValue as DateRange | undefined;
      return r?.from ?? new Date();
    }
    if (mode === "multiple") {
      const d = currentValue as Date[] | undefined;
      return d?.[0] ?? new Date();
    }
    return new Date();
  }, [mode, currentValue, inputValue]);

  const [month, setMonth] = React.useState<Date>(getInitialMonth);

  // Popover が開いたときに、選択中の値があればその月に合わせる
  React.useEffect(() => {
    if (open) {
      if (mode === "single" && currentValue instanceof Date) {
        setMonth(currentValue);
      } else if (mode === "range") {
        const from = (currentValue as DateRange | undefined)?.from;
        if (from) setMonth(from);
      } else if (mode === "multiple" && Array.isArray(currentValue) && currentValue[0]) {
        setMonth(currentValue[0]);
      }
    }
  }, [open, mode, currentValue]);

  // テキスト入力をコミット（確定・反映）
  const commitInput = React.useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) {
        updateValue(undefined);
        setInputValue("");
        return;
      }

      if (mode === "single") {
        const parsed = parseSingleDateString(trimmed);
        if (parsed && isDateWithinLimits(parsed, minDate, maxDate)) {
          updateValue(parsed);
          setInputValue(format(parsed, DISPLAY_FORMAT, { locale: ja }));
          setMonth(parsed);
        } else {
          // 不正または制限外の場合は元の値にリセット
          setInputValue(formatValue(mode, currentValue));
        }
      } else if (mode === "range") {
        const parsed = parseRangeString(trimmed);
        if (
          parsed &&
          (!parsed.from || isDateWithinLimits(parsed.from, minDate, maxDate)) &&
          (!parsed.to || isDateWithinLimits(parsed.to, minDate, maxDate))
        ) {
          updateValue(parsed);
          setInputValue(formatValue(mode, parsed));
          if (parsed.from) setMonth(parsed.from);
        } else {
          setInputValue(formatValue(mode, currentValue));
        }
      } else if (mode === "multiple") {
        const parsed = parseMultipleString(trimmed);
        if (parsed?.every((d) => isDateWithinLimits(d, minDate, maxDate))) {
          updateValue(parsed);
          setInputValue(formatValue(mode, parsed));
          if (parsed[0]) setMonth(parsed[0]);
        } else {
          setInputValue(formatValue(mode, currentValue));
        }
      }
    },
    [mode, currentValue, updateValue, minDate, maxDate],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleBlur = () => {
    setIsFocused(false);
    commitInput(inputValue);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commitInput(inputValue);
      setOpen(false);
    } else if (e.key === "Escape") {
      setOpen(false);
    } else if (e.key === "ArrowDown" && !open) {
      e.preventDefault();
      setOpen(true);
    }
  };

  const handleSelectPreset = (preset: DatePickerPreset) => {
    const rawVal = typeof preset.value === "function" ? preset.value() : preset.value;
    if (isPresetDisabled(rawVal, minDate, maxDate)) {
      return;
    }
    updateValue(rawVal);
    setInputValue(formatValue(mode, rawVal));

    if (rawVal instanceof Date) {
      setMonth(rawVal);
    } else if (Array.isArray(rawVal) && rawVal.length > 0) {
      setMonth(rawVal[0]);
    } else if (rawVal && typeof rawVal === "object" && "from" in rawVal && rawVal.from) {
      setMonth(rawVal.from);
    }

    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <InputGroup
        className={cn(
          error && "border-danger",
          disabled && "opacity-50 pointer-events-none",
          className,
        )}
      >
        <InputGroupInput
          id={id}
          type="text"
          disabled={disabled}
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          aria-describedby={ariaDescribedBy}
          aria-invalid={ariaInvalid || error || undefined}
        />
        <InputGroupAddon align="inline-end">
          <PopoverTrigger
            disabled={disabled}
            render={<InputGroupButton size="icon-xs" aria-label="カレンダーを開く" tabIndex={-1} />}
          >
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </PopoverTrigger>
        </InputGroupAddon>
      </InputGroup>
      <PopoverContent className="w-auto p-0" align="start">
        <div className={cn("flex flex-col", resolvedPresets.length > 0 && "sm:flex-row")}>
          {resolvedPresets.length > 0 && (
            <div className="flex flex-row flex-wrap sm:flex-col gap-1 border-b sm:border-b-0 sm:border-r border-border p-2 sm:w-32 shrink-0">
              <div className="w-full text-xs font-medium text-muted-foreground px-2 py-1">
                プリセット
              </div>
              {resolvedPresets.map((preset) => {
                const rawVal = typeof preset.value === "function" ? preset.value() : preset.value;
                const isDisabled = isPresetDisabled(rawVal, minDate, maxDate);
                const isActive = isPresetActive(rawVal, currentValue, mode);

                return (
                  <Button
                    key={preset.label}
                    type="button"
                    variant={isActive ? "secondary" : "ghost"}
                    size="sm"
                    disabled={isDisabled}
                    className={cn(
                      "justify-start h-8 px-2 text-xs font-normal",
                      isActive && "font-medium bg-muted",
                    )}
                    onClick={() => handleSelectPreset(preset)}
                  >
                    {preset.label}
                  </Button>
                );
              })}
            </div>
          )}
          <div>
            {mode === "multiple" ? (
              <Calendar
                mode="multiple"
                locale={ja}
                selected={currentValue as Date[] | undefined}
                onSelect={(dates) => {
                  updateValue(dates);
                  setInputValue(formatValue(mode, dates));
                }}
                disabled={disabledMatcher}
                numberOfMonths={2}
                month={month}
                onMonthChange={setMonth}
              />
            ) : mode === "range" ? (
              <Calendar
                mode="range"
                locale={ja}
                selected={currentValue as DateRange | undefined}
                onSelect={(range) => {
                  updateValue(range);
                  setInputValue(formatValue(mode, range));
                }}
                disabled={disabledMatcher}
                numberOfMonths={2}
                month={month}
                onMonthChange={setMonth}
              />
            ) : (
              <Calendar
                mode="single"
                locale={ja}
                selected={currentValue as Date | undefined}
                onSelect={(date) => {
                  updateValue(date);
                  setInputValue(formatValue(mode, date));
                  setOpen(false);
                }}
                disabled={disabledMatcher}
                month={month}
                onMonthChange={setMonth}
              />
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

DatePicker.displayName = "DatePicker";
