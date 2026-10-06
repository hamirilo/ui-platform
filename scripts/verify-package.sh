#!/usr/bin/env bash
# 配布物が「利用側プロジェクトで実際にビルドできる」ことを検証する。
#
# npm の依存巻き上げ (hoisting) は「宣言していない依存が import できる」ことを
# 隠してしまう。pnpm や yarn PnP、`npm install --install-strategy=nested` では
# 巻き上げが起こらないため、phantom dependency（import しているが package.json に
# 宣言していない依存）がビルド時に露見する。
# CI の `bun run build` はこのリポジトリの node_modules を使うので、
# この種の宣言漏れを検出できない。
#
# 一部だけを import した利用側で、使わない重い依存が初期ロードに入らないことも確認する
# （NavItem だけなら framer-motion なし、auto-mount だけなら DatePicker の依存なし。decisions/adr-0008）。
#
# 併せて、Tailwind の CSS が利用側へ届くことも確認する。
#   - tokens/theme.css の @import 連鎖（motion / fonts / scale / tokens / components / classes）
#   - theme.css の `@source "../components"`（パッケージ内の .tsx のクラス名）
#
# 使い方:
#   ./scripts/verify-package.sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
KIT_DIR="$(dirname "$SCRIPT_DIR")"
CONSUMER_DIR="$SCRIPT_DIR/fixtures/consumer"

# fixture の import 文に書いてあるパッケージ名。
# フォークでスコープを変えて publish する場合に備え、実際の name へ置き換える。
FIXTURE_PKG_NAME="@hamirilo/application-ui-kit"
PKG_NAME="$(node -p "require('$KIT_DIR/package.json').name")"

WORKDIR="$(mktemp -d)"
TARBALL_PATH=""

cleanup() {
    rm -rf "$WORKDIR"
    if [ -n "$TARBALL_PATH" ]; then
        rm -f "$TARBALL_PATH"
    fi
}
trap cleanup EXIT

echo "▶ 配布物をビルド (exports が dist を指すため pack の前に必要)"
bun run build

echo "▶ $PKG_NAME を tarball 化"
TARBALL="$(cd "$KIT_DIR" && npm pack --silent)"
TARBALL_PATH="$KIT_DIR/$TARBALL"

echo "▶ 利用側 fixture を検証用ディレクトリへコピー: $WORKDIR"
cp -R "$CONSUMER_DIR"/. "$WORKDIR"/

if [ "$PKG_NAME" != "$FIXTURE_PKG_NAME" ]; then
    echo "▶ fixture のパッケージ名を $PKG_NAME へ置き換え"
    grep -rl -- "$FIXTURE_PKG_NAME" "$WORKDIR" | while read -r file; do
        # スコープの @ と / はそのまま使えるよう、区切り文字を | にする
        sed -i "s|$FIXTURE_PKG_NAME|$PKG_NAME|g" "$file"
    done
fi

python3 - "$WORKDIR/package.json" "$PKG_NAME" "$TARBALL_PATH" <<'PY'
import json
import sys

pkg_path, pkg_name, tarball_path = sys.argv[1], sys.argv[2], sys.argv[3]
with open(pkg_path) as f:
    pkg = json.load(f)
pkg["dependencies"][pkg_name] = f"file:{tarball_path}"
with open(pkg_path, "w") as f:
    json.dump(pkg, f, indent=2)
PY

cd "$WORKDIR"

echo "▶ 非巻き上げレイアウトで npm install (phantom dependency を露見させる)"
npm install --install-strategy=nested --no-audit --no-fund

echo "▶ npm run build:islands (dist の JS と、宣言済み依存だけで解決できるか)"
npm run build:islands

echo "▶ npm run check:bundle (一部だけ import したとき、使わない重い依存が初期ロードに入らないか)"
npm run check:bundle

echo "▶ npm run build:css (theme.css の @import と @source が届くか)"
npm run build:css

OUTPUT_CSS="backend/static/css/output.css"

check() {
    local label="$1" pattern="$2"
    if grep -q -- "$pattern" "$OUTPUT_CSS"; then
        echo "✅ $label"
    else
        echo "❌ $label"
        exit 1
    fi
}

echo "▶ 出力 CSS の内容を確認"
check "classes.css のテンプレート用クラスが届いている (btn-primary)" "btn-primary"
check "classes.css の新しいテンプレート用クラスが届いている (alert-danger)" "alert-danger"
check "classes.css の tone クラスが届いている (badge-done)" "badge-done"
check "classes.css のタブが届いている (tab-active)" "tab-active"
check "classes.css のページ送り・手順・定義リストが届いている (pagination-summary / step-marker / description-list)" "pagination-summary"
check "classes.css の手順が届いている (step-marker)" "step-marker"
check "classes.css の定義リストが届いている (description-list)" "description-list"
check "classes.css の絞り込みバーが届いている (filter-bar)" "filter-bar"
check "classes.css の星の評価が届いている (rating-star)" "rating-star"
check "classes.css の空状態が届いている (empty-title)" "empty-title"
check "classes.css の一覧の 1 行が届いている (item-group)" "item-group"
check "tokens.css のステータス Token が届いている (--color-status-new)" "\-\-color-status-new"
check "components.css が届いている (cn-button)" "cn-button"
check "motion.css が届いている (--motion-duration-base)" "\-\-motion-duration-base"
check "カラートークンが届いている (var(--color-card))" "var(--color-card)"
# パッケージ内の .tsx でしか使っていないユーティリティ。
# theme.css の `@source "../components"` が効いていないと出力されない。
check "@source でパッケージの .tsx が走査されている (animate-spin)" "animate-spin"

echo ""
echo "✅ $PKG_NAME の配布検証に成功しました"
