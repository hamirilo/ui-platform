# ADR-0008: 使わない重い依存を利用側のバンドルに入れない

**ステータス**: 採用

**関連**: [ADR-0001](adr-0001-django-htmx-islands.md)（Islands entryの構成。決定は変えず、auto-mountの登録方法を変える）、
[ADR-0006](adr-0006-drop-application-prefix.md)（v8.0.0で旧名を削除する計画。versionの判断で参照する）

## コンテキスト

利用側Application（Django Templates + React Islands）で、kitの一部だけを使っているのに
使っていない依存がメインバンドルへ入っていることが分かった。

**1. NavItemがframer-motionを常に引き込む。**
`NavItem` はアクティブ項目に `ActiveIndicator`（`motion.div` + `layoutId`）を必ず描いていた。
ある利用側が左サイドバーを `NavItem` へ置き換えたところ、メインバンドルがgzipで約100 kBから153 kBへ増えた。
Django Templates + Islandsの構成ではページ遷移のたびにフルリロードになるため、
項目間を背景が移動するshared layout animationはほぼ見えない。見えない効果のためにコストだけを払っていた。

**2. auto-mountが標準Islandをすべて静的に登録する。**
`islands/auto-mount` はkit標準の10個のIslandを静的importして登録していたため、
auto-mountをimportしただけでDatePickerIsland（react-day-picker / date-fns）、Dialog、Toast等がすべて入る。
使い方にも問題が2つあった。

- importした時点で同期的に走査するため、ES moduleの静的importの後に書いた `registerIslandComponents()` が
  最初の走査に間に合わない（README / index.tsの例がその順で書かれていた）。
  ある利用側は登録を済ませてから `await import(".../auto-mount")` する回避策を取っていた。
- kit標準がアプリの登録の **後に** 登録されるため、アプリが先に登録した同名のIsland（例: 自前の `date-picker`）が上書きされる。

このため別の利用側はauto-mountを使わず、`islands` entryの `parseProps` / `registerIslandComponents` を使って
遅延読み込みつきのmount loopを自前で持っていた。

### 実測（変更前）

tarball化した配布物を、利用側と同じVite構成の最小プロジェクトでbuildし、sourcemapの `sources` からpackageを集計した。
React + ReactDOMだけのbuildは67.5 kB gzip。

| 利用側のimport | 初期ロード（gzip） | 含まれていた重い依存 |
|---|---|---|
| `NavItem` だけ | 117.6 kB | framer-motion / motion-dom / motion-utils |
| `islands/auto-mount` だけ | 162.1 kB | react-day-picker / date-fns / @date-fns/tz / @base-ui/react / lucide-react 等 |

## 決定

### 1. `NavItem` は既定でframer-motionを使わない。アニメーション版は `AnimatedNavItem` として分ける

- `NavItem` のアクティブ背景はCSSだけの静的な要素で描く。色・枠・角丸のclassは従来と同じ。
- 項目間を背景が移動する版を `AnimatedNavItem` として別exportにする。propsと見た目は `NavItem` と同じ。
- 共通実装は `nav-item-base.tsx`（非公開）に置き、framer-motionを使う `ActiveIndicator` は
  `AnimatedNavItem.tsx` だけがimportする。**`NavItem.tsx` / `nav-item-base.tsx` からmotion版を参照しない。**
- `NavItem` の `layoutId` は型として受け付けたまま無視し、`@deprecated` にする（v8.0.0で削除）。

「`animated` / `layoutId` propを渡したときだけmotion版を描く」案（案a）は採らなかった。
`NavItem` がmotion版を条件分岐で描く限り、`NavItem.tsx` がmotion版をimportすることになり、
propを渡さない利用側でもframer-motionがバンドルに入る。`React.lazy` で分けると別チャンクにはなるが、
初回のアクティブ切替でチャンク読み込みを待つ間は背景が出ず、shared layout animationとも噛み合わない。
tree-shakingで確実に落とせるのはmodule単位で分けたときだけなので、exportを分けた（案b）。

`package.json` の `sideEffects` は `auto-mount` とCSSだけを副作用ありとしているため、
`index.js` が `AnimatedNavItem` / `ActiveIndicator` をre-exportしていても、使わなければ利用側のbundlerが落とす。
`preserveModules` でComponentごとにfileが分かれていることも前提になる（`vite.config.ts`）。

### 2. kit標準のIslandは遅延読み込みで、アプリの登録より低い優先度で登録する

- registryを **アプリの登録** と **kit標準** の2層に分ける。同じ名前があれば、登録順に関係なくアプリの登録を使う。
- kit標準はloader（`() => import("./DatePickerIsland")...`）で登録し、ページに `data-react` が現れたときだけ読み込む。
  読み込みが終わるまで、マウント先にはサーバーが描いた中身がそのまま残る。読み込み中は `data-react-mounted="pending"` を付け、
  htmxのスワップによる再走査で二重に読み込まない。読み込み中に要素がDOMから外れたらマウントしない。
- アプリも `registerIslandLoaders()` で同じ遅延読み込みを使える。
- マウント処理を副作用のない `mount.tsx` へ移し、`islands` entryから `mountIsland` / `initializeIslands` /
  `startIslandAutoMount` / `registerDefaultIslands` / `registerIslandLoaders` / `loadIslandComponent` をexportする。
  `auto-mount` は `registerDefaultIslands()` と `startIslandAutoMount()` を呼ぶだけのentryになる。
- 最初の走査はmicrotaskまで遅らせる。同じentryの中で同期的に登録すれば、auto-mountのimportより後に書いても間に合う。
- `htmx:afterSwap` はhtmxの有無を見ずに `document` で受ける（htmxをentryより後に読み込んでも効く）。
- JSONとして解釈しないdata属性（`copy-field` の `value` 等）はkit標準の定義に持たせる。
  アプリが同じ名前を上書きした場合は適用しない（そのIslandの属性の意味はアプリが決める）。

すべてのkit標準を遅延読み込みにした。`toast-listener` のように全ページにあるIslandは、初回だけチャンクの読み込みを待つ。
待ちたくないIslandは、アプリが `islands` entryからComponentをimportして `registerIslandComponents()` で同期登録すれば、
その名前だけ遅延読み込みをやめられる（アプリの登録が勝つため）。

### 3. 再発を `verify:package` で検知する

`scripts/fixtures/consumer` に「`NavItem` だけ」「`auto-mount` だけ」をimportするentryを置き、
初期ロード（entryと静的importのチャンク）のsourcemapに上記の重い依存が含まれないことを `check-bundle.mjs` で確かめる。
変更前の配布物に対しては両方とも失敗することを確認した。

### 4. versionはminor（7.2.0）とする

公開APIの型とexportは互換で、追加だけである（`AnimatedNavItem` / `AnimatedNavItemProps`、islandsの関数と型）。
挙動は次の点が変わるため、release noteに明記する。

| 変わる挙動 | 影響を受ける使い方 |
|---|---|
| `NavItem` のアクティブ背景が項目間を移動しない | 同じページ内でactiveを切り替え、動きを見せていた場合。`AnimatedNavItem` へ置き換える |
| kit標準のIslandが非同期にマウントされる | import直後に `getIslandComponent("date-picker")` 等でkit標準を同期的に取り出していた場合（読み込むまで `null`）。`loadIslandComponent()` を使う |
| アプリの登録がkit標準より優先される | auto-mountより前に同名を登録し、kit標準で上書きされることを期待していた場合（意図した挙動とは考えにくい） |
| kit標準のIslandが別チャンクになる | 利用側のbundlerがcode splittingをしない構成（IIFE単一file等）。Viteの既定のES出力では問題ない |

利用側の実態を確認した。`NavItem` をpackageからimportしているのは1 Applicationだけで、フルリロードの画面で使っているため動きは元々見えない。
auto-mountを使っているApplicationは登録後に動的importしており、`getIslandComponent` をkit標準に対して呼んでいない。
残る1 Applicationは `^5.1.x` 固定でcaretがこのversionに届かない。いずれもViteのES出力でbuildしている。

majorにしない理由: 型・exportの互換を保ったまま、既知の利用側を壊さない変更である。
v8.0.0は [ADR-0006](adr-0006-drop-application-prefix.md) で旧名の削除に予約しており、
ここでmajorを上げると「旧名を消すmajor」と「挙動を変えるmajor」が別々に来て、利用側の移行作業が2回に分かれる。

## 結果

変更後の配布物で同じ計測をした。

| 利用側のimport | 変更前 | 変更後 |
|---|---|---|
| `NavItem` だけ | 117.6 kB | **77.3 kB**（framer-motion / motion-dom / motion-utilsなし） |
| `AnimatedNavItem` を使う | —（`NavItem` と同じ117.6 kB） | 117.7 kB |
| `islands/auto-mount` だけ（初期ロード） | 162.1 kB | **69.9 kB**（各Islandは使われたときに読む別チャンク） |

- MPA構成の利用側は、`NavItem` / auto-mountを使っても使わない依存を払わなくなる。
- auto-mountのimport順の罠（登録が走査に間に合わない、同名が上書きされる）がなくなり、自前のmount loopを持つ理由が減る。
- 制約として、kit標準のIslandは初回マウントがチャンク1つ分遅れる。サーバーが描いた中身は残るので、空白にはならない。
- 制約として、`NavItem` と `AnimatedNavItem` の2つを保つ。見た目の変更は `nav-item-base.tsx` の1箇所で済むが、
  **`NavItem` 側からmotion版を参照しないこと** はtest（framer-motionのimportで落ちるmock）と `verify:package` で守る。

## 見直し

- framer-motion以外にも、特定のComponentだけが使う重い依存（react-day-picker等）がmain entryの共通部品へ入り込んだら、同じ方針で分ける。
- kit標準Islandの初回読み込みの遅れが体感で問題になった場合は、`toast-listener` 等の小さく全ページにあるものだけを同期登録へ戻すかを検討する。
