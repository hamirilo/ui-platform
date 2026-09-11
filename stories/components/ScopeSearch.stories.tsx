import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import {
  Badge,
  ScopeSearch,
  type ScopeSearchItem,
} from "../../components/application";
import { Labeled, Section, Showcase, Stack } from "../_showcase";

/**
 * 候補は呼び出し側が用意する。この Story のデータはあくまで見本。
 *
 * `keywords` に「かな」と番号を入れているのがこの部品の要点。
 * 漢字表記しか持たない候補は「かちょう」「あおき」で引けない。
 */
const ITEMS: ScopeSearchItem[] = [
  {
    value: "10024",
    kind: "社員",
    label: "青木 里佐",
    description: "首都圏営業部 課長 ・ 本社（東京）",
    keywords: "あおき りさ 10024",
  },
  {
    value: "10031",
    kind: "社員",
    label: "石橋 拓也",
    description: "商品部 部長 ・ 本社（東京）",
    keywords: "いしばし たくや 10031",
  },
  {
    value: "10063",
    kind: "社員",
    label: "大西 純平",
    description: "関西営業部 課長 ・ 大阪支社",
    keywords: "おおにし じゅんぺい 10063",
  },
  {
    value: "10166",
    kind: "社員",
    label: "杉山 直美",
    description: "情報システム部 課長 ・ 本社（東京）",
    keywords: "すぎやま なおみ 10166",
  },
  {
    value: "d1",
    kind: "部署",
    label: "首都圏営業部",
    description: "営業本部 ・ 42 名",
    keywords: "しゅとけんえいぎょうぶ",
  },
  {
    value: "d3",
    kind: "部署",
    label: "商品部",
    description: "商品本部 ・ 35 名",
    keywords: "しょうひんぶ",
  },
  {
    value: "d7",
    kind: "部署",
    label: "情報システム部",
    description: "管理本部 ・ 6 名",
    keywords: "じょうほうしすてむぶ",
  },
  {
    value: "s1",
    kind: "拠点",
    label: "本社（東京）",
    description: "東京都中央区 ・ 在籍 84 名",
    keywords: "ほんしゃ とうきょう",
  },
  {
    value: "s2",
    kind: "拠点",
    label: "大阪支社",
    description: "大阪市西区 ・ 在籍 31 名",
    keywords: "おおさかししゃ",
  },
  {
    value: "t2",
    kind: "役職",
    label: "部長",
    description: "等級 M2 ・ 該当 12 名",
    keywords: "ぶちょう",
  },
  {
    value: "t3",
    kind: "役職",
    label: "課長",
    description: "等級 M1 ・ 該当 24 名",
    keywords: "かちょう",
  },
];

const KINDS = ["社員", "部署", "拠点", "役職"];
const RECENT = ["10166", "d3", "s1"];

/**
 * ScopeSearch は「何を探しているか決めないまま打ち始める」検索窓。
 *
 * <important>
 * フォームの値を決める部品ではない。選んだものをフォームに入れるなら
 * `Combobox` / `TreeSelect` を使う。
 * </important>
 */
const meta = {
  title: "コンポーネント/ScopeSearch",
  component: ScopeSearch,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
## 目的

1 本の入力で複数の種別（社員・部署・拠点…）を横断して探し、1 件へ移動する。

種別ごとに検索窓を分けると「どの窓で探すか」を先に決めさせることになる。
先に決められないから探しているので、入口は 1 本にまとめる。

## 使う場面

- 画面上部の共通検索（ヘッダー・サイドバー）
- 「人でも組織でも、名前は分かるがどこにあるか分からない」入口
- 種別が増える予定がある検索（\`kinds\` を足すだけで増やせる）

## 使わない場面

| 場面 | 代わりに使うもの |
|---|---|
| 選んだ値をフォームに入れる | \`Combobox\`（1 種類の候補から選ぶ） |
| 階層から選ぶ | \`TreeSelect\` |
| 一覧の絞り込み（同じ画面に留まる） | \`SearchInput\` + \`Patterns/Search\` |
| 種別が 1 つだけ | \`Combobox\`。種別チップが無意味になる |

## データ

候補は必ず \`items\` で渡す。**この部品はデータを取りに行かない。**

| フィールド | 役割 |
|---|---|
| \`value\` | 識別子。決定時に \`onSelect\` で返る |
| \`kind\` | 種別。グループ見出しと種別チップの単位 |
| \`label\` | 主表示。絞り込み対象 |
| \`description\` | 補足（所属・住所・件数）。絞り込み対象 |
| \`keywords\` | かな・英字・社員番号など。**表示されないが絞り込み対象** |

## サーバー検索

候補が多くて全件を配れない場合は \`filterMode="none"\` にして、
\`onQueryChange\` で取得した結果を \`items\` に流し込む。
待っているあいだは \`loading\` を渡す（\`filterMode="none"\` のままだと
リクエスト中に前回の結果が残るため、\`loading\` を出さないと止まって見える）。

## キーボード・支援技術

- \`↑\` \`↓\` でカーソル移動（可視範囲へ自動スクロール）、\`Enter\` で決定、\`Escape\` で閉じる
- フォーカスは入力欄に留まり、位置は \`aria-activedescendant\` で伝える
- パネルは \`role="listbox"\`、種別ごとのまとまりは \`role="group"\`、行は \`role="option"\`
- 種別チップは \`Tab\` で辿れる（パネル内の移動では閉じない）

## 注意事項

- **\`keywords\` を省略しない。** 漢字表記だけでは、かな入力・社員番号で引けない
- **\`recentValues\` を渡す。** 空欄のパネルが「壊れている」ように見えるのを防ぐ
- \`onSelect\` は「移動」に使う。決定後、入力欄には決定したラベルが残る
  （空にしたい場合は \`query\` を制御する）
- 幅は呼び出し側が決める（既定は親幅いっぱい）
- 候補パネルは \`document.body\` へ portal で描く。呼び出し側の \`overflow: hidden\` では切れず、
  下に入りきらなければ上へ開く。**Dialog の中では \`portalContainer\` に Dialog のポップアップ要素を渡す**
        `,
      },
    },
  },
  argTypes: {
    items: { table: { disable: true } },
    kinds: { table: { disable: true } },
    recentValues: { table: { disable: true } },
    onSelect: { table: { disable: true } },
    filterMode: { control: "radio", options: ["internal", "none"] },
    loading: { control: "boolean" },
    disabled: { control: "boolean" },
    placeholder: { control: "text" },
  },
  args: {
    items: ITEMS,
    kinds: KINDS,
    recentValues: RECENT,
    placeholder: "社員・部署・拠点・役職を検索",
  },
} satisfies Meta<typeof ScopeSearch>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 実際に開いて操作できる見本。
 *
 * 「かちょう」→ 役職、「本社」→ 拠点と社員の所属、「10166」→ 社員番号で当たる。
 */
export const Overview: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Showcase>
      <Section
        title="Default"
        note="クリックすると最近見た項目が出る。打つと種別ごとに見出しと件数が付く。"
      >
        <Stack className="max-w-lg">
          <ScopeSearch
            items={ITEMS}
            kinds={KINDS}
            recentValues={RECENT}
            placeholder="社員・部署・拠点・役職を検索"
          />
          <p className="text-xs text-muted-foreground">
            「かちょう」「本社」「10166」などで試せる
          </p>
        </Stack>
      </Section>

      <Section
        title="Variations"
        note="種別の並びは kinds で決める。種別が 1 つなら種別チップは出さない。"
      >
        <Stack className="max-w-lg">
          <Labeled label="部署を先に見せる（kinds の順）">
            <ScopeSearch
              items={ITEMS}
              kinds={["部署", "拠点", "社員", "役職"]}
              recentValues={RECENT}
              placeholder="組織から探す"
            />
          </Labeled>
          <Labeled label="社員だけ（種別チップなし）">
            <ScopeSearch
              items={ITEMS.filter((item) => item.kind === "社員")}
              recentValues={["10166"]}
              placeholder="社員を検索"
            />
          </Labeled>
          <Labeled label="最近見た項目を渡さない場合">
            <ScopeSearch
              items={ITEMS}
              kinds={KINDS}
              placeholder="社員・部署・拠点・役職を検索"
              promptMessage="社員名・部署名・拠点名を入力してください"
            />
          </Labeled>
        </Stack>
      </Section>
    </Showcase>
  ),
};

/** 基本形。 */
export const Default: Story = {};

/** 種別を絞った状態（`defaultScope`）。チップで「すべて」に戻せる。 */
export const ScopedToKind: Story = {
  args: { defaultScope: "部署", defaultQuery: "部" },
};

/** かな入力の途中。`keywords` が無いと当たらない。 */
export const KanaQuery: Story = {
  args: { defaultQuery: "かちょう" },
};

/** ヒット 0 件。次に何を試せばよいかを添える。 */
export const NoResults: Story = {
  args: {
    defaultQuery: "存在しない語",
    emptySubMessage: "かなでの検索、または種別を「すべて」に戻して試してください",
  },
};

/** 操作不可。 */
export const Disabled: Story = {
  args: { disabled: true, defaultQuery: "課長" },
};

/**
 * `overflow: hidden` の中に置いた場合。
 *
 * パネルは portal で body へ出すため、カードの下端で切れない。
 * 画面の下端に近く下へ入りきらないときは上へ開く。
 */
export const InsideClippingContainer: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div className="max-w-lg overflow-hidden rounded-xl border border-border bg-card p-4">
      <p className="mb-3 text-sm text-muted-foreground">
        このカードは overflow: hidden。クリックしてパネルを開く。
      </p>
      <ScopeSearch {...args} />
    </div>
  ),
};

/**
 * 決定した候補を親で受け取る。
 *
 * 実際の画面では `onSelect` で詳細画面へ遷移する。
 */
export const Controlled: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => {
    const [query, setQuery] = React.useState("");
    const [chosen, setChosen] = React.useState<ScopeSearchItem | null>(null);

    return (
      <div className="max-w-lg space-y-3">
        <ScopeSearch
          {...args}
          query={query}
          onQueryChange={setQuery}
          onSelect={(item) => {
            setChosen(item);
            // 決定したら入力を空へ戻す（移動したあとに前の語を残さない）
            setQuery("");
          }}
        />
        <p className="text-sm text-muted-foreground">
          {chosen ? (
            <>
              <Badge tone="neutral">{chosen.kind}</Badge>{" "}
              {chosen.label}（value: <code>{chosen.value}</code>）へ移動
            </>
          ) : (
            "まだ決定していません"
          )}
        </p>
      </div>
    );
  },
};

/**
 * サーバー検索。`filterMode="none"` で内部の絞り込みを切り、結果を `items` に流す。
 *
 * ここでは 400ms 遅れて返すサーバーを模擬している。
 * 入力の都度投げるなら debounce は呼び出し側の責務。
 */
export const ServerSide: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => {
    const [query, setQuery] = React.useState("");
    const [results, setResults] = React.useState<ScopeSearchItem[]>([]);
    const [loading, setLoading] = React.useState(false);

    React.useEffect(() => {
      const needle = query.trim().toLowerCase();
      if (!needle) {
        setResults([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      const timer = setTimeout(() => {
        setResults(
          ITEMS.filter((item) =>
            `${item.label} ${item.description ?? ""} ${item.keywords ?? ""}`
              .toLowerCase()
              .includes(needle),
          ),
        );
        setLoading(false);
      }, 400);
      return () => clearTimeout(timer);
    }, [query]);

    return (
      <div className="max-w-lg space-y-3">
        <ScopeSearch
          {...args}
          items={results}
          filterMode="none"
          loading={loading}
          query={query}
          onQueryChange={setQuery}
          recentValues={undefined}
          promptMessage="キーワードを入力すると検索します"
        />
        <p className="text-xs text-muted-foreground">
          400ms 遅れて返すサーバーを模擬。検索中は「検索中」を出す。
        </p>
      </div>
    );
  },
};
