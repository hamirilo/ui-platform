# ADR-0001: Django連携Islandsをpackageの公開APIに含める

**ステータス**: 採用

## コンテキスト

[Architecture Standard](https://github.com/hamirilo/ai-dev-standards/blob/main/standards/architecture/README.md) はDjango Templatesをpage shell / SSRの基盤とし、interactive UIにはReact Islandsを利用します。htmxはserver起点の部分HTML更新へ限定します。

この構成では、複数Applicationで次の接続処理が繰り返されます。

- `data-*` 属性からReact Componentをmountする
- Django Form HTMLをDialogへ表示する
- `HX-Trigger` 等のserver eventをUI feedbackへ接続する
- Django CSRF tokenを状態変更requestへ渡す

これらは業務domainではなくDjango + React Islands間の汎用接続です。Applicationごとに再実装する価値が低いため、UI Platformのpackageで共通化します。

## 決定

1. Django連携Island、自動mount、registry、CSRF helperを `components/islands/` に置く。
2. `./islands` を副作用なしのentry、`./islands/auto-mount` をauto mount用の副作用entryとして公開する。
3. Main entry `.` はframework非依存のUI Componentとして保ち、pure React ApplicationはIslands entryをimportしなければDjango依存を持たない。
4. **Application固有情報をpackageへ焼き込まない。** Endpoint URL、業務data、認証方式等は利用側からparameter / `data-*` 等で渡す。
5. Django CSRFの汎用接続は提供できるが、認証・業務認可の判断自体は利用側Applicationの責務とする。
6. 業務domain固有IslandはUI Platformへ追加せず、Application側で実装してregistryへ登録する。

## 理由

- 接続方法が複数Applicationで同じ形になりやすく、差が出ることに価値がない。
- UI PlatformはComponentだけでなく、UIをApplicationへ接続する再利用可能な汎用実装も所有できる。
- 副作用entryを分けることで、main package APIのtree-shakingとframework-independentな利用を維持できる。
- Domain data / endpoint / authをparameter化することで、UI PlatformとApplicationのownership boundaryを維持できる。

## 結果

Django + htmx Applicationは必要に応じて次を利用できます。

```ts
import 'application-ui-kit/islands/auto-mount'
```

Packageの実scopeはpublish ownerに依存しますが、Application側はnpm aliasにより `application-ui-kit` を固定の依存名として利用します。

Island APIを変更する場合も、UI packageの公開契約としてSemVerで扱います。

## 見直し

WebSocket等、異なる接続方式が複数Applicationで繰り返される場合は、同じpackage内の別entryへ分けるか、独立packageが必要かを利用実績に基づいて判断します。

## 追記（2026-09）: 見せ方だけの島と、ページに1つ置く窓口

このADRが想定していた標準Islandは「値を書き戻す・fetchする」ものだけだった。
[ADR-0007](adr-0007-template-class-contract-and-presentation-islands.md) で次の2種類を加えた。

| 種類 | Island | 性質 |
|---|---|---|
| 見せ方だけの島 | `tabs` / `disclosure` / `field-visibility` | サーバーが描いたHTMLの `hidden` を切り替えるだけ。中身をReactへ持ち上げない |
| ページに1つ置く窓口 | `toast-listener` / `confirm-host` | ページ全体の通知・確認要求を1箇所で受ける。2つ目は警告して何もしない |

決定1〜6は変えない。`confirm-host` の `hx-confirm` 横取りはオプトイン（`data-intercept-hx-confirm`）とし、
利用側が既に自前のリスナーを持っていても壊れないようにした。

## 追記（2026-09）: kit標準Islandの遅延登録

[ADR-0008](adr-0008-keep-unused-heavy-dependencies-out-of-consumer-bundles.md) で、auto-mountがkit標準のIslandを
すべて静的に登録していたのをやめ、遅延読み込みで登録するようにした。マウント処理は副作用のない `islands` entryへ移し、
`auto-mount` はそれを呼ぶだけの副作用entryになった。決定1〜6は変えない。

- registryはアプリの登録とkit標準の2層で、同じ名前ならアプリの登録を使う。
- 最初の走査はmicrotaskまで遅らせ、auto-mountの静的importの後に書いた登録も間に合うようにした。
