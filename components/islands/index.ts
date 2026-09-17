/**
 * Django 連携 Island - 公開エントリ（副作用なし）
 *
 * Django テンプレート + htmx のプロジェクトが、テンプレート側の
 * `data-react="..."` 要素へ React コンポーネントをマウントするための一式です。
 * （判断基準: ai-dev-standards ADR-0002 / このリポジトリの decisions/adr-0001・adr-0008）
 *
 * 通常は副作用込みの auto-mount をアプリのエントリで import するだけで使えます。
 * キット標準の Island は遅延読み込みで登録され、アプリが同じ名前で登録したものは上書きしません:
 *
 *   // islands/main.ts（アプリの Vite エントリ）
 *   import 'application-ui-kit/islands/auto-mount'
 *   import { registerIslandComponents } from 'application-ui-kit/islands'
 *   registerIslandComponents({ 'my-widget': MyWidget })
 *
 * 開始のタイミングを自分で決めたい場合（登録の前に await がある等）は、
 * auto-mount を使わずにこのエントリの関数を呼びます:
 *
 *   import {
 *     registerDefaultIslands,
 *     registerIslandComponents,
 *     registerIslandLoaders,
 *     startIslandAutoMount,
 *   } from 'application-ui-kit/islands'
 *   registerIslandComponents({ 'my-widget': MyWidget })
 *   registerIslandLoaders({ 'heavy-widget': () => import('./HeavyWidget').then((m) => m.HeavyWidget) })
 *   registerDefaultIslands()   // キット標準の Island も使う場合
 *   startIslandAutoMount()
 *
 * <important>
 * このエントリを import しただけでは何もマウントされません（副作用なし）。
 * マウントを始めるのは auto-mount の import か startIslandAutoMount() の呼び出しです。
 * </important>
 */

export { ConfirmDialogIsland } from "./ConfirmDialogIsland";
export type { ConfirmDialogIslandProps } from "./ConfirmDialogIsland";

export { FormDialogIsland } from "./FormDialogIsland";
export type { FormDialogIslandProps } from "./FormDialogIsland";

export { ToastListenerIsland } from "./ToastListenerIsland";
export type { ToastListenerIslandProps } from "./ToastListenerIsland";

export { DatePickerIsland } from "./DatePickerIsland";
export type { DatePickerIslandProps } from "./DatePickerIsland";

export { CopyFieldIsland } from "./CopyFieldIsland";
export type { CopyFieldIslandProps } from "./CopyFieldIsland";

export { ConfirmHostIsland } from "./ConfirmHostIsland";
export type { ConfirmHostIslandProps } from "./ConfirmHostIsland";

export { FileDropZoneIsland } from "./FileDropZoneIsland";
export type { FileDropZoneIslandProps } from "./FileDropZoneIsland";

export { TabsIsland } from "./TabsIsland";
export type { TabsIslandProps, TabsIslandLink } from "./TabsIsland";

export { DisclosureIsland } from "./DisclosureIsland";
export type { DisclosureIslandProps } from "./DisclosureIsland";

export { FieldVisibilityIsland } from "./FieldVisibilityIsland";

export { RatingIsland } from "./RatingIsland";
export type { RatingIslandProps } from "./RatingIsland";

export { runConfirmedRequest } from "../../lib/confirm-request";
export type { ConfirmRequestSpec, HttpMethod } from "../../lib/confirm-request";

export {
  getIslandComponent,
  getRegisteredIslandComponents,
  loadIslandComponent,
  registerIslandComponents,
  registerIslandLoaders,
} from "./registry";
export type { IslandComponent, IslandLoader } from "./registry";

export { initializeIslands, mountIsland, startIslandAutoMount } from "./mount";

export { registerDefaultIslands } from "./default-islands";

export { parseProps } from "./parse-props";

export { DEFAULT_CSRF_COOKIE_NAME, getCsrfHeaders, getCsrfToken } from "../../lib/csrf";

export type {
  ApplicationToastDetail,
  ConfirmModalDetail,
  HtmxApi,
  HtmxConfirmDetail,
} from "./types";
