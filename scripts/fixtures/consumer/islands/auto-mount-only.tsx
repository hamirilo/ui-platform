/* バンドル検査用（check-bundle.mjs）。auto-mount だけを使う利用側を模す。
 * キット標準の Island は遅延読み込みなので、初期ロードに DatePicker 等の依存が入らない
 * （decisions/adr-0008）。 */
import "@hamirilo/application-ui-kit/islands/auto-mount";
