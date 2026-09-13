# Component Usage

まず既存部品を使います。必要な状態・props・具体例はStorybookを正とします。

| 目的 | 選ぶ部品・パターン |
| --- | --- |
| 通常操作 | Button |
| 削除・危険操作 | dangerのButton + Confirm Dialog |
| 文字・選択入力 | Input / Select / Combobox |
| 入力ラベル・必須・エラー | 単一のコントロール: FormField / グループ（ラジオ・ボタングループ）: FormFieldSet |
| 一時通知（保存成功など、消えてよい） | toast |
| 継続して伝える注意・案内（フォーム全体のエラー、未完了の設定、権限の制限） | Alert（テンプレートなら `.alert .alert-{tone}`）。ページ幅のお知らせは `variant="banner"` |
| 画面の見出し・主操作・現在位置 | PageHeader（`actions` に主操作、`breadcrumbs` に配列）。パンくず単体は Breadcrumbs |
| KPI・件数・率のタイル | Stat。数値の整形は呼び出し側 |
| 一覧 | Table。空状態を必ず考慮する |
| 画面横断の検索（人も組織も探す） | ScopeSearch。候補は props で渡す |
| 候補を見比べて1つ選ぶ | 説明で足りる: RadioGroup `variant="cards"` / 列で比較する: RadioTable |
| 画面内の切替 | Tabs（React の中身）。サーバーが描いたパネルなら Islands の `tabs` + `.tabs` |
| 見出し付きの開閉 | Accordion（テンプレートなら `<details class="disclosure">`、件数の動的更新は Islands の `disclosure`） |
| ファイル添付 | FileDropZone（Django の input には Islands の `file-drop-zone`）。種類・サイズ・件数はここで先に弾く |
| 即時反映の ON / OFF | Switch（テンプレートなら `input.switch`）。送信で反映するなら Checkbox |
| 短い補足・アイコンボタンの名前 | Tooltip（`title` 属性は使わない）。操作や長文を含むなら Popover |
| 手順の進み具合 | Steps。同じ階層の切替は Tabs、進捗率は Progress |
| 詳細画面の項目名と値 | DescriptionList。値が主役なら Stat |
| 複数行入力・文字数の上限 | Textarea（`maxLength` + `showCount`）。1 行なら Input の `showCount` |
| 一覧の並び替え・行選択 | Table の `sort` / `onSortChange` / `selection`。並び替えのロジックは呼び出し側（またはサーバー） |
| 一覧の件数と表示件数 | Pagination の `totalCount` / `pageSizeOptions` |
| 削除などの確認（テンプレート側） | base.html の `confirm-host` 1 つ。`hx-confirm` と `confirm-modal` イベントを受ける。ボタンごとの宣言的な指定は `confirm-dialog` |
| 状態表示 | Badge / ActiveIndicator |
| 日付入力 | DatePicker |
| ページ送り | Pagination |
| サイドバー等のナビゲーション項目 | NavItem。同じページ内で active を切り替えて背景の移動を見せるときだけ AnimatedNavItem（framer-motion をバンドルに含む。フルリロードの画面では動きが見えない） |
| 値のコピー | CopyButton（テンプレートなら Islands の copy-field）。ワンタイム URL 等は値が見える入力欄と組にする |
| 種類をまたぐ横断検索 | ScopeSearch。1 種類だけの絞り込みは SearchInput |

- エラーは2本立てで伝える。**Fieldに`data-invalid`（見た目）とコントロールに`aria-invalid`（支援技術）**。片方だけでは伝わらない。
- shadcn/uiに相当物があり、追加の価値がない場合は新しいApplicationラッパーを作らない。
- primaryは主操作、secondaryはキャンセル・戻る、dangerは削除に使う。
- Reactでは既存のReactコンポーネントを使う。テンプレートではこのキットのテンプレート用クラス（`tokens/classes.css`、Storybook「基礎/テンプレート用クラス」）を使う。どちらでも、raw utilityの組み合わせや独自CSSで同じ部品を再実装しない。
- 業務ドメイン固有の部品（社員選択、組織ツリーなど）は、このUI Kitではなく所有アプリに置く。

## 忘れても失敗しないが、動かない2点

エラーにならず、症状だけが出ます。

- **Toastは `<Toaster />` をアプリのルートに1つ置く。** 無くても
  `toast.success(...)` の呼び出しは成功し、何も表示されないだけになる。
- **ダークモードはpropでもmedia queryでもなく、`<html>` の `dark` クラス。**
  ライトが既定で、何も要らない。切替UIが必要なら `ThemeToggle` を使う。
- **テンプレート側の toast は `toast-listener` Island が前提。** 無いと `window.ApplicationToast` が
  `undefined` のままで、呼び出し側が `?.` で握り潰していると症状だけが出る。
- **自前の同名クラス（`.btn-primary` / `.alert` 等）が残っていると、キットの見た目は出ない。**
  読み込み順で自前が勝つ。`styles.css` を読み込んだら自前の定義を削除する。
