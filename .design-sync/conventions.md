## Using this design system

**No provider/root wrapper is required.** Components render fully styled as soon as the bundle and `styles.css` are loaded — there is no `ThemeProvider`/`ConfigProvider` export in this package. Two setup details still matter:

- **Dark mode** is a plain class toggle, not a provider: add/remove `.dark` on the root element (e.g. `<html>`) and every semantic color token flips automatically. `ThemeToggle` already does this internally — reuse it rather than re-implementing the toggle.
- **Toasts need a mount point.** `toast` is the function that fires a toast; `Toaster` is a separate export that must be rendered once, near the app root (it's the portal the toasts render into). Without it, `toast(...)` calls do nothing visible.

### Styling idiom: Tailwind v4 + semantic color tokens

Never use raw colors (`bg-blue-600`, `#2563eb`, arbitrary `oklch(...)`) in new layout code. This design system's palette is exposed as CSS custom properties (`--color-*` in `styles.css`) and consumed through matching Tailwind utility classes:

| Role | Classes |
|---|---|
| Primary action | `bg-primary`, `text-primary-foreground`, `hover:bg-primary-hover` |
| Secondary / muted surfaces | `bg-muted`, `text-muted-foreground`, `bg-secondary`, `text-secondary-foreground` |
| Body text / default surface | `text-foreground`, `bg-background`, `bg-card`, `text-card-foreground` |
| Borders / focus | `border-border`, `ring-ring` |
| Semantic status | `bg-destructive` / `text-destructive-foreground` / `text-destructive` (danger), `bg-success` / `text-success`, `bg-warning`, `bg-info` — fills only: success / warning / info have **no** `-foreground` or `border-*` utility in the shipped CSS |

The shipped stylesheet contains only the utility classes this kit itself uses, so a Tailwind class that isn't listed here may simply not exist and render unstyled. For status-colored UI, don't hand-assemble colors — use `Badge` (`tone`: `new` / `active` / `done` / `warning` / `danger` / `pending` / `neutral`) for status labels and `Alert` (`tone`: `info` / `success` / `warning` / `danger`) for messages; they already pair the fill with the right text and border colors.

Use these for any layout glue (containers, spacing wrappers, custom sections) you build around the library components. Don't reach for the `cn-*` classes in `tokens/components.css` (`cn-button`, `cn-card`, `cn-badge`, …) directly — those are the internal skin for this repo's own `components/ui/*` primitives; compose UI from this kit's exported components instead (`Button`, `Input`, `Dialog`, etc.), which already wrap them with this system's semantics (e.g. `variant="primary" | "secondary" | "danger" | "success" | "ghost" | "link"` instead of raw shadcn variant names).

### Where the truth lives

Read `styles.css` before styling anything new — it's the real `@import` closure (tokens, fonts, component skins) shipped with this bundle. Each component's `.prompt.md` documents its intended composition and props; its `.d.ts` is the authoritative API.

### Example

```tsx
<div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-6 text-card-foreground">
  <h2 className="text-sm font-medium text-foreground">申請の確認</h2>
  <p className="text-sm text-muted-foreground">この内容で送信します。よろしいですか？</p>
  <div className="flex justify-end gap-2">
    <Button variant="secondary">キャンセル</Button>
    <Button variant="primary">送信する</Button>
  </div>
</div>
```
