/**
 * React Islands - マウント処理（副作用なし）
 *
 * import しただけでは何も起きません。`islands` エントリから import して、
 * アプリのエントリで好きな順番に呼べます。auto-mount はこれを呼んでいるだけです。
 *
 *   import { registerDefaultIslands, registerIslandComponents, startIslandAutoMount } from 'application-ui-kit/islands'
 *   registerIslandComponents({ 'my-widget': MyWidget })
 *   registerDefaultIslands()   // キット標準の Island も使う場合（遅延読み込み）
 *   startIslandAutoMount()
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { parseProps } from "./parse-props";
import {
  type IslandComponent,
  getIslandComponent,
  getIslandRawAttributes,
  getRegisteredIslandComponents,
  hasIslandComponent,
  loadIslandComponent,
} from "./registry";
import "./types";

function renderIsland(element: HTMLElement, componentName: string, Component: IslandComponent) {
  try {
    const props = parseProps(element, getIslandRawAttributes(componentName));
    const root = createRoot(element);
    element.dataset.reactMounted = "true";

    root.render(
      <StrictMode>
        <Component {...props} />
      </StrictMode>,
    );
  } catch (error) {
    console.error(`[React Islands] Failed to mount "${componentName}":`, error);
  }
}

/**
 * 1 つの要素へ React コンポーネントをマウントする。
 *
 * 読み込み済みのコンポーネントはその場で同期的にマウントする。
 * 遅延登録のものは `data-react-mounted="pending"` を付けてから読み込み、終わったらマウントする。
 * それまで要素にはサーバーが描いた中身がそのまま残る。読み込み中に要素が DOM から
 * 外れた（htmx のスワップ等）場合はマウントしない。
 *
 * 返り値の Promise はマウント（または失敗の記録）が終わると解決する。reject はしない。
 */
export function mountIsland(element: HTMLElement, componentName: string): Promise<void> {
  const Component = getIslandComponent(componentName);
  if (Component) {
    renderIsland(element, componentName, Component);
    return Promise.resolve();
  }

  if (!hasIslandComponent(componentName)) {
    console.error(
      `[React Islands] Component "${componentName}" not found in registry.`,
      `Available components: ${getRegisteredIslandComponents().join(", ") || "none"}`,
    );
    return Promise.resolve();
  }

  // 読み込み中に再走査されても二重に読み込み・マウントしないよう、先に印を付ける
  element.dataset.reactMounted = "pending";

  return loadIslandComponent(componentName).then(
    (Loaded) => {
      if (!Loaded || !element.isConnected) {
        delete element.dataset.reactMounted;
        return;
      }
      renderIsland(element, componentName, Loaded);
    },
    (error: unknown) => {
      delete element.dataset.reactMounted;
      console.error(`[React Islands] Failed to load "${componentName}":`, error);
    },
  );
}

/**
 * 範囲内（既定はページ全体）のまだマウントしていない Island をすべてマウントする。
 */
export function initializeIslands(root: ParentNode = document): void {
  const islands = root.querySelectorAll<HTMLElement>("[data-react]");

  islands.forEach((element) => {
    const componentName = element.dataset.react;

    if (!componentName) {
      console.warn("[React Islands] Found element with empty data-react");
      return;
    }

    if (element.dataset.reactMounted) {
      // htmx:afterSwap は document 全体を再スキャンするため、スワップ範囲外の
      // 既存 Island（例: body 直下の toast-listener）を毎回再マウントしてしまう。
      // createRoot() は同じコンテナに対して 1 回しか呼べないため、二重マウントを防ぐ。
      // 読み込み中（"pending"）のものも飛ばす。
      return;
    }

    void mountIsland(element, componentName);
  });
}

let autoMountStarted = false;

/**
 * 自動マウントを開始する。2 回目以降の呼び出しは何もしない。
 *
 * - DOM の準備ができたら initializeIslands() を呼ぶ。準備済みなら microtask で呼ぶ。
 *   同じモジュールの評価中（静的 import の直後）に登録した Island も最初の走査に間に合う。
 * - htmx がコンテンツをスワップしたら再走査する（htmx をこの後に読み込んでも効く）。
 * - 手動マウント用に `window.ReactIslands` を登録する。
 */
export function startIslandAutoMount(): void {
  if (autoMountStarted) return;
  autoMountStarted = true;

  const initialize = () => initializeIslands();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  } else {
    queueMicrotask(initialize);
  }

  // htmx のイベントは bubbles する。document で受ければ htmx の読み込み順に左右されない
  document.addEventListener("htmx:afterSwap", initialize);

  window.ReactIslands = {
    mount: mountIsland,
    initialize: initializeIslands,
  };
}
