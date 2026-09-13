# UI Platform

社内Application向けの **UI設計とUI実装の統合入口** です。

再利用可能なReact UI ComponentとSemantic Tokenを中核に、UI設計時に比較するPattern、画面levelのTemplate、Storybook Catalog、AI / 人間向けのdesign referenceを管理します。

詳細な責務分担は [UI_PLATFORM.md](UI_PLATFORM.md)、画面設計へ渡す自己完結した参照資料は [design-system/](design-system/) を参照してください。

## 役割

| 資産 | 正本 |
|---|---|
| 開発上の技術選定・責務境界・制約 | `ai-dev-standards` |
| 現時点のlibrary / tool既定 | `ai-dev-platform/recommendations` |
| 実装・移行・検証・troubleshooting手順 | `ai-dev-playbook` |
| Foundations / Components / Patterns / Templates / Catalog | **このrepository** |
| 業務domain固有UI | 各domain / Application |

社員検索、組織tree、認証基盤連携等のdomain UIはこのrepositoryへ置きません。Django / htmxとの汎用的な接続だけをIslandsとして提供します。

AI agent向けの入口は [CLAUDE.md](CLAUDE.md)、このrepository固有の前提は [decisions/project-context.md](decisions/project-context.md) を参照してください。

## 構成

```text
ui-platform/
├── components/       再利用可能なUI実装
├── tokens/           Semantic TokenとComponent style
├── patterns/         UX課題に対する設計候補
├── templates/        画面levelの構成例
├── stories/          Storybook Catalog
├── design-system/    AI / 人間向けdesign reference
└── decisions/        このrepository固有の決定
```

## Storybook / Catalog

StorybookをComponents / Patterns / Templatesの視覚的Catalog兼、開発・検証環境として扱います。

```bash
bun install
bun run storybook
```

新しいUIを作る前に既存のComponent / Pattern / Templateを確認します。Storyを増やすこと自体を目的にはしません。

- **Gallery**: 主要部品を1画面で俯瞰する。
- **Overview**: variant / size / stateを比較する。
- **個別Story**: 操作、Visual Regression、不具合再現等に使う。
- **Patterns**: UX上の問題単位で複数候補を比較する。
- **Templates**: 複数Pattern / Componentを組み合わせた画面構成例。

Patternは網羅性のために増やさず、「実際の開発で一度迷い、次回も同じ判断に迷いそうか」を追加基準とします。

### 共有版（UI Catalog）

開発時だけ `bun run storybook` を起動します。共有・横断で見るための版は **静的ビルドを配信**し、
Storybookを常駐Nodeプロセスにしません。

```bash
bun run build-storybook   # storybook-static/ を出力
```

mainへマージするとCIが `storybook-static` をworkflow artifactとして上げ、配信側（UI Catalog）が
それを取りに来て配ります。他リポジトリのStorybookと横断で見るにはUI Catalogを使います。

Catalogの構成・配信URL・リポジトリの追加手順は `ui-catalog` repositoryのREADMEを正とします。

## Token

`tokens/theme.css` が具体的なstyle TokenのSource of Truthです。

Componentではraw colorではなく `bg-primary`、`text-foreground`、`border-border` 等のSemantic Tokenを利用します。Applicationごとのbrand差分は利用側のToken overrideで表現し、Component実装を複製しません。

## shadcn/uiとの関係

`components/ui/` はshadcn/uiを基礎とするPrimitiveです。独自wrapperは **追加できるvalueがある場合だけ** 作ります。

公開APIの名前は接頭辞なしで統一します（`Button` / `DatePicker`）。由来は名前ではなく [components/application/index.ts](components/application/index.ts) のsectionで表します。

- UI Platformが独自のAPIや振る舞いを追加したComponent。仕様はStorybookを正とします。
- shadcn/uiをそのままre-exportするComponent。独自wrapperを作る理由がないもの。こちらは [shadcn/uiのドキュメント](https://ui.shadcn.com/docs/components) がそのまま使えます。

どちらのsectionにあるかは実装の内部事情です。必要になれば後者から前者へ移しますが、名前が由来を持たないため利用側は壊れません（[decisions/adr-0006](decisions/adr-0006-drop-application-prefix.md)）。

名前を付け替えるだけのwrapperは作りません。

UI Platform独自の見た目はSemantic Tokenと `tokens/components.css` で管理し、Application側へraw styleの複製を要求しません。

## Package

Repository名は `ui-platform`、Applicationから使う依存名は `application-ui-kit` とします。

GitHub Packagesへpublishされる実package名は `@<owner>/application-ui-kit` です。利用側はnpm aliasで固定名へ割り当てます。

```json
{
  "dependencies": {
    "application-ui-kit": "npm:@<owner>/application-ui-kit@^7.1.0"
  }
}
```

Application codeでは固定aliasを使います。

```tsx
import { Button } from 'application-ui-kit'
import 'application-ui-kit/styles.css'

<Button variant="primary">保存</Button>
```

`application-ui-kit` の公開versionは、このrepositoryの `package.json` をSource of Truthとします。各Applicationが実際に利用するversionは、そのApplicationの `package.json` / lockfileをSource of Truthとします。

### Release

UI Platform repositoryとnpm packageのrelease/versionは独立して管理します。

- `v1.0.0` — UI Platform repositoryとしての1.0 release
- `application-ui-kit-v<package-version>` — npm package release

Repositoryを1.0として再基準化しても、既に公開済みのnpm package versionは巻き戻しません。`application-ui-kit` は既存の6.x seriesを継続し、以後もpackage versionを単調増加させます。

Package release tagは `package.json` のversionと一致する必要があります。Genericな `v<version>` tagではpackage publishを実行しません。

`application-ui-kit-v*` tagは1.0再基準化と同時に導入した形式です。現行の公開version 6.0.0はそれ以前のtag形式で公開されているため、対応する `application-ui-kit-v6.0.0` tagはrepositoryに存在しません。次のpackage releaseから新形式でtagを打ちます。

Package scopeは `package.json` に固定せず、publish時にrepository ownerから導出します（`.github/workflows/publish.yml`）。そのため `package.json` のnameが現在のorigin ownerと異なっていても不整合ではありません。利用側は上記のnpm aliasでowner差分を吸収します。

公開物が利用側でbuildできるかは `bun run verify:package` で確認し、CI / publish前のgateとして扱います。

fork（`origin`）とupstreamのbranch運用、こちらで実装したComponentのupstreamへの反映経路、fork先行時のversionの扱いは [ADR-0002](decisions/adr-0002-fork-branch-and-upstream-flow.md) を正とします。

## Django連携（Islands）

Django Templates + htmxのApplication向けに、React Componentを部分的にmountするための汎用Islandsを提供します。

設計判断は [ADR-0001](decisions/adr-0001-django-htmx-islands.md) を参照してください。

```ts
import 'application-ui-kit/islands/auto-mount'
import { registerIslandComponents, registerIslandLoaders } from 'application-ui-kit/islands'

registerIslandComponents({ 'my-widget': MyWidget })
registerIslandLoaders({ 'heavy-widget': () => import('./HeavyWidget').then((m) => m.HeavyWidget) })
```

- kit標準のIsland（`date-picker` / `tabs` / `toast-listener` 等）は遅延読み込みで登録され、ページに現れたものだけを読み込みます。
- アプリが同じ名前を登録していれば、登録順に関係なくアプリの登録を使います。
- アプリの登録どうしは **後から登録したものが勝ちます**。`registerIslandComponents()` と `registerIslandLoaders()` は同じ表を共有するため、同じ名前をどちらで登録しても前の登録を置き換えます（警告は出ません）。1つの名前はどちらか一方で1回だけ登録してください。
- 最初の走査はentryの評価が終わった後に走るので、同じentryの中で同期的に登録すれば間に合います。登録の前に `await` がある場合はauto-mountを使わず、登録後に `islands` entryの `registerDefaultIslands()` と `startIslandAutoMount()` を呼びます。

判断の背景は [ADR-0008](decisions/adr-0008-keep-unused-heavy-dependencies-out-of-consumer-bundles.md) を参照してください。

認証、業務認可、Application固有endpoint、domain data取得は利用側の責務です。汎用packageへ焼き込みません。

## Design reference

`design-system/` はClaude Design等のAIや人間へ画面設計時に渡す自己完結した参照資料です。

- 実装codeの正: `components/`
- Token具体値の正: `tokens/theme.css`
- 実際の状態・使用例の正: Storybook
- UIの設計要約: `design-system/`

Props一覧、実装手順、sync log、業務domain固有画面をdesign-systemへ重複して持ちません。

## 品質gate

変更内容に応じて次を通します。

```bash
bun run typecheck
bun run test
bun run lint
bun run build
bun run build-storybook
bun run verify:package
```

Component / Storyではaccessibility、keyboard操作、focus、loading / empty / error / disabled、長い文字列、狭い画面幅、reduced motion、Semantic Token利用を確認します。

Application全体のLighthouse、主要導線、N+1 query等は利用側Applicationで `ai-dev-playbook` の品質確認Playbookに従います。

## 共通化しないもの

- 業務domain固有Component
- Application固有のAPI / 認証 / 認可
- Standard本文やRecommendationのcopy
- 一般的な実装・移行・検証Playbook
- 利用実績のない先行抽象化

UI Platformへ追加するのは、UI設計・実装として複数Applicationで再利用する価値が確認されたものに限定します。
