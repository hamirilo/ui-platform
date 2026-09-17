# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **共通入口**: AI agentは最初に `../ai-dev-platform/ai/ONBOARDING.md` を読むこと。
> sibling checkoutがない場合は https://github.com/hamirilo/ai-dev-platform/blob/main/ai/ONBOARDING.md を参照する。
> Standards / Recommendations / Playbookの選択はai-dev-platformのroutingに従い、ここには **このrepository固有の差分だけ** を書く。

## Project概要

複数Application向けの **UI Platform**。

- Foundations / Semantic Token
- 再利用可能なReact UI Components
- UI設計時に比較するPatterns
- 画面levelのTemplates
- Storybook Catalog
- AI / 人間向けの `design-system/`

を同じrepositoryで管理する。

Application側のpackage依存名は `application-ui-kit` に固定する。publishされる実packageは `@<owner>/application-ui-kit` とし、利用側 `package.json` のnpm aliasでowner差分を閉じ込める。Application code / Story / JSDocでは `application-ui-kit` をimportする。

Django + htmxとの汎用的な接続は `./islands` / `./islands/auto-mount` entryで提供する（[decisions/adr-0001](decisions/adr-0001-django-htmx-islands.md)）。

実装前に [decisions/project-context.md](decisions/project-context.md) と [UI_PLATFORM.md](UI_PLATFORM.md) を読むこと。

## このrepository固有のrule

- **Component** は実際に複数Applicationから再利用するimplementation。Patternで使った組合せをすぐComponent化しない。
- **Pattern** はComponent名ではなく設計上のproblemを単位にする。複数の有力候補と選択条件を残す。
- **Template** は複数Pattern / Componentを組み合わせた画面levelの構成例。Application固有API・権限・業務ruleを持ち込まない。
- **Catalog** は新しいknowledge layerではなくStorybookを使った表示・比較・検証面として扱う。
- **wrapperは追加できるvalueがあるときだけ作る。** shadcn/ui相当物へvalueを追加しない場合はre-exportを優先する。
- **公開APIの名前に接頭辞を付けない。** `Button` / `DatePicker` のように書く。shadcn/ui由来か自前かは名前ではなく `components/application/index.ts` のsectionで表すので、**exportを追加するときは正しいsectionへ置くこと**（[decisions/adr-0006](decisions/adr-0006-drop-application-prefix.md)）。wrapper内部でshadcn/uiのprimitiveをimportするときは `Button as ButtonPrimitive` のようにエイリアスする。
- **見た目はSemantic Tokenを正とする。** raw colorを追加しない。Component内部skinは `tokens/components.css`、Token具体値は `tokens/tokens.css` を正とする（`tokens/theme.css` は3ファイルを束ねる入口）。
- **テンプレート用classは `tokens/classes.css` が公開契約。** React Componentと1:1に揃え、片方だけに部品を増やさない。色は `var(--color-*)` のみ（raw paletteと `dark` 接頭辞のユーティリティを書かない）。対応表は `design-system/README.md`、見本はStorybook「基礎/テンプレート用クラス」（[decisions/adr-0007](decisions/adr-0007-template-class-contract-and-presentation-islands.md)）。
- **業務domain固有UIは置かない。** Domainを所有するprojectへ置く。名前が業務語彙かどうかではなく、**ドメイン連携（マスタ取得・認証・CSRF・endpoint設定）を内部に持つか** で判断する。propsでデータを受け取るだけなら汎用Componentとしてここに置いてよい（[decisions/adr-0003](decisions/adr-0003-domain-ui-boundary.md)。提案中）。
- 新しいUIを作る前にStorybookで既存Component / Pattern / Templateを確認する。他repositoryのdomain UIも含めて探すときはUI Catalog（`ui-catalog` repository）を見る。
- Patternは「実際に一度迷い、次回も同じ判断に迷いそうか」を追加基準とし、網羅性のためだけに増やさない。
- 共通化するComponentにはStoryを追加する。Patternは候補を比較できるCatalog Storyを優先する。
- **branchは `upstream/main` から切り、PRはupstream宛に出す。** `main` はupstreamのmirrorとして保つ。fork運用とversionの扱いは [decisions/adr-0002](decisions/adr-0002-fork-branch-and-upstream-flow.md) を正とする。

## CI とリリース

- **CI (`.github/workflows/ci.yml`)**: PR と `main` への push で実行。変更検出（`changes`）により、ドキュメントのみの変更時はビルド・テストをスキップして即座に集約ジョブ `ci` が完了する。
- **リリース (`.github/workflows/release-please.yml`)**: `main` への squash merge を契機に Release Please が version 更新（`package.json`）・`CHANGELOG.md`・Release PR を管理。Release PR をマージすると tag（`application-ui-kit-vX.Y.Z`）と GitHub Release が作成され、GitHub Packages への npm publish が自動実行される。
- **PR タイトル**: Conventional Commits 形式（`feat:`, `fix:`, etc.）を必須とする（`.github/workflows/pr-title.yml`）。

## 検証

通常の変更では次を通す。

```bash
just check
```

`just check` はtypecheck / test / lint / package build / Storybook buildを実行する。

Packageの公開契約や依存関係へ影響する変更では、利用側fixtureによる配布検証も行う。

```bash
just verify-package
```

判断基準の正は [Application UI Standard](https://github.com/hamirilo/ai-dev-standards/blob/main/standards/application-ui/README.md)、UI Platform内の責務分担は [UI_PLATFORM.md](UI_PLATFORM.md) を参照する。
