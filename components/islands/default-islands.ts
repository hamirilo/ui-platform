/**
 * このパッケージ標準の Island（副作用なし）
 *
 * すべて遅延読み込みで登録します。ページに `data-react="date-picker"` が無ければ
 * DatePickerIsland（react-day-picker / date-fns）は読み込まれません。
 * 利用側のバンドラは各 Island を別チャンクに分けます（decisions/adr-0008）。
 *
 *   値を書き戻す・fetch する島   date-picker / rating / copy-field / file-drop-zone / confirm-dialog / form-dialog
 *   見せ方だけの島               tabs / disclosure / field-visibility
 *   ページに 1 つ置く窓口         toast-listener / confirm-host
 *
 * 同じ名前をアプリが registerIslandComponents() / registerIslandLoaders() で登録していれば、
 * 呼び出し順に関係なくアプリの登録が使われます。
 *
 * 最初の描画を待たせたくない Island（例: toast-listener）は、`islands` エントリから
 * コンポーネントを import して registerIslandComponents() で同期登録すれば、
 * その名前だけ遅延読み込みをやめられます。
 */

import { type DefaultIslandDefinition, registerDefaultIslandLoaders } from "./registry";

/** キット標準の Island の data-react 名と、その読み込み方 */
export const defaultIslandDefinitions: Readonly<Record<string, DefaultIslandDefinition>> = {
  "confirm-dialog": {
    load: () => import("./ConfirmDialogIsland").then((m) => m.ConfirmDialogIsland),
  },
  "confirm-host": {
    load: () => import("./ConfirmHostIsland").then((m) => m.ConfirmHostIsland),
  },
  "form-dialog": {
    load: () => import("./FormDialogIsland").then((m) => m.FormDialogIsland),
  },
  "toast-listener": {
    load: () => import("./ToastListenerIsland").then((m) => m.ToastListenerIsland),
  },
  "date-picker": {
    load: () => import("./DatePickerIsland").then((m) => m.DatePickerIsland),
  },
  // URL・トークン・大きな数値 ID・要素 id を含み得るものは JSON として解釈しない
  "copy-field": {
    load: () => import("./CopyFieldIsland").then((m) => m.CopyFieldIsland),
    rawAttributes: ["value"],
  },
  "file-drop-zone": {
    load: () => import("./FileDropZoneIsland").then((m) => m.FileDropZoneIsland),
    rawAttributes: ["target", "accept"],
  },
  tabs: {
    load: () => import("./TabsIsland").then((m) => m.TabsIsland),
  },
  disclosure: {
    load: () => import("./DisclosureIsland").then((m) => m.DisclosureIsland),
    rawAttributes: ["targetId"],
  },
  "field-visibility": {
    load: () => import("./FieldVisibilityIsland").then((m) => m.FieldVisibilityIsland),
  },
  rating: {
    load: () => import("./RatingIsland").then((m) => m.RatingIsland),
  },
};

/**
 * キット標準の Island を遅延読み込みで登録する。何度呼んでもよい。
 * アプリが同じ名前で登録したものは上書きしない。
 */
export function registerDefaultIslands(): void {
  registerDefaultIslandLoaders(defaultIslandDefinitions);
}
