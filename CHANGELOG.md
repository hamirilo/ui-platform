# Changelog

## [8.0.0](https://github.com/hamirilo/ui-platform/compare/application-ui-kit-v7.4.1...application-ui-kit-v8.0.0) (2026-09-28)


### ⚠ BREAKING CHANGES

* コントロールの高さを 24/28/32/40px に揃える
* shadcn/ui gen3 (Base UI) へ移行し、公開APIを整理する

### Features

* add single choice pattern catalog ([fda2a6a](https://github.com/hamirilo/ui-platform/commit/fda2a6ab21ddcfc4f3da78f0206f3313f218955f))
* ApplicationActiveIndicator を公開APIに追加する ([177f93a](https://github.com/hamirilo/ui-platform/commit/177f93a1f00e9fc9a52e461df8c1f6026574e9f2))
* **components:** add copy field island ([759bd61](https://github.com/hamirilo/ui-platform/commit/759bd61c01ded3182104f1306639cd4e5005864e))
* **DatePicker:** add presets support for quick date and range selection ([#66](https://github.com/hamirilo/ui-platform/issues/66)) ([32deb5c](https://github.com/hamirilo/ui-platform/commit/32deb5cf023b009c265c69b03b4a0c077c44ba2d))
* enhance ApplicationButtonGroup and ApplicationDropdown components; add ApplicationThemeToggle tests and update theme styles ([5a20f73](https://github.com/hamirilo/ui-platform/commit/5a20f73c70b702202bbd1acb7dca19f7a530c69c))
* export ApplicationActiveIndicator ([e1c87b0](https://github.com/hamirilo/ui-platform/commit/e1c87b0ac2b845c6ba59d32b1ed5e2c45ee9b210))
* export ISO date helpers and fit filter-bar fields on narrow screens ([#65](https://github.com/hamirilo/ui-platform/issues/65)) ([f8613fe](https://github.com/hamirilo/ui-platform/commit/f8613fed5da86689ff87c01aac9eb9dbf9eef4bf))
* implement ApplicationDatePicker component with tests and update project dependencies ([be06826](https://github.com/hamirilo/ui-platform/commit/be068265fb061b34202404015c82af62f93d1e2d))
* migrate generic UI kit from hamirilo-ui ([5079261](https://github.com/hamirilo/ui-platform/commit/5079261ea008eb1bd878ae9d6eb73a0561ca1ef3))
* Rating と、空状態・一覧行のテンプレート用クラスを足す ([#57](https://github.com/hamirilo/ui-platform/issues/57)) ([0279d90](https://github.com/hamirilo/ui-platform/commit/0279d90a628610a8af794115bf6a6d92f10882c5))
* shadcn/ui gen3 (Base UI) へ移行し、公開APIを整理する ([ff5c673](https://github.com/hamirilo/ui-platform/commit/ff5c6734b88a1866dae1f53f8bd20eadda720a4e))
* アイコンと文字の光学バランスを黄金比で導出する ([e3da9b2](https://github.com/hamirilo/ui-platform/commit/e3da9b25005a2fd5bd9ef65df08aada76c87dc1e))
* コントロールの高さを 24/28/32/40px に揃える ([b2805c8](https://github.com/hamirilo/ui-platform/commit/b2805c8aacd9e252f6fe9a9fef83ccef27648a12))
* 検索と新規作成ができる ApplicationCombobox を追加する (v1.1.0) ([dab6fa0](https://github.com/hamirilo/ui-platform/commit/dab6fa0ac6bc4d4305f680ccb4a4a205f2b683e5))
* 現行 ai-dev-standards への適合と Django 連携 Islands の追加 ([558e2ca](https://github.com/hamirilo/ui-platform/commit/558e2ca40ba7b8f790dd6571b53c342e40bcbf27))


### Bug Fixes

* add accessible labels to single choice catalog ([ef346b3](https://github.com/hamirilo/ui-platform/commit/ef346b3a9e466b6df0d75d219668de270a2abe9e))
* adjust calendar cell sizing and update day button class selector ([3c5e739](https://github.com/hamirilo/ui-platform/commit/3c5e7394a5b14b40cb7abe5341514967b5e4499a))
* adjust width handling in Combobox and Select components to prevent overflow issues ([884e9fb](https://github.com/hamirilo/ui-platform/commit/884e9fba5fa48cdb888646f23e4357e006cf6a2e))
* align card and input sizing ([65306d3](https://github.com/hamirilo/ui-platform/commit/65306d3781b5fffd851f6ee837ca480fa850fbcb))
* **ButtonGroup:** keep pressed-primary toggle readable on hover ([#68](https://github.com/hamirilo/ui-platform/issues/68)) ([f9f7b8e](https://github.com/hamirilo/ui-platform/commit/f9f7b8ea371794c70535f419e6acaa037adbd8b0))
* **ci:** actions を node24 の最新 major へ上げる ([#46](https://github.com/hamirilo/ui-platform/issues/46)) ([6ae4550](https://github.com/hamirilo/ui-platform/commit/6ae45501f546996d35c6cc9eddc3ae7c0de110d2))
* **ci:** stop biome from rejecting files release-please rewrites ([#63](https://github.com/hamirilo/ui-platform/issues/63)) ([82f3796](https://github.com/hamirilo/ui-platform/commit/82f379696be310c40aa66a419b8298c39ea53c4d))
* **components:** InputGroup / Textarea の余白統一と ScopeSearch パネルの portal 化 ([#47](https://github.com/hamirilo/ui-platform/issues/47)) ([aa8fd6e](https://github.com/hamirilo/ui-platform/commit/aa8fd6e5c7bf3fe4285d62c5ecc3b0e48e725028))
* **components:** keep Dialog and Tabs inside narrow screens ([#61](https://github.com/hamirilo/ui-platform/issues/61)) ([2aa035f](https://github.com/hamirilo/ui-platform/commit/2aa035fcad90494d9aec1087d3ecfa6960a560e9))
* **components:** 候補を出す入力欄でブラウザの入力履歴を出さない ([#70](https://github.com/hamirilo/ui-platform/issues/70)) ([1670d31](https://github.com/hamirilo/ui-platform/commit/1670d311906dacd89ef2f0245ca0c8375edf684d))
* correct checkbox and radio display ([d73d55e](https://github.com/hamirilo/ui-platform/commit/d73d55e12be85f6c607a9ec18ee0d5d44fde7a8e))
* correct checkbox and radio display ([0419c34](https://github.com/hamirilo/ui-platform/commit/0419c34659b1a5abdde4bda5f25f6d3125b46757))
* **design-sync:** exclude Tailwind compile output from token extraction ([1f2980b](https://github.com/hamirilo/ui-platform/commit/1f2980b1fd4d9ec1d299112f28a797b21a22da1d))
* **exports:** remove ScopeSearch overlap with PR [#37](https://github.com/hamirilo/ui-platform/issues/37) ([e332013](https://github.com/hamirilo/ui-platform/commit/e33201399a50ca388a036c93a21932a433c39764))
* **islands:** form-dialog が空のダイアログを開く不具合と .input-field のエラー枠を直す ([#55](https://github.com/hamirilo/ui-platform/issues/55)) ([6be77d6](https://github.com/hamirilo/ui-platform/commit/6be77d684dca9137cb2686b740a05e2bc1b4d353))
* **islands:** preserve copy values as strings ([b5f246b](https://github.com/hamirilo/ui-platform/commit/b5f246be16e0f4fbeca23d085a4446b3e31273ae))
* keep package version monotonic ([e4734d2](https://github.com/hamirilo/ui-platform/commit/e4734d24e120e60ac45d6dd65e1e963fa0efc148))
* keep toast story framework-only ([1f2ce5e](https://github.com/hamirilo/ui-platform/commit/1f2ce5ede183409440ca0c3f52bc9195da8901c2))
* legacy package release tag を受け付ける ([3e0bf62](https://github.com/hamirilo/ui-platform/commit/3e0bf6246c1223bbe42bbec636d015472a989354))
* make single choice examples accessible ([ee649e6](https://github.com/hamirilo/ui-platform/commit/ee649e6066357893f18316cf3728919df41893b3))
* package release tag の移行互換を追加する ([1cd40d9](https://github.com/hamirilo/ui-platform/commit/1cd40d92699caa4ba6285e16297fe14ff5a280bf))
* **release:** stop Release Please from emitting double-v tags ([#71](https://github.com/hamirilo/ui-platform/issues/71)) ([df5b835](https://github.com/hamirilo/ui-platform/commit/df5b83592861a3cadd6c29eb69502171a2d53024))
* run package verification through bash ([cc3261f](https://github.com/hamirilo/ui-platform/commit/cc3261fe9215e42d246bca230e6e84b931a47598))
* Storybook が起動しない不具合と、フォーク由来の名残を除去する ([6d6886b](https://github.com/hamirilo/ui-platform/commit/6d6886bfe3d8277d7a193244ffd80af8682b1359))
* Storybook が起動しない不具合と、フォーク由来の名残を除去する ([b71aa78](https://github.com/hamirilo/ui-platform/commit/b71aa787cee06571171cdcdd8762d034460b5029))
* **storybook:** storySort を配列形式に戻し、index 生成の失敗要因を外す ([79851fa](https://github.com/hamirilo/ui-platform/commit/79851fa8b186fe93f2a21c22ce61154b663ca124))
* update ApplicationDatePicker display format from Japanese date to yyyy-MM-dd ([bd9650d](https://github.com/hamirilo/ui-platform/commit/bd9650df70901130809e8a604b02a0551350a8e3))
* 和文の縦位置を Inter のメトリクスオーバーライドで補正する ([011a8ad](https://github.com/hamirilo/ui-platform/commit/011a8ad0bb0ee15bee1963ee81a12f8bbf28e14a))

## [7.4.1](https://github.com/hamirilo/ui-platform/compare/application-ui-kit-v7.4.0...application-ui-kit-v7.4.1) (2026-09-26)


### Bug Fixes

* **ButtonGroup:** keep pressed-primary toggle readable on hover ([#68](https://github.com/hamirilo/ui-platform/issues/68)) ([f9f7b8e](https://github.com/hamirilo/ui-platform/commit/f9f7b8ea371794c70535f419e6acaa037adbd8b0))

## [7.4.0](https://github.com/hamirilo/ui-platform/compare/application-ui-kit-v7.3.0...application-ui-kit-v7.4.0) (2026-09-26)


### Features

* **DatePicker:** add presets support for quick date and range selection ([#66](https://github.com/hamirilo/ui-platform/issues/66)) ([32deb5c](https://github.com/hamirilo/ui-platform/commit/32deb5cf023b009c265c69b03b4a0c077c44ba2d))

## [7.3.0](https://github.com/hamirilo/ui-platform/compare/application-ui-kit-v7.2.1...application-ui-kit-v7.3.0) (2026-09-26)


### Features

* export ISO date helpers and fit filter-bar fields on narrow screens ([#65](https://github.com/hamirilo/ui-platform/issues/65)) ([f8613fe](https://github.com/hamirilo/ui-platform/commit/f8613fed5da86689ff87c01aac9eb9dbf9eef4bf))


### Bug Fixes

* **ci:** stop biome from rejecting files release-please rewrites ([#63](https://github.com/hamirilo/ui-platform/issues/63)) ([82f3796](https://github.com/hamirilo/ui-platform/commit/82f379696be310c40aa66a419b8298c39ea53c4d))

## [7.2.1](https://github.com/hamirilo/ui-platform/compare/application-ui-kit-v7.2.0...application-ui-kit-v7.2.1) (2026-09-25)


### Bug Fixes

* **components:** keep Dialog and Tabs inside narrow screens ([#61](https://github.com/hamirilo/ui-platform/issues/61)) ([2aa035f](https://github.com/hamirilo/ui-platform/commit/2aa035fcad90494d9aec1087d3ecfa6960a560e9))

## Changelog

このファイルは Release Please により更新します。
