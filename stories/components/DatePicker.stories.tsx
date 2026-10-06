import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import type { DateRange } from "react-day-picker";
import { Button, DatePicker, FormField } from "../../components/application";
import { Labeled, Section, Showcase, Stack } from "../_showcase";

/**
 * DatePicker は日付を選ぶ・入力するコンポーネント。
 *
 * <important>
 * カレンダーからの選択に加えて、キーボードによる直接入力（`2026/08/23`, `2026-08-23`, `20260823`, `2026年8月23日` 等）に対応しています。
 * 表示は「2026年7月31日」形式（`yyyy年M月d日`）、カレンダーは日本語ロケール。
 * `value` / `onChange` の型はモードによって変わる（下記 Props 参照）。
 * </important>
 */
const meta = {
  title: "コンポーネント/DatePicker",
  component: DatePicker,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
## 目的

日付入力の表記・ロケール・選択操作・テキスト入力を統一する。
\`<input type="date">\` はブラウザによって表記も操作も違うため、
**業務上重要な日付は必ずこのコンポーネントを使う**。

カレンダーからのマウス・タッチ選択だけでなく、**キーボードによるテキスト直接入力**にも対応しています。

## 使う場面

| モード | 用途 | 直接入力の例 |
|---|---|---|
| \`single\` | 単一の日付（希望納期、実施日、期限） | \`2026/08/23\`, \`2026-08-23\`, \`20260823\`, \`2026年8月23日\` |
| \`range\` | 期間（集計対象の開始〜終了、休暇の申請期間） | \`2026/08/01 〜 2026/08/31\`, \`2026-08-01 - 2026-08-31\` |
| \`multiple\` | 連続しない複数日（日程調整の候補日、出勤希望日） | \`2026/08/01, 2026/08/05\` |

## 使わない場面

| 場面 | 代わりに使うもの |
|---|---|
| テンプレート（.html） | flatpickr（\`input-field flatpickr-input\` クラス）。React コンポーネントを新設しない |
| 日時（時刻まで）が必要 | 時刻の入力は未対応。日付 + 別途 \`<input type="time">\` を組み合わせる |
| 生年月日の入力 | カレンダーで何十年も遡るのは苦しい。直接入力または年・月・日の \`Select\` を検討 |
| 「今日」「今週」のような相対指定 | ボタンによるプリセットを併設する（Story の \`WithPresets\` を参照） |
| 過去の日付を大量に絞り込む一覧 | \`range\` + プリセットの併用。カレンダー単独では手数が多い |

## Props

| Prop | 型 | 説明 |
|---|---|---|
| \`mode\` | \`single\`（既定） / \`range\` / \`multiple\` | 選択モード |
| \`value\` | \`Date\` / \`DateRange\` / \`Date[]\` | **モードに対応した型を渡す** |
| \`onChange\` | \`(value) => void\` | 値の変更。**モードに応じてキャストが必要** |
| \`placeholder\` | \`string\` | 未選択時の表示（既定 \`日付を選択\`） |
| \`disabled\` | \`boolean\` | 無効化 |
| \`error\` | \`boolean\` | エラー状態（枠線が赤色になり \`aria-invalid\` が付く） |
| \`minDate\` / \`maxDate\` | \`Date\` | 選択可能な範囲。範囲外はカレンダー上で選べず、直接入力でも弾かれます |
| \`presets\` | \`boolean\` / \`DatePickerPreset[]\` | カレンダーPopover内にプリセットボタンを表示（\`true\` で標準、配列でカスタム） |
| \`className\` | \`string\` | 入力フィールドへの追加クラス（幅の指定など） |

モードごとの型の扱い:

\`\`\`tsx
// single
const [date, setDate] = useState<Date>()
<DatePicker mode="single" value={date} onChange={(v) => setDate(v as Date)} />

// range
const [range, setRange] = useState<DateRange>()
<DatePicker mode="range" value={range} onChange={(v) => setRange(v as DateRange)} />

// multiple
const [dates, setDates] = useState<Date[]>([])
<DatePicker mode="multiple" value={dates} onChange={(v) => setDates((v as Date[]) ?? [])} />
\`\`\`

## 直接入力とキーボード操作

- **フォーマットの自動パース**: \`YYYY/MM/DD\`, \`YYYY-MM-DD\`, \`YYYYMMDD\`, \`YYYY年M月D日\` などの入力を柔軟に解釈します。
- **Enter キー**: 入力中のテキストを確定し、カレンダーを閉じます。
- **Escape キー**: カレンダーを閉じます。
- **↓ キー**: 入力欄フォーカス中に下矢印キーでカレンダーを開きます。
- **フォーカスアウト（Blur）**: 入力中のテキストをパースして正規形式（\`yyyy年M月d日\`）に整形します。不正な文字列の場合は元の値にリセットされます。

## 注意事項

- **\`mode\` と \`value\` の型を必ず一致させる。**
  型が合っていないと表示が崩れる（\`onChange\` の値は \`as\` でキャストする設計）
- **\`range\` は \`to\` が未確定の状態がある。** 1 回目のクリックで \`from\` のみが入り、
  トリガーには「2026年7月1日 〜」と表示される。
  **送信前に \`to\` の有無を検証する**こと
- \`single\` はカレンダー選択時に自動で閉じるが、
  **\`range\` と \`multiple\` は閉じない**（連続で選ぶため）。
  閉じるのは外側クリックか \`Esc\` / \`Enter\`
- **application へ送るときは文字列に変換する。**
  \`format(date, 'yyyy-MM-dd')\` を使う。\`toISOString()\` は UTC に変換されるため、
  日本時間の早朝が前日になる
- **未選択と「今日」を混同しない。** \`value\` の初期値に \`new Date()\` を入れると、
  利用者が選んでいないのに日付が入った状態になる。任意項目では \`undefined\` から始める
- \`minDate\` / \`maxDate\` はカレンダー側・入力パース側の制限。**サーバー側の検証は別途必須**
        `,
      },
    },
  },
  argTypes: {
    mode: { control: "inline-radio", options: ["single", "range", "multiple"] },
    value: { table: { disable: true } },
    onChange: { table: { disable: true } },
    placeholder: { control: "text" },
    disabled: { control: "boolean" },
    error: { control: "boolean" },
    minDate: { table: { disable: true } },
    maxDate: { table: { disable: true } },
  },
  args: {
    mode: "single",
    placeholder: "日付を選択",
  },
  decorators: [
    (Story) => (
      // カレンダーが下に開くので余白を確保する
      <div className="min-h-96 max-w-2xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * mode と状態を 1 画面で比較する。
 *
 * 表示・入力の形式は `yyyy-MM-dd` に固定している。
 * 画面ごとに和暦や `yyyy/MM/dd` へ変えない。
 */
export const Overview: Story = {
  parameters: { controls: { disable: true } },
  render: () => {
    const [single, setSingle] = React.useState<Date | undefined>(new Date(2026, 3, 20));
    const [range, setRange] = React.useState<DateRange | undefined>({
      from: new Date(2026, 3, 20),
      to: new Date(2026, 3, 24),
    });
    const [multiple, setMultiple] = React.useState<Date[] | undefined>([
      new Date(2026, 3, 20),
      new Date(2026, 3, 22),
    ]);

    return (
      <Showcase>
        <Section title="Modes" note="単日・期間・複数日。期間は from だけ選ばれた中間状態を持つ。">
          <Stack className="max-w-md">
            <Labeled label='mode="single"（既定）'>
              <DatePicker
                mode="single"
                value={single}
                onChange={(v) => setSingle(v as Date | undefined)}
                className="w-64"
              />
            </Labeled>
            <Labeled label='mode="range"'>
              <DatePicker
                mode="range"
                value={range}
                onChange={(v) => setRange(v as DateRange | undefined)}
                className="w-64"
              />
            </Labeled>
            <Labeled label='mode="multiple"'>
              <DatePicker
                mode="multiple"
                value={multiple}
                onChange={(v) => setMultiple(v as Date[] | undefined)}
                className="w-64"
              />
            </Labeled>
          </Stack>
        </Section>

        <Section
          title="States"
          note="選択できない範囲は minDate / maxDate で閉じる。エラーは枠線だけで理由を示さないため、文章を併記する。"
        >
          <Stack className="max-w-md">
            <Labeled label="未選択（placeholder）">
              <DatePicker mode="single" placeholder="日付を選択" className="w-64" />
            </Labeled>
            <Labeled label="エラー">
              <DatePicker mode="single" error placeholder="日付を選択" className="w-64" />
            </Labeled>
            <Labeled label="無効">
              <DatePicker
                mode="single"
                disabled
                value={new Date(2026, 3, 20)}
                className="w-64"
              />
            </Labeled>
            <Labeled label="minDate / maxDate（今日以降 30 日まで）">
              <DatePicker
                mode="single"
                minDate={new Date(2026, 3, 1)}
                maxDate={new Date(2026, 3, 30)}
                placeholder="2026-04-01 〜 2026-04-30"
                className="w-64"
              />
            </Labeled>
          </Stack>
        </Section>

        <Section title="With Label" note="実装ではこの形が基本。">
          <Stack className="max-w-md">
            <FormField label="希望日" required helpText="yyyy-MM-dd 形式で直接入力もできます">
              <DatePicker mode="single" placeholder="日付を選択" className="w-64" />
            </FormField>
          </Stack>
        </Section>
      </Showcase>
    );
  },
};

/**
 * 単一日付（`mode="single"`）。
 *
 * 選択すると**カレンダーが自動で閉じる**。
 * 初期値は `undefined`（未選択）から始める。
 */
export const Single: Story = {
  render: (args) => {
    const [date, setDate] = React.useState<Date | undefined>(undefined);
    return (
      <div className="space-y-3">
        <DatePicker
          {...args}
          mode="single"
          value={date}
          onChange={(v) => setDate(v as Date | undefined)}
          className="w-64"
        />
        <p className="text-sm text-muted-foreground">
          選択値: {date ? date.toLocaleDateString("ja-JP") : "（未選択）"}
        </p>
      </div>
    );
  },
};

/**
 * 期間（`mode="range"`）。
 *
 * 2 ヶ月分のカレンダーが表示され、**選択後も閉じない**。
 * 1 回目のクリックで `from` のみが入るため、
 * `to` が未確定の状態（「2026年7月1日 〜」）が存在する。
 */
export const Range: Story = {
  render: (args) => {
    const [range, setRange] = React.useState<DateRange | undefined>(undefined);
    const incomplete = Boolean(range?.from && !range?.to);

    return (
      <div className="space-y-3">
        <DatePicker
          {...args}
          mode="range"
          value={range}
          onChange={(v) => setRange(v as DateRange | undefined)}
          placeholder="期間を選択"
          className="w-80"
        />
        {incomplete && (
          <p role="alert" className="text-sm text-red-600">
            終了日を選択してください（`to` が未確定です）
          </p>
        )}
        <p className="text-sm text-muted-foreground">
          from: {range?.from?.toLocaleDateString("ja-JP") ?? "—"} / to:{" "}
          {range?.to?.toLocaleDateString("ja-JP") ?? "—"}
        </p>
      </div>
    );
  },
};

/**
 * 複数日（`mode="multiple"`）。
 *
 * 連続しない日付を任意の件数だけ選べる。日程調整の候補日など。
 * トリガーは**先頭 3 件まで列挙し、残りは「他N件」に畳む**。
 */
export const Multiple: Story = {
  render: (args) => {
    const [dates, setDates] = React.useState<Date[]>([]);
    return (
      <div className="space-y-3">
        <DatePicker
          {...args}
          mode="multiple"
          value={dates}
          onChange={(v) => setDates((v as Date[]) ?? [])}
          placeholder="候補日を選択"
          className="w-80"
        />
        <p className="text-sm text-muted-foreground">{dates.length} 日を選択中</p>
      </div>
    );
  },
};

/** 初期値あり。編集画面のように、既存の値を表示する場合。 */
export const WithInitialValue: Story = {
  render: (args) => {
    const [date, setDate] = React.useState<Date | undefined>(new Date(2026, 7, 15));
    return (
      <DatePicker
        {...args}
        mode="single"
        value={date}
        onChange={(v) => setDate(v as Date | undefined)}
        className="w-64"
      />
    );
  },
};

/**
 * 選択範囲の制限（`minDate` / `maxDate`）。
 *
 * 範囲外の日付はカレンダー上で選べなくなる。
 * **ただしこれは入力補助にすぎない。サーバー側の検証は必ず行う。**
 */
export const WithMinMax: Story = {
  render: (args) => {
    const [date, setDate] = React.useState<Date | undefined>(undefined);
    const min = new Date(2026, 7, 1);
    const max = new Date(2026, 7, 31);

    return (
      <div className="space-y-3">
        <FormField
          label="希望納期"
          required
          helpText="2026年8月1日 〜 2026年8月31日 の範囲で選択できます"
        >
          <DatePicker
            {...args}
            mode="single"
            value={date}
            onChange={(v) => setDate(v as Date | undefined)}
            minDate={min}
            maxDate={max}
            className="w-64"
          />
        </FormField>
      </div>
    );
  },
};

/** 無効化。権限がない場合や、確定後に変更させない場合。 */
export const Disabled: Story = {
  render: (args) => (
    <DatePicker
      {...args}
      mode="single"
      value={new Date(2026, 6, 31)}
      disabled
      className="w-64"
    />
  ),
};

/**
 * `FormField` と組み合わせる例。
 *
 * トリガーは `input-field` クラスを使っているため、
 * `Input` と**同じ高さ・同じ枠**で並ぶ。
 */
export const InForm: Story = {
  render: (args) => {
    const [range, setRange] = React.useState<DateRange | undefined>(undefined);
    const [error, setError] = React.useState<string | undefined>(undefined);

    const submit = () => {
      if (!range?.from || !range?.to) {
        setError("開始日と終了日の両方を選択してください");
        return;
      }
      setError(undefined);
    };

    return (
      <form
        className="max-w-md space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <FormField label="集計期間" required error={error}>
          <DatePicker
            {...args}
            mode="range"
            value={range}
            onChange={(v) => {
              setRange(v as DateRange | undefined);
              setError(undefined);
            }}
            placeholder="期間を選択"
            className="w-full"
          />
        </FormField>

        <Button variant="primary" type="submit">
          この期間で集計
        </Button>

        <p className="text-xs text-muted-foreground">
          未選択のまま送信すると、<code>to</code> の検証が必要な理由が分かります。
        </p>
      </form>
    );
  },
};

/**
 * 組み込みプリセット（`presets={true}`）。
 *
 * カレンダーの Popover 内に「今日」「今週」「今月」「先月」「過去7日間」「過去30日間」のボタンが表示されます。
 * クリックするとカレンダーの表示月も連動し、1クリックで期間を選択・確定できます。
 */
export const WithPresets: Story = {
  render: (args) => {
    const [range, setRange] = React.useState<DateRange | undefined>(undefined);

    return (
      <div className="space-y-3">
        <DatePicker
          {...args}
          mode="range"
          presets
          value={range}
          onChange={(v) => setRange(v as DateRange | undefined)}
          placeholder="期間を選択（プリセット付き）"
          className="w-80"
        />
        <p className="text-sm text-muted-foreground">
          from: {range?.from?.toLocaleDateString("ja-JP") ?? "—"} / to:{" "}
          {range?.to?.toLocaleDateString("ja-JP") ?? "—"}
        </p>
      </div>
    );
  },
};

/**
 * 単一日付の組み込みプリセット（`mode="single"` + `presets={true}`）。
 *
 * 「今日」「明日」「昨日」などのショートカットが Popover 内に表示されます。
 */
export const WithSinglePresets: Story = {
  render: (args) => {
    const [date, setDate] = React.useState<Date | undefined>(undefined);

    return (
      <div className="space-y-3">
        <DatePicker
          {...args}
          mode="single"
          presets
          value={date}
          onChange={(v) => setDate(v as Date | undefined)}
          placeholder="日付を選択（プリセット付き）"
          className="w-64"
        />
        <p className="text-sm text-muted-foreground">
          選択値: {date ? date.toLocaleDateString("ja-JP") : "（未選択）"}
        </p>
      </div>
    );
  },
};

/**
 * カスタムプリセット（`presets={DatePickerPreset[]}`）。
 *
 * 業務固有のプリセット（「四半期末」「次年度初日」など）を配列で柔軟に渡せます。
 */
export const WithCustomPresets: Story = {
  render: (args) => {
    const [range, setRange] = React.useState<DateRange | undefined>(undefined);

    const customPresets = [
      {
        label: "上半期",
        value: () => {
          const year = new Date().getFullYear();
          return { from: new Date(year, 3, 1), to: new Date(year, 8, 30) };
        },
      },
      {
        label: "下半期",
        value: () => {
          const year = new Date().getFullYear();
          return { from: new Date(year, 9, 1), to: new Date(year + 1, 2, 31) };
        },
      },
    ];

    return (
      <div className="space-y-3">
        <DatePicker
          {...args}
          mode="range"
          presets={customPresets}
          value={range}
          onChange={(v) => setRange(v as DateRange | undefined)}
          placeholder="年度期間を選択"
          className="w-80"
        />
        <p className="text-sm text-muted-foreground">
          from: {range?.from?.toLocaleDateString("ja-JP") ?? "—"} / to:{" "}
          {range?.to?.toLocaleDateString("ja-JP") ?? "—"}
        </p>
      </div>
    );
  },
};

/**
 * 外部ボタングループによるプリセット併設。
 *
 * 画面上のデザイン要件で、カレンダーの外側（入力欄の上など）にボタングループを常時表示したい場合。
 */
export const WithExternalButtons: Story = {
  render: (args) => {
    const [range, setRange] = React.useState<DateRange | undefined>(undefined);

    // Story の表示を毎日変えないため、基準日を固定する。
    // 実アプリでは new Date() を使う。
    const TODAY = new Date(2026, 6, 31);

    const startOfMonth = (offset: number) =>
      new Date(TODAY.getFullYear(), TODAY.getMonth() + offset, 1);
    const endOfMonth = (offset: number) =>
      new Date(TODAY.getFullYear(), TODAY.getMonth() + offset + 1, 0);

    const PRESETS = [
      { label: "今日", range: { from: TODAY, to: TODAY } },
      { label: "今月", range: { from: startOfMonth(0), to: endOfMonth(0) } },
      { label: "先月", range: { from: startOfMonth(-1), to: endOfMonth(-1) } },
    ];

    return (
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <Button
              key={preset.label}
              variant="secondary"
              size="sm"
              onClick={() => setRange(preset.range)}
            >
              {preset.label}
            </Button>
          ))}
          <Button variant="ghost" size="sm" onClick={() => setRange(undefined)}>
            クリア
          </Button>
        </div>

        <DatePicker
          {...args}
          mode="range"
          value={range}
          onChange={(v) => setRange(v as DateRange | undefined)}
          placeholder="期間を選択"
          className="w-80"
        />
      </div>
    );
  },
};

/**
 * 直接入力（キーボード入力）。
 *
 * 入力欄に `2026/08/23`, `2026-08-23`, `20260823`, `2026年8月23日` 等をタイピングして
 * `Enter` またはフォーカスアウトすると自動でパース・整形されます。
 */
export const DirectInput: Story = {
  render: (args) => {
    const [date, setDate] = React.useState<Date | undefined>(undefined);
    return (
      <div className="space-y-3">
        <FormField
          label="直接入力のテスト"
          helpText="2026/08/23 や 20260823 と入力して Enter または外側をクリックしてください"
        >
          <DatePicker
            {...args}
            mode="single"
            value={date}
            onChange={(v) => setDate(v as Date | undefined)}
            placeholder="例: 2026/08/23 または 20260823"
            className="w-80"
          />
        </FormField>
        <p className="text-sm text-muted-foreground">
          確定値: {date ? date.toLocaleDateString("ja-JP") : "（未選択）"}
        </p>
      </div>
    );
  },
};

/**
 * エラー状態。
 */
export const ErrorState: Story = {
  render: (args) => (
    <div className="space-y-3">
      <FormField label="生年月日" required error="正しい日付を入力してください">
        <DatePicker
          {...args}
          mode="single"
          error
          placeholder="日付を選択"
          className="w-64"
        />
      </FormField>
    </div>
  ),
};

