# design-sync notes

## General fixes (apply automatically via config on future syncs)

- **`projectId` lives in `.design-sync/config.local.json` (gitignored), never in `config.json`.** The target Claude Design project differs per owner/fork, so committing one in `config.json` would push every fork's sync at a single org's project. `config.local.json` holds just `{"projectId": "<uuid>"}` and is merged into the config before running the converter/driver — see [README.md](README.md)'s 「なぜ `projectId` だけ別ファイルなのか」 for the exact mechanics. No `config.local.json` yet (fresh clone, or first sync) → `list_projects`/`create_project` and write the result there, never into `config.json`.
- **`pkg` uses the owner-independent consumer name `application-ui-kit`.** GitHub Packages publishes the physical package as `@<owner>/application-ui-kit`, but consumer code resolves it through the npm alias defined in the consuming application's `package.json`. Keeping design-sync on the same logical package name prevents fork-specific source diffs.

- **[GENERAL] Fixed viewport clips tall Overview stories.** `compare.mjs`'s per-story capture screenshots the DS preview at a *fixed* viewport (default 900x700, `page.screenshot({fullPage:false})`), while the storybook reference side captures the real element and auto-sizes to its content. Any story taller than the viewport is silently cropped in the DS capture with **no validate warning** — the sheet/thumbnail can look fine at a glance while the raw PNG is missing content (the composite sheet scales the row to the TALLER side, so a cropped-but-blank-padded DS panel can look deceptively complete in the shrunk thumbnail — always check the raw `.../raw/*__ds.png` height against the `*__sb.png` height with `sips -g pixelHeight` when in doubt, not just the sheet). Discovered on `NavItem`'s Overview story (1040px of real content, cropped to 700px, hiding the `amber`/`rose`/`emerald` swatches and the whole `LINK / BUTTON` section). Fixed via `cfg.overrides.<Name>.viewport`. Current full list (checked against every storied component's raw PNG height as of the 2026-09-05 resync, 40 components):
  `Table` (900x1150), `NavItem` (900x1100), `FormField` (900x1020), `Input` (900x980), `ButtonGroup` (900x900), `Combobox` (900x870), `DatePicker` (900x870), `RadioGroup` (900x1600 — bumped from 850; the `Cards`/`Cards Horizontal` stories added since need much more height), `Select` (900x780), `Alert` (900x950), `FileDropZone` (900x1150), `FormFieldSet` (900x1020), `RadioTable` (900x1100), `Steps` (900x870), `TreeSelect` (900x870).
  **Re-check this on every re-sync**: if any component's Overview (or any) story grows past its configured viewport height, it will crop again silently — measure the storybook-side raw PNG height and bump the override if needed. A one-liner to scan all storied components: `for name in <List>; do sbf=$(ls ds-bundle/_screenshots/compare/raw/ | grep -i "^misc__${name}__.*overview.*__sb.png"); dsf=...; compare pixelHeight; done` (see this run's transcript for the exact form).
- **[GENERAL] `[GRID_OVERFLOW] ... wide` can appear on a component whose OTHER stories fit fine** — `RadioTable`'s `With Form Field` story alone rendered wider than its grid cell (validate only flags it after the final full build, not mid-campaign). Fixed via `cfg.overrides.RadioTable.cardMode: "column"`. This is a presentation-only key — no re-grade needed, just `preview-rebuild.mjs --components <Name>` + re-validate.
- **[GENERAL] `.storybook/preview.tsx` decorator never bundles for previews** (`! preview decorator bundle failed: Could not resolve "tailwindcss"` — the decorator's CSS import chain only resolves through the `@tailwindcss/vite` plugin, not esbuild). This means previews never get the decorator's `.dark`-class toggle, the `app-preview font-sans p-6` wrapper div, or the always-mounted `<Toaster />`. Verified harmless for all 21 currently-synced components (colors/fonts come from the `[CSS_FROM_STORYBOOK]` fallback regardless; `ThemeToggle` manages its own `.dark` toggle internally; toast stories only render trigger buttons, not the toast itself). **Risk**: a future component whose *default* (non-interactive) render depends on being inside `.dark` or on `Toaster` being mounted would silently regress without this being caught by validate — no `cfg.provider` has been set because it wasn't needed.
- **[GENERAL] `[TOKENS_MISSING]` for `--tw`, `--toast-index`, `--toast-swipe-movement-x/y`, `--toast-height`, `--toast-offset-y`** — confirmed these are set at runtime by the toast/base-ui primitives, not sourced from a stylesheet; toast stories render correctly. No `cfg.tokensPkg` needed.
- **[GENERAL] この `.design-sync/` の内容は必ず commit すること。** 下の
  "Known false positives" の調査結果は一度、未 commit のまま作業ツリーごと失われている
  （repository の 1.0 再基準化に伴う再 clone）。
  `config.json` / `NOTES.md` / `conventions.md` はいずれも生成物ではなく手で維持する設定・記録で、
  失うと同じ調査をやり直すことになる。

- `Pagination` Overview story overflowed its grid cell width (`[GRID_OVERFLOW] ... wide`) — fixed via `cfg.overrides.Pagination.cardMode: "column"`.

## Known false positives（source側は変更しない）

check が報告するが、実際には修正不要な指摘。**毎回の sync で再度報告される**ので、
その都度ここを参照して同じ調査をやり直さないこと。

- **[GENERAL] トークン抽出が Tailwind v4 のコンパイル出力を DS トークンとして拾う。** check が
  (1) component-style セレクタ配下の custom property 112件（`.cn-button:focus-visible` 等）と
  (2) 分類できないトークン 38種 を報告するが、どちらも誤検知。原因は共通で、トークン抽出が
  `[CSS_FROM_STORYBOOK]` フォールバック（= Tailwind がコンパイルした Storybook の CSS）を
  読んでいること。オーサリング元の `tokens/*.css` には `--tw-` は 1 個も無い
  （`grep -c -- "--tw-" tokens/components.css` → 0）。内訳:
  - **`--tw-*`（(1) の全件 + (2) の 25種）** = Tailwind の box-shadow / transform / animation 合成用の
    作業変数。`.cn-button:focus-visible` 側の `--tw-ring-shadow` / `--tw-ring-offset-width` は
    **`:root` へ移してはいけない**（ring が全要素に効いて壊れる）。実テーマ値は
    `--tw-ring-color: var(--color-ring)` として正しく参照されており `--color-ring` は登録済み。
  - **モーショントークン 7種** = 本物のトークン。`--motion-duration-fast` /
    `--motion-duration-base` / `--motion-ease-default` / `--default-transition-duration` /
    `--default-transition-timing-function` / `--animate-spin` / `--animate-pulse`。
    check 側に motion の分類が無いため「分類できない」に落ちているだけで、値は正しい。
    後ろの 4 種は Tailwind のデフォルトテーマ由来で、このリポジトリに定義箇所は無い。
  - **コンポーネント内部変数 4種** = `--lk-halfstep`（`tokens/scale.css`）、`--lk-state-hover`、
    `--lk-state-active`（同）、`--icon-empty`（`tokens/icon-metrics.generated.css`）。
    兄弟の `--lk-icon-air` / `--lk-icon-gap` / `--lk-icon-inset` / `--lk-state-*-on-fill` /
    `--icon-box` / `--icon-fix` は check に分類できている。
  - **2026-09-11（7.0.0 同期分）**: 利用側の `check_design_system` で (1) 145件 / (2) 633 中 149件（38種）。
    修正の方向は「同期側のトークン走査で `--tw-` プレフィックスを無視する」「`_ds_bundle.css` 等の
    ビルド生成物ではなく手書きの `tokens/*.css` だけを走査する」の 2 点。どちらも converter / driver 側の
    変更で、source 側（`tokens/*.css` やコンパイル出力への `/* @kind other */` 追記）では直さない
    （コンパイル出力への追記はビルドのたびに消える）。下の「却下した案」も参照。

- **[GENERAL] 「ダークテーマ未定義」は誤検知。対応不要。** `.dark` スコープの surface /
  foreground / border 上書きセットは `tokens/theme.css` の `.dark` ブロックに定義済みで、
  コンパイル結果にも `.dark{--color-background:…}` として 17 プロパティ分が出ている
  （`storybook-static` の CSS で実測確認）。このリポジトリは Tailwind 既定の
  `@media (prefers-color-scheme: dark)` ではなく
  `@custom-variant dark (&:where(.dark, .dark *))` によるクラス方式オプトインを
  **意図的に**採っている（理由は theme.css のコメント: 利用側テンプレートが `bg-white` 直書きの
  ままだと OS 設定だけで画面が半分暗くなって破綻する）。check が `prefers-color-scheme` か
  `[data-theme]` を探しているなら `.dark` を見落とす。
  **`@media (prefers-color-scheme: dark)` を足してはいけない** — 上の設計判断を直接壊す。

- **[GENERAL] driver 側の正式な除外・token source 指定方法は未確認。上記を source 側で
  回避しようとしないこと。** 検討して**却下した**案を、再検討の手間を省くために残す。
  - `cfg.tokensIgnore` に `"--tw-*"` 等を書く案 → **却下**。driver / converter のソースを
    参照できず、このキー名が実際に読まれるか確認できていない。driver が知らないキーは黙って
    無視されるため、「fix」として入れても誤検知が消える保証が無い。
  - `cfg.tokensPkg` へ切り替える案 → **却下**。`tokensPkg` は通常 `node_modules/<package>` に
    存在する**別の** token package を指す設定で、UI Platform 自身が token source である
    このリポジトリでは自己参照の代替にならない。
  - `tokens/motion.css` の `@theme` へ Tailwind 既定値（`--default-transition-duration` /
    `--default-transition-timing-function` / `--animate-spin` / `--animate-pulse`）を
    ピン留めして注釈を付ける案 → **却下**。利用側の `input.css` は
    `@import "tailwindcss"` の**後**に `application-ui-kit/styles.css` を読むため
    （`scripts/fixtures/consumer/backend/static/css/input.css`）、pin すると利用側が
    カスタマイズした transition / animation 変数を UI Kit が上書きする。元々 Tailwind が
    所有していた変数の所有権を、Design Sync のメタデータのためだけに奪うことになる。
    リポジトリ内のビルド出力だけを比較すると「バイト一致・挙動不変」に見えるが、
    **利用側は検証できていない**。この落とし穴のため再度 pin しないこと。

  driver で正式にサポートされた除外・token source 指定を確認できた時点で、別途対応する。

## Cosmetic changes worth knowing about

- **Catalog grouping flattened from curated subgroups to a flat "components" group.** The previously-uploaded project organized cards into `data-display`/`forms`/`actions`/`overlays`/`navigation`/`primitives`/`surfaces` — but every story title in this repo (`stories/components/*.stories.tsx`) is a flat two-level `Components/<Name>`, and group is derived mechanically from the title segment above the component name (`common.mjs#titleParts`). Checked git blame — these titles have always been flat two-level for every file checked, so the old subgrouping was almost certainly hand-curated via a `cfg.titleMap`/fork config from a prior sync we have no record of (see "lost local state" below), not something this repo's stories ever encoded. The driver's diff correctly treated this as a "pure regroup" (its `deletePaths` remove every component's old grouped path alongside the new flat path in `writes`) rather than a contract change, so no grades were lost. If the curated subgroups are wanted back, either restructure story titles to `Components/<Category>/<Name>` in the repo, or reintroduce a group-remapping config — there is currently no `cfg` knob that overrides `group` independent of the title path.

## Re-sync risks

- **8 primitives still lack standalone stories.** `Card`, `Empty`, `Field`, `Item`, `Label`, `Progress`, `Separator`, `Spinner` are still re-exported as plain shadcn/ui passthroughs from `components/application/index.ts`, but commit `ff5c673` ("shadcn/ui gen3 (Base UI) へ移行し、公開APIを整理する") removed their dedicated `.stories.tsx` files — they now only appear embedded inside Pattern/Template stories (`Form`, `EmptyState`, `gallery/AllComponents`, etc.). The storybook shape can only verify components with their own stories, so these stay un-synced. (`Textarea` regained a dedicated story since the last check and IS synced now — the "9 primitives" count from the previous note is stale.) If standalone Catalog cards are wanted for the remaining 8, they need dedicated story files restored.
- **`ActiveIndicator` regained visibility.** The previous note said it had no story anywhere; as of this resync it has `stories/components/ActiveIndicator.stories.tsx` (1 story: Overview) and is synced normally, graded `match`. The earlier note was stale — don't assume it's still missing.
- **2026-09-05: major public-API rename (`Application*` prefix dropped) — ADR-0006.** Commit `d995b56` ("Refactor/public api/drop application prefix") renamed every exported component from `Application<Name>` to bare `<Name>` (e.g. `ApplicationButton` → `Button`) and the repo grew from 21 to 40 storied components (18 new: Accordion, ActiveIndicator, Alert, Avatar, Breadcrumbs, CopyButton, DescriptionList, FileDropZone, FormFieldSet, PageHeader, Popover, RadioTable, ScopeSearch, Stat, Steps, Switch, Tabs, Textarea, Tooltip, TreeSelect — some names overlap the old list positionally but are NOT the same component, verify by content not just count). Because the anchor (`_ds_sync.json`) keys grades by export name, this resync's diff against the old remote anchor showed **zero carry-forward** — every one of the 40 components needed fresh capture + grading, i.e. this resync cost the same as a first sync. `cfg.overrides` already had bare names when this session started (a prior session must have anticipated the rename without completing the sync) — if a future rename happens again, expect the same all-or-nothing re-verify; there's no partial-carry mechanism across an export-name change even when the underlying component is otherwise unchanged.
- **`Toast` story title doesn't match its export.** `stories/components/Toast.stories.tsx` has `title: "コンポーネント/Toast"` but `meta.component` is `Toaster` (package exports `toast` fn + `Toaster` component, no bare `Toast`). Fixed via `cfg.titleMap: {"Toast": "Toaster"}`. All 7 of its stories are click-triggered (`onClick={() => toast.success(...)}`) so the static preview only ever shows trigger buttons, never a rendered toast — this is expected and was previously verified harmless under the old `ApplicationToast` name too.
- **Playwright chromium download failed via `npx playwright install chromium`** (network timeout to `cdn.playwright.dev` from this shell) but a same-version `chromium-1234` from an earlier install already existed at `~/Library/Caches/ms-playwright/chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing`. Set `DS_CHROMIUM_PATH` to that binary for every `compare.mjs`/`package-validate.mjs`/`preview-rebuild.mjs` call and it worked. If a fresh clone hits the same download timeout, check for any pre-existing `chromium-*`/`chromium_headless_shell-*` dir under that cache path before concluding the environment can't run the render checks at all.
- **`resync.mjs` (the driver) timed out repeatedly (3–10 min) on this repo's first full pass** — likely the render-check/capture phase across 40 components. Fell back to running `package-build.mjs` → `package-validate.mjs` → `storybook/compare.mjs` manually in sequence (all backgrounded, polled via a file-existence loop) instead of the single driver command. This works but loses the driver's automatic diff/anchor-fetch convenience — for a future re-sync, try the driver first but be ready to fall back to the manual sequence if it doesn't return within ~3 min per stage.
- **`docs: 0/40 components matched` in the build log.** The converter's doc discovery (`cfg.docsMap`/`cfg.dtsPropsFor`) found no matching source docs for any component, so `.prompt.md` content is generated from `.d.ts` + story source only, not from the components' own JSDoc comments (which are often rich, e.g. `Button.tsx`'s variant descriptions). Not a blocker, but a future sync could investigate `cfg.componentSrcMap`/`cfg.docsMap` to surface those JSDoc blocks in the generated prompt docs.
- **This resync uploaded into the pre-existing "Application UI Kit (synced)" project** (`projectId` recorded in `.design-sync/config.local.json`, gitignored — see [README.md](README.md)) via the atomic path: full writes + 105 explicit deletes of every old `Application*`-prefixed path (verified via `list_files` before AND after — confirmed 0 stale `Application*` paths remain post-upload). `_adherence.oxlintrc.json` and `_ds_manifest.json` are app-managed and were left untouched (not in the plan's writes or deletes).
- **[GENERAL] 2026-09-11: `bun run format`（`biome check --write .`）が同期の生成物を書き換えた。** Biome 1.9 は
  `.gitignore` を見ないため、`.design-sync/.cache/previews/*.tsx`（先頭の `// @ds-preview generated` マーカー行が
  消えた）、`.ds-sync/*.mjs`、`ds-bundle/` まで整形された。症状: build ログに全コンポーネント分
  `preview modified in the cache — NOT regenerating`。`biome.json` で 3 ディレクトリとも除外したので再発しないはず。
  もし出たら `rm -rf .design-sync/.cache/previews`（grades の入った `.cache/compare/` は消さない）→ §2.4 で
  `.ds-sync/` を再 stage → driver 再実行。
- **`[REFERENCE_STALE?]` は同一セッション内の 2 回目以降の driver 実行で誤検知しうる**（前回実行から preview cache
  だけが変わり、reference は変わっていない場合）。`grep` で sb-reference の CSS に今回の変更が入っているか確かめてから判断する。
  `just check` 直後の `storybook-static/` は同じ `storybook build` の出力なので、現在の tree から作られていれば
  `.design-sync/sb-reference` へコピーして reference の再ビルドに代えてよい。
- **ScopeSearch は 9 stories。** compare の既定上限は 6 で、7 番目の `InsideClippingContainer`（portal の確認用）が
  漏れる。2026-09-11 に `--max-stories 9` で全件 image-judged `match`。再キャプチャするときは `--max-stories 9` を付ける。
- **`conventions.md` のドリフト（2026-09-11 検出・修正済み）**: `text-success-foreground` / `text-warning-foreground` /
  `text-info-foreground` がコンパイル済み CSS に無かった。Tailwind v4 は repo 内で使われた utility と、使われた
  `@theme` 変数だけを出力するため（`--color-info-foreground` は `tokens/tokens.css` に定義があるのに出力されない）。
  トークン参照（`var(--color-*-foreground)`）への書き換えでは info が直らないので、Semantic status 行を実在する
  クラスだけに絞り、状態色の UI は `Badge` / `Alert` の `tone` へ誘導する形にした。
  **再同期のたびに、conventions.md のクラス名を `ds-bundle/_ds_bundle.css` へ grep して確かめること**
  （例に無いクラスは design agent の画面で無スタイルになる）。

- **2026-09-18: 上の drift が逆向きに動いた（未修正・要判断）。** 7.2.0 の build では
  `text-success-foreground` / `text-warning-foreground` / `text-info-foreground` が
  **`_ds_bundle.css` に存在する**（`.text-info-foreground{color:var(--color-info-foreground)}` の形）。
  `tokens/classes.css`（空状態・一覧行のテンプレート用クラス）と `tokens/components.css` が
  `var(--color-*-foreground)` を使うようになり、Tailwind v4 が該当 utility を出力するようになったため。
  つまり conventions.md の「success / warning / info には `-foreground` が **無い**」という記述は
  今の build では不正確。ただし *安全な方向* のズレ（存在するクラスを「使うな」と言っているだけで、
  無スタイルにはならない）で、`Badge` / `Alert` の `tone` へ誘導する方針自体は今も有効。
  2026-09-11 に**意図的に**狭めた行なので、この sync では**書き換えていない**。広げ直すかは人間の判断。
  なお `bg-*-foreground` と `border-success` / `border-warning` / `border-info` は **今も存在しない**
  （記述どおり）。次回も同じ grep で両方向を確認すること。

- **[GENERAL] Catalog の group が `misc` なのは story title が日本語だから。** `.ds-sync/lib/common.mjs`
  の `titleParts()` が group を `parts[idx-1].toLowerCase().replace(/[^a-z0-9]+/g,'-')` で作るため、
  `コンポーネント/<Name>` の `コンポーネント` は全部落ちて空文字になり、`|| 'misc'` に落ちる。
  `cfg.titleMap` は name しか変えられず group には効かない（上の "Cosmetic changes" 参照）。
  Catalog 上の見出しを意味のあるものにしたいなら story title を `Components/<Name>` 等の ASCII にするしかなく、
  それは Storybook 側の見た目を変える。**converter の version で fallback 名が変わりうる**点に注意:
  2026-09-11 時点のローカル `ds-bundle` は group=`component` だったが、今回の skill version では `misc`。
  group 名が変わると diff が「全件 regroup」になり `deletePaths` が巨大になる（今回は remote と同じ `misc`
  だったので `deletePaths` は 0 件）。

- **2026-09-18 の resync は安価だった（driver 1 発で完走）。** 38 carried / 2 changed
  (`ActiveIndicator`, `NavItem`) / 1 added (`Rating`) / 0 removed、`deletePaths` 0 件。
  上の「driver が 3–10 分で timeout する」という記録は**この回には当てはまらなかった**
  ——`resync.mjs` を background で回せば build→diff→validate→capture まで通しで完走する（各回 ~9 分）。
  次回もまず driver を素直に 1 回流すこと。
- **`Rating` に viewport override は不要。** Overview の storybook 実描画は 473px で既定 700 に収まる
  （`sips -g pixelHeight` で確認済み）。`cfg.overrides` に足さないこと。
- **canary の spot-check 対象は driver 実行ごとに引き直される。** 1 回目は
  Pagination/ConfirmDialog/DescriptionList/Combobox/Checkbox、2 回目（receipt 用の再実行）は
  Pagination/Dropdown/Breadcrumbs/Dialog/Accordion。**再実行するたびに新しい 5 件を見ろという意味ではない**。
  今回は計 9 コンポーネントを目視して divergence 0 だったので carried grades をそのまま採用した。
  churn の原因が「CSS が純粋な追加のみ（`git diff --numstat` で削除 0 行）」と確認できていれば、
  spot-check は 1 周で十分。
- **remote の anchor をローカルの `ds-bundle/_ds_sync.json` で代用しないこと。** `.design-sync/.cache/remote-sync.json`
  が無い状態で resync を始めると `DesignSync(get_file, "_ds_sync.json")` の結果を手で書き出す必要がある。
  ローカルの sidecar は**別 build の産物**でありうる（今回は group が `component` vs remote `misc` で
  `sourceHashes` の key が 120 件全部食い違った）。`renderHashes` / `sourceKeys` / `styleSha` /
  `scriptsSha` が一致することを確認してから使うか、素直に fetch 内容を書き写す。
- **同期先に app / 人間が管理するファイルがある。deletes に入れてはいけない。**
  `templates/**`（上の「Claude Design templates」）、`uploads/**`（貼り付け画像）、
  `_ds_manifest.json`、`_adherence.oxlintrc.json`、`design-fixes-prompt.md`。
  anchored resync では `deletePaths` を diff から verbatim で渡すので通常は自動的に守られる
  （今回は 0 件だったので `deletes: []` で finalize した）。

## Templates group (added 2026-09)

- `stories/templates/*.stories.tsx` はタイトルが `テンプレート/<Name>` の 2 階層で、Components とは別グループ。
  同期側は `Templates/<Name>` として扱われる想定。画面全体を描くため 900x700 の既定ビューポートでは
  切れる。`cfg.overrides.<Name>.viewport` を 1280x800 以上にするか、Templates グループを同期対象から外す。
- `stories/templates/_shell.tsx` は `_` 始まりで Story 収集対象外（Storybook 専用のシェル見本）。

## Claude Design templates（`.design-sync/templates/`, added 2026-09-11）

- カードパターン集 / 指標カード / カラートークンの 3 点。Claude Design の design agent が使う
  `.dc.html` テンプレートで、上の Storybook Templates とは別物。別プロジェクト（旧
  JazmfDx…@6.0.0）で作ったものを、トークン名をこの Kit に置き換えて取り込んだ。
- converter の生成物には含まれない。同期先の `templates/<name>/` へ **このディレクトリをそのまま
  write する**。**再同期の plan で `templates/**` を deletes に入れないこと**。
- `support.js` は Claude Design の dc-runtime の生成物（編集しない。3 つとも同一内容）。
  `ds-base.js` は `../..` から `fonts/fonts.css` / `_ds_bundle.css` / `styles.css` / `_ds_bundle.js` を読む。
  biome の対象外にしてある（`biome.json`）。
- `card-patterns/Card-titleRule-handoff.md` は Card へ `titleRule` / `footerVariant` を足す仕様で、
  **未実装**。見本は Card の現行 API ではなくインライン style で描いている。
