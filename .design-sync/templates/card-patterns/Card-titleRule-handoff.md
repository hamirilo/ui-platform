# Card 変更仕様 — タイトル罫線 / muted フッター帯

対象: このUI Kitの `Card`（`Application` prefix 廃止後の名称。旧 `ApplicationCard` / `DxCard`）。
Django 側に同等の `.card` クラスがあれば揃えて変更してください。
実装後に `/design-sync` で再同期します。
見た目の見本: Templates「指標カード（タイトル罫線）」「カードパターン集」。

## 背景

カテゴリ・状態のアクセントを左ボーダーで表すのをやめる（角丸 `--radius-xl` と衝突する）。
代わりにタイトル行の下へカード幅いっぱいの罫線を引く。

## 追加プロパティ

```ts
/** タイトル行下の罫線。'none'（既定）| 'neutral' 1px border色 | 'accent' 2px accentColor */
titleRule?: "none" | "neutral" | "accent"

/** titleRule="accent" 時の罫線色。CSS 色値。既定 var(--color-primary) */
accentColor?: string

/** フッターを muted 帯（背景 muted・フルブリード）にする。既定 false（従来の border-t のみ） */
footerVariant?: "plain" | "band"
```

## 実装仕様

- 罫線はヘッダー div の直後に独立した `<div>`。フルブリードにするため左右へパディング分ネガティブマージン:
  - sm: `-mx-3` / md: `-mx-4` / lg: `-mx-6`（`PADDING_CLASS` と対で `RULE_MARGIN_CLASS` を持つ）
- カードルートに `overflow-hidden` を追加（罫線・帯が角丸からはみ出さないように）。
- `titleRule` 指定時、ヘッダーの `mb-3` は罫線側に移す（ヘッダー `pb-2.5` → 罫線 → 本文 `pt-3` 相当）。
- neutral: `h-px bg-border` / accent: `h-0.5` + `style={{background: accentColor ?? "var(--color-primary)"}}`
- `footerVariant="band"`: `mt-3 -mx-{3|4|6} -mb-{3|4|6} px-{3|4|6} py-2.5 border-t border-border bg-muted text-xs text-muted-foreground`
- `hasHeader` が false のとき `titleRule` は無視（描画しない）。

## 使い分けルール（prompt.md に追記する文言）

- 罫線なし: 区切り不要な単独カード。
- neutral(1px): 既定。見出しと本文を分けるだけ。
- accent(2px): カテゴリ・警告など意味色を示す時だけ。1カード1色。
- 左ボーダー（`border-l-*`）はカードでは使用禁止。

## 例

```tsx
<Card title="交雑牛去勢 A5" action={<Badge>牛</Badge>}
  titleRule="accent" accentColor="var(--color-amber-600)"
  footerVariant="band" footer={<>前年同月比 +9.5% ｜ 直近30回 ¥1,847〜¥2,436</>}>
  …数値本文…
</Card>
```

## このKitへ移植したときのトークン差分

見本テンプレートは元DS（jazmf-ui）から移植したもので、無い変数を次へ置き換えています。実装時も同じ対応で読んでください。

| 元DS | このKit |
|---|---|
| `--text-h4-size` / `-weight` / `-leading` | `--text-xl` / `--font-weight-semibold` / `--text-xl--line-height` |
| `--text-sm-size` / `--text-sm-leading` | `--text-sm` / `--text-sm--line-height` |
| `--text-xs-size` | `--text-xs` |
| `--radius-full` | `999px`（このKitに `--radius-full` は無い） |
| `--shadow-sm` | `.cn-card` と同じ実値 `0 1px 3px 0 #0000001a, 0 1px 2px -1px #0000001a` |
| `--color-warning-hover` / `--color-warning-foreground` | `--color-amber-600` / `--color-yellow-950`（warning は base のみ定義） |
| `--status-new-fg` / `--status-active-fg` / `--status-done-fg` | `--color-blue-700` / `--color-primary` / `--color-success-active` |
| `--status-danger-fg` / `--status-danger-bg` | `--color-danger-active` / `--color-red-50` |
| `--avatar-user-bg` / `--avatar-user-fg` | `--color-blue-50` / `--color-blue-700` |

`--color-warning` に hover / active / foreground を足すか、`--radius-full` を定義するかは、このKit側の判断です。足すなら見本の置き換えも戻せます。
