/**
 * React Island レジストリ
 *
 * `data-react="component-name"` と React コンポーネントの対応表です。
 *
 * 登録は 2 層に分かれています。
 *
 *   アプリの登録   registerIslandComponents() / registerIslandLoaders()
 *   キット標準     registerDefaultIslands()（default-islands.ts。auto-mount が呼ぶ）
 *
 * 同じ名前が両方にあれば、登録した順番に関係なく **アプリの登録が勝ちます**。
 * アプリが自前の `date-picker` を持っていても、auto-mount の読み込み順で
 * キット標準に上書きされることはありません（decisions/adr-0008）。
 *
 * <important>
 * アプリの層の中では **後から登録したものが勝ちます**。registerIslandComponents() と
 * registerIslandLoaders() は同じ表を共有しており、同じ名前を登録すると、関数の種類に関係なく
 * 前の登録（読み込み済みのコンポーネントを含む）を黙って置き換えます。警告は出しません。
 * 1 つの名前はどちらか一方で 1 回だけ登録してください。
 * </important>
 *
 * 業務ドメイン固有の UI はこのパッケージには追加せず、アプリ側で登録します。
 */

import type { ComponentType } from "react";

export type IslandComponent = ComponentType<any>;

/**
 * 初回マウント時に呼ばれ、コンポーネントを解決する関数。
 * モジュールではなくコンポーネント自体を返す（`.then((m) => m.MyWidget)`）。
 */
export type IslandLoader = () => Promise<IslandComponent>;

interface IslandEntry {
  component?: IslandComponent;
  load?: IslandLoader;
  pending?: Promise<IslandComponent>;
  /** JSON として解釈せず、文字列のまま渡す data 属性（parseProps の第 2 引数） */
  rawAttributes?: readonly string[];
}

/** キット標準の Island を登録するときの 1 件分 */
export interface DefaultIslandDefinition {
  load: IslandLoader;
  rawAttributes?: readonly string[];
}

const appRegistry = new Map<string, IslandEntry>();
const defaultRegistry = new Map<string, IslandEntry>();

function resolveEntry(name: string): IslandEntry | undefined {
  return appRegistry.get(name) ?? defaultRegistry.get(name);
}

/**
 * Island コンポーネントを登録する。同じ名前のキット標準より優先される。
 *
 * アプリの登録どうしは後勝ち。先に registerIslandComponents() / registerIslandLoaders() で
 * 同じ名前を登録していれば、ここで置き換わる。
 *
 * @example
 * ```ts
 * import { registerIslandComponents } from 'application-ui-kit/islands'
 * registerIslandComponents({ 'my-widget': MyWidget })
 * ```
 */
export function registerIslandComponents(components: Record<string, IslandComponent>): void {
  for (const [name, component] of Object.entries(components)) {
    appRegistry.set(name, { component });
  }
}

/**
 * 初回マウント時に読み込む Island を登録する。同じ名前のキット標準より優先される。
 * 読み込みが終わるまで、マウント先の要素にはサーバーが描いた中身がそのまま残る。
 *
 * アプリの登録どうしは後勝ち。先に registerIslandComponents() / registerIslandLoaders() で
 * 同じ名前を登録していれば、ここで置き換わる（読み込み済みでも読み込み前の状態に戻る）。
 *
 * @example
 * ```ts
 * import { registerIslandLoaders } from 'application-ui-kit/islands'
 * registerIslandLoaders({
 *   'weight-settings': () => import('./WeightSettingsIsland').then((m) => m.WeightSettingsIsland),
 * })
 * ```
 */
export function registerIslandLoaders(loaders: Record<string, IslandLoader>): void {
  for (const [name, load] of Object.entries(loaders)) {
    appRegistry.set(name, { load });
  }
}

/**
 * キット標準の Island を登録する（default-islands.ts 専用）。
 * アプリの登録より優先度が低く、アプリの登録を上書きしない。
 */
export function registerDefaultIslandLoaders(
  definitions: Record<string, DefaultIslandDefinition>,
): void {
  for (const [name, { load, rawAttributes }] of Object.entries(definitions)) {
    defaultRegistry.set(name, { load, rawAttributes });
  }
}

/**
 * data-react 属性の値からコンポーネントを取得する。
 * 遅延登録で、まだ読み込まれていないものは null を返す（loadIslandComponent を使う）。
 */
export function getIslandComponent(name: string): IslandComponent | null {
  return resolveEntry(name)?.component ?? null;
}

/**
 * data-react 属性の値からコンポーネントを解決する。遅延登録なら読み込む。
 * 同じ名前を並行して解決しても、loader は 1 回しか呼ばない。未登録なら null。
 */
export function loadIslandComponent(name: string): Promise<IslandComponent | null> {
  const entry = resolveEntry(name);
  if (!entry) return Promise.resolve(null);
  if (entry.component) return Promise.resolve(entry.component);
  if (!entry.load) return Promise.resolve(null);

  if (!entry.pending) {
    entry.pending = entry.load().then(
      (component) => {
        entry.component = component;
        return component;
      },
      (error: unknown) => {
        // 一時的なネットワークエラーなら、次の走査で読み直せるようにする
        entry.pending = undefined;
        throw error;
      },
    );
  }
  return entry.pending;
}

/** 登録済み（遅延登録を含む）かどうか */
export function hasIslandComponent(name: string): boolean {
  return resolveEntry(name) !== undefined;
}

/** 文字列のまま渡す data 属性。キット標準の Island だけが持つ */
export function getIslandRawAttributes(name: string): readonly string[] {
  return resolveEntry(name)?.rawAttributes ?? [];
}

/** 登録済みコンポーネント名の一覧（遅延登録・キット標準を含む） */
export function getRegisteredIslandComponents(): string[] {
  return Array.from(new Set([...appRegistry.keys(), ...defaultRegistry.keys()]));
}
