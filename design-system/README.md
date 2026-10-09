# Design System — 画面設計の参照資料

Claude Design 等の AI や人間が**画面をデザインするとき**に渡す、自己完結した設計参照です。
実装コードの正は [components/](../components/)、見た目の正は [tokens/theme.css](../tokens/theme.css)、
使用例の正は Storybook（`bun run storybook`）。ここには判断に必要な要約だけを置きます。

同期ツールのID・実行ログ、props一覧、実装手順、業務ドメイン固有の画面はここに置きません。

| ファイル | 内容 |
|---|---|
| このファイル | デザインの方向性・Token・部品一覧・フィードバックの使い分け |
| [screen-layouts.md](screen-layouts.md) | 画面の起点レイアウト 3 種（Standard / Simple / Focus） |
| [feedback.md](feedback.md) | エラー、確認、成功、空状態の使い分け |
| [component-usage.md](component-usage.md) | 既存部品を選ぶ基準 |

---

## 1. デザインの方向性

社内業務向けの、落ち着いて分かりやすいデザインとする。

- 装飾より、操作性と情報の把握しやすさを優先する
- 情報密度は中〜やや高めを基本とする
- 主操作（Primary Action)は Page Header 付近の分かりやすい位置（通常は右側）に置く

**避ける表現:**

- 過剰な Card 分割
- 大きすぎる見出しや余白
- 意味のない Gradient、強い Shadow、過度な角丸
- 装飾だけを目的とした色や Animation
- 業務画面に適さない Landing Page 風の表現

**面の階層と強調**（[ADR-0009](../decisions/adr-0009-surface-hierarchy-and-emphasis.md)）:

| 段 | 使うもの | 使ってよい場面 |
|---|---|---|
| 地（既定） | 見出し + 余白（必要なら区切り線） | まとまりを作るとき。詳細画面の各節、集計の各節、設定項目の群 |
| 作業面 | 境界が必要な作業領域ごとに枠つきの面 | その領域に境界が必要なとき。横スクロールする表、フォーム本体。同じ領域を二重に囲まない |
| カード | Card | 同じ形のものが並び、1 つずつ開く・選ぶ・操作する対象のとき |

- 名前を付けて単独で取り出せないまとまりはカードにしない。同じ集計を切り口ごとに分けたものも 1 つの節にする。
- 面は原則として入れ子にしない。Table・Stat・Accordion など自分で面を持つ部品を Card で包まない。業務上必要な例外は、理由を設計メモや PR に書く。
- 最も目立たせる主役は 1 画面に 1 つ。大きさと位置で示し、枠の色・影・背景色で示さない。値が 0 のものや参考値は注記へ下げる。
  警告・エラー・状態などの意味の強調はこの数に含めず、必要な箇所に使う。
- 1 行しかない表や 100% になる割合は文章にする。注記は説明する節の見出しの近くに置く。

**実装前提:** shadcn/ui + Tailwind CSS v4。このキットの部品と
semantic token で実装できる構成にする。shadcn/ui で表現できるものを独自 Component 化しない。
Django + React Islands で実装困難な構成を避ける。Django テンプレート側の部品は
テンプレート用クラス（§3 の表）と Islands で組み、Django Form の描画を React へ持ち上げない。

---

## 2. Semantic Token

色は「何色か」ではなく「何のための表現か」で選ぶ。raw color（`bg-blue-600` 等)を
主要操作・状態表現の意味として直接使わない。具体値は [tokens/theme.css](../tokens/theme.css) が SSOT
（ライトは青基調、`html.dark` でダークモードにオプトイン。Token 具体値は `tokens/tokens.css`、
テンプレート用クラスは `tokens/classes.css` に分かれていて、`theme.css` は入口）。

| Token | 用途 |
|---|---|
| `primary` (+ `-hover` / `-active` / `-foreground`) | メインアクション（青） |
| `secondary` (+ `-border`) | 補助アクション（白 + グレー枠） |
| `success` / `danger` / `warning` / `info` | 成功・削除/危険・警告・情報 |
| `destructive` | shadcn/ui 互換（`danger` と同値） |
| `background` / `foreground` | ページの地と文字 |
| `card` / `popover` (+ `-foreground`) | 面の地と文字 |
| `muted` / `muted-foreground` | 控えめな面・補足文字 |
| `accent` / `accent-foreground` | hover 等の弱い強調 |
| `border` / `input` / `ring` | 枠線・入力枠・フォーカスリング |
| `status-{new,active,done,warning,danger,pending,neutral}` (+ `-foreground`) | 業務状態（未対応・対応中・完了…）。Badge の tone とテンプレートの `.badge-{tone}` が引く |
| `nav-{blue,indigo,teal,amber,rose,emerald}` | ナビゲーションの区画を見分けるための装飾色。NavItem の `activeColor` と 1:1（`primary` も選べる）。意味は持たせない |

- 既存 Token で表現できる場合は新しい Token を増やさない
- アプリごとのブランド差分は、利用側 CSS の `@theme` 上書きで表現する（部品は変更しない）
- 角丸の基準は `--radius: 0.5rem`。コントロールの高さは 24 / 28 / 32 / 40px の 4 段階

---

## 3. 部品一覧（何を使うか）

まず既存の部品を使う。ここにないものは shadcn/ui → それでもなければ新規検討の順。
仕様・状態・使用例は Storybook の各 Overview を参照。

**このキットが API を設計した部品**（仕様は Storybook を正とする）:

| 部品 | 使う場面 |
|---|---|
| Button / ButtonGroup | 操作。variant = primary / secondary / danger / success |
| Input / SearchInput / Checkbox / RadioGroup / Select / Combobox / DatePicker | フォーム入力。Combobox は検索・新規作成つき選択。説明を見比べて選ばせるなら RadioGroup の `variant="cards"` |
| ScopeSearch | 画面上部の共通検索。1 本の入力で複数種別を横断し、種別ごとのグループで候補を出す |
| FormField / FormFieldSet | ラベル・必須表示・エラー配置の統一。単一のコントロールは FormField、ラジオ・ボタングループのようなグループ入力は FormFieldSet |
| Dialog / ConfirmDialog / FormDialog | ダイアログ。破壊的操作の確認は ConfirmDialog（`confirm()` を使わない） |
| toast | 補助的なフィードバック（`alert()` を使わない） |
| Table | 一覧。空状態が必須の API。PageSection・Card の中やページの地では `variant="plain"`（枠なし） |
| RadioTable | 表から1行を選ばせる。プラン・送付先など列で比較して決める選択 |
| Tabs / Pagination / NavItem | 画面内の切替・送り・ナビゲーション。Tabs は `variant`（default / line）と `orientation`（horizontal / vertical）を持つ。NavItem のアクティブ背景を項目間で動かしたい（同じページ内で切り替える）ときだけ AnimatedNavItem（framer-motion を含む） |
| Badge / ActiveIndicator | 状態表示 |
| Alert | 継続して伝える注意・案内（フォーム全体のエラー、未完了の設定、権限による制限）。ページ幅のお知らせは `variant="banner"` |
| PageHeader / Breadcrumbs | 画面の見出し領域（見出し・説明・主操作・タブ）と現在位置 |
| PageSection | 面を持たない節（見出し・説明・操作）。詳細画面・集計画面・設定画面のまとまりは Card ではなくこれで作る |
| Stat / StatGroup | KPI・統計（ラベル・値・単位・増減）。並べるときは StatGroup で枠なしにし、主指標 1 つだけ `size="lg"` |
| Rating | 星の評価。`onChange` を渡すと入力、渡さなければ表示専用。一覧の表示専用はテンプレートの `.rating` |
| FileDropZone | ファイルの選択・ドロップ・事前チェック（種類・サイズ・件数）。Django の input と組むなら Islands の `file-drop-zone` |
| Steps | 手順の進み具合（done / current / error / upcoming）。ウィザードや申請フロー |
| DescriptionList | 詳細画面の項目名と値。空は「—」 |
| Textarea | 複数行入力。`error` と `maxLength` + `showCount` の文字数カウンタ（Input も `showCount` を持つ） |
| Table（`sort` / `selection` / `stickyHeader`） | 並び替えの状態表示（ロジックは呼び出し側）、行選択、固定ヘッダ |
| Pagination（`totalCount` / `pageSizeOptions`） | 件数表記「N 件中 a–b 件」と表示件数の切替 |
| Dropdown | メニュー |
| ThemeToggle | ライト/ダーク切替 |
| ProductSwitcher | 同じ組織の別プロダクトへ移る（ヘッダー右上）。一覧は items で渡し、取得はしない |

**shadcn/ui をそのまま公開している部品:** Card / Spinner / Progress /
Empty / Item / Field / Label / Separator / Accordion / Collapsible / Switch / Tooltip / Popover / Avatar
（API は shadcn/ui のドキュメントと同じ）。
`FormFieldSet` はこちらではなく上の表にある。グループ入力のラベル・エラー配置を
引き受ける実装をこのキットが持つため。

**Django テンプレートから使うクラス**（`tokens/classes.css`。React 側の部品と 1:1。
定義の一覧が公開契約 — [decisions/adr-0007](../decisions/adr-0007-template-class-contract-and-presentation-islands.md)）:

| テンプレート用クラス | React 側 | 用途 |
|---|---|---|
| `.btn-primary` / `.btn-secondary` / `.btn-success` / `.btn-danger`（`.btn-xs` / `.btn-sm` / `.btn-lg`） | Button | 操作 |
| `.input-field` | Input / Select / Textarea | フォーム入力。エラーは `aria-invalid` を付けると枠が danger になる（React 側と同じ） |
| `.card` / `.card-sm` / `.card-lg` | Card | 「もの」を並べるときの面。まとまりには `.page-section` |
| `.badge` + `.badge-{tone}` | Badge `tone` | 状態表示。`models.py` の `*_display_class` は tone クラス名を返す |
| `.alert` + `.alert-{tone}`（`.alert-banner`） | Alert | 継続して伝える注意・案内 |
| `.breadcrumbs` | Breadcrumbs | 現在位置 |
| `.page-header` | PageHeader | 画面の見出し領域。主操作は `.page-header-actions` |
| `.page-section`（`[data-divider]`）/ `.page-section-header` / `.page-section-title` / `.page-section-description` / `.page-section-actions` | PageSection | 面を持たない節。まとまりの既定 |
| `.stat`（`.stat-lg`） | Stat（`size="lg"`） | KPI・統計タイル。`.stat-lg` は主指標 1 つだけ |
| `.stat-group` | StatGroup | Stat を枠なし・区切り線で並べる |
| `.data-table` | Table `variant="plain"` | 一覧（枠なし） |
| `.disclosure`（`<details>`） | Accordion / Collapsible。件数の動的更新が要るなら Islands `disclosure` | 開閉 |
| `.tabs` / `.tab` / `.tab-active` | Tabs（React の中身）/ Islands `tabs`（サーバー描画パネルの切替） | 画面内の切替 |
| — | FileDropZone / Islands `file-drop-zone` | ファイル添付（テンプレートでは Island を使う） |
| `input[type=checkbox].switch`（`.switch-sm`） | Switch | 即時反映の ON / OFF |
| `.pagination` / `.pagination-summary` / `.pagination-list` / `.pagination-item` | Pagination | サーバーが描くページ送り・件数表記 |
| `.data-table th[aria-sort]` / `.data-table-scroll` / `tr[aria-selected]` | Table の `sort` / `stickyHeader` / `selection` | 並び替えの状態表示・固定ヘッダ・選択行 |
| `.description-list` | DescriptionList | 詳細画面の項目名と値 |
| `.steps` / `.step` / `.step-done` / `.step-current` / `.step-error` | Steps | 手順の進み具合 |
| `textarea.input-field` | Textarea | 複数行入力（React 版は文字数カウンタも持つ） |
| `.avatar-sm` / `.avatar-md` / `.avatar-lg` | Avatar | 人・システムの丸いアイコン（20 / 28 / 36px） |
| `.rating` / `.rating-star` / `.rating-star-empty` / `.rating-value` | Rating / Islands `rating` | 星の評価。表示はサーバー、入力は Island（hidden input へ書き戻す） |
| `.empty` / `.empty-media` / `.empty-title` / `.empty-description` / `.empty-content` | Empty | データが無いときの面。次の操作があるときだけ `.empty-content` |
| `.item-group` / `.item` / `.item-media` / `.item-content` / `.item-title` / `.item-description` / `.item-actions` | Item / ItemGroup | 一覧の 1 行。列で読み比べるなら `.data-table` |
| `.filter-bar` / `.filter-bar-field` / `.htmx-indicator` | 対応なし（レイアウト。パターン/一覧表の絞り込み行と同じ配置） | 一覧の上の絞り込み |

- テンプレートでは上のクラスを使い、同じ部品を raw utility の組み合わせや独自 CSS で再実装しない。
  自前の同名クラスがある場合は `styles.css` を読み込んだうえで削除する（残すと読み込み順で自前が勝つ）
- 見せ方だけの切替（タブ・開閉・入力欄の出し分け）は Islands の `tabs` / `disclosure` / `field-visibility`。パネルの中身は Django テンプレートのまま
- 確認ダイアログはテンプレートを書き換えずに寄せられる: base.html に `confirm-host` を 1 つ置けば、`hx-confirm` と `confirm-modal` イベントがそのままキットのダイアログになる
- 見本は Storybook「基礎/テンプレート用クラス」

**置いていないもの:** 社員選択・組織ツリーなどの業務ドメイン UI（ドメインを所有する
プロジェクト側）。チャート・地図・動画などは利用側で選定する。

---

## 4. エラーとフィードバックの使い分け

| 種類 | 表現 |
|---|---|
| 入力項目のエラー | Field Error（対象フィールドの近く。`FormField` の `error`） |
| フォーム全体・業務ルールのエラー | `Alert`（フォーム先頭。テンプレートは `.alert .alert-danger`） |
| 継続して伝える注意・案内（未完了の設定、権限による制限、メンテナンス予告） | `Alert`。ページ幅なら `variant="banner"` |
| 操作・非同期処理の一時的失敗 | Toast |
| ページ・機能自体を利用できない | Error State / Error Page |
| データがない | Empty State（有効な次の操作がある場合のみ提示） |

- 入力エラーを Toast だけで伝えない。内部例外や stack trace をそのまま表示しない
- 送信失敗時に入力内容を失わない。保存中は二重送信を防止する

---

## 5. 基本操作性

- キーボード操作・フォーカス表示など、部品のアクセシビリティ上の振る舞いを壊さない
- loading / empty / error / disabled / 長い文字列の状態を成立させる
- 狭い画面幅でも主要操作と内容が失われないようにする
- reduced motion 等の利用者設定を不必要に無視しない
- 初期描画時の FOUC・レイアウトシフトを抑える（画像等には固有サイズか aspect-ratio を指定）
