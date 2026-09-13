/**
 * React Islands - 自動マウントエントリ（副作用あり）
 *
 * `data-react="component-name"` を持つ要素をすべて見つけ、レジストリの
 * React コンポーネントをマウントします。アプリの Vite エントリで
 * import するだけで動きます:
 *
 *   // islands/main.ts
 *   import 'application-ui-kit/islands/auto-mount'
 *   import { registerIslandComponents } from 'application-ui-kit/islands'
 *   registerIslandComponents({ 'my-widget': MyWidget })
 *
 * Django テンプレートでの使い方:
 *   1. エントリを読み込む: {% vite_asset 'main' %}
 *   2. マウントポイントを置く: <div data-react="component-name" data-props='{"key": "value"}'></div>
 *
 * props の渡し方（parse-props.ts 参照）:
 *   - data-props='{"key": "value"}'（JSON 文字列）
 *   - 個別の data-* 属性（例: data-title="Hello"）
 *
 * このパッケージ標準の Island（default-islands.ts）は **遅延読み込みで** 自動登録されます
 * （decisions/adr-0001 / adr-0007 / adr-0008）。ページに現れた Island のチャンクだけを読み込み、
 * それまでマウント先にはサーバーが描いた中身が残ります。
 *
 * <important>
 * - 最初の走査は、この import を含むモジュールの評価が終わった後（microtask）に走ります。
 *   同じエントリの中で同期的に登録すれば、import より後に書いても間に合います。
 *   `await` を挟んでから登録する場合は、`islands` エントリの `startIslandAutoMount()` を
 *   登録の後で自分で呼んでください（このエントリは使わない）。
 * - アプリが同じ名前（例: `date-picker`）を登録していれば、順番に関係なくアプリの登録が使われます。
 * </important>
 */

import { registerDefaultIslands } from "./default-islands";
import { startIslandAutoMount } from "./mount";

registerDefaultIslands();
startIslandAutoMount();

export { initializeIslands, mountIsland } from "./mount";
