import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Base UI の Checkbox.Root / RadioGroupItem は <button> ではなく
 * <span role="..."> を描画する。display を明示しない cn-* クラスは
 * inline のままになり、size-* が無視されて border だけの線に潰れる
 * （ラベル付きは flex 子として blockify されるため偶然直ってしまい、
 * typecheck / test / build では気づけない）。ここで宣言を固定する。
 */
const css = readFileSync(join(process.cwd(), "tokens/components.css"), "utf-8");
const tokensCss = readFileSync(join(process.cwd(), "tokens/tokens.css"), "utf-8");
const classesCss = readFileSync(join(process.cwd(), "tokens/classes.css"), "utf-8");
const themeCss = readFileSync(join(process.cwd(), "tokens/theme.css"), "utf-8");

function ruleBody(selector: string, source: string = css): string {
  const start = source.indexOf(`${selector} {`);
  expect(start, `${selector} が見つからない`).toBeGreaterThan(-1);
  return source.slice(start, source.indexOf("}", start));
}

describe("tokens/theme.css（入口）", () => {
  /* styles.css は theme.css を指す。分割した 3 ファイルをすべて読み込んでいないと、
   * 利用側で Token だけ・クラスだけが欠ける。 */
  it.each(["./tokens.css", "./components.css", "./classes.css"])(
    "%s を @import している",
    (file) => {
      expect(themeCss).toContain(`@import "${file}";`);
    },
  );

  it("@source でパッケージ内の .tsx を走査させている", () => {
    expect(themeCss).toMatch(/@source "\.\.\/components";/);
  });
});

describe("tokens/tokens.css", () => {
  /* Base UI は値なしの `data-selected=""` を書き、react-day-picker は
   * `data-selected="true"` を書く。`="true"` だけを見ていると Base UI の
   * Select / Combobox の選択状態に一切当たらない。 */
  it("data-selected バリアントは値なしの属性にも当たる", () => {
    const start = tokensCss.indexOf("@custom-variant data-selected");
    expect(start, "@custom-variant data-selected が見つからない").toBeGreaterThan(-1);
    const body = tokensCss.slice(start, tokensCss.indexOf("@slot", start));
    expect(body).toMatch(/\[data-selected\]:not\(\[data-selected="false"\]\)/);
  });

  const STATUS_TONES = ["new", "active", "done", "warning", "danger", "pending", "neutral"];

  it.each([
    "--color-disabled",
    "--color-disabled-foreground",
    "--color-disabled-border",
    ...STATUS_TONES.map((tone) => `--color-status-${tone}`),
    ...STATUS_TONES.map((tone) => `--color-status-${tone}-foreground`),
  ])("%s が light / dark の両方で定義されている", (token) => {
    // @theme（light）と .dark で 1 回ずつ。値の重複定義は分裂の元なのでここで固定する。
    const hits = tokensCss.match(new RegExp(`^\\s*${token}:`, "gm")) ?? [];
    expect(hits).toHaveLength(2);
  });
});

describe("tokens/classes.css（テンプレート用クラスの公開契約）", () => {
  /* 利用側が `.dark` でも `[data-theme]` でも --color-* を差し替えれば暗くなるように、
   * テンプレート用クラスは raw palette と dark: ユーティリティを持たない。 */
  it("raw palette（bg-red-50 等）を使わない", () => {
    const rawPalette =
      /\b(bg|text|border|ring|from|to)-(red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|slate|gray|zinc|neutral|stone)-\d{2,3}\b/;
    expect(classesCss).not.toMatch(rawPalette);
  });

  it("dark: ユーティリティを使わない（Token の差し替えで暗くする）", () => {
    expect(classesCss).not.toMatch(/\bdark:/);
  });

  it.each([
    ".alert-danger",
    ".badge-done",
    ".stat-delta-negative",
    ".page-header-title",
    ".breadcrumbs",
  ])("%s は Token（var(--color-*)）で色を指定する", (selector) => {
    expect(ruleBody(selector, classesCss)).toMatch(/var\(--color-/);
  });

  /* React 側の Badge tone と同じ Token を引く。片方だけ変えると見た目が割れる。 */
  it.each(["new", "active", "done", "warning", "danger", "pending", "neutral"])(
    ".badge-%s は --color-status-%s を使う",
    (tone) => {
      const body = ruleBody(`.badge-${tone}`, classesCss);
      expect(body).toContain(`var(--color-status-${tone})`);
      expect(body).toContain(`var(--color-status-${tone}-foreground)`);
    },
  );

  it("input.switch は checked で primary、ノブは ::before で描く", () => {
    const body = ruleBody('input[type="checkbox"].switch', classesCss);
    expect(body).toMatch(/appearance-none/);
    const start = classesCss.indexOf('input[type="checkbox"].switch {');
    const block = classesCss.slice(
      start,
      classesCss.indexOf('input[type="checkbox"].switch-sm', start),
    );
    expect(block).toMatch(/&:checked \{\s*background-color:\s*var\(--color-primary\)/);
    expect(block).toMatch(/::before/);
  });

  /* field-visibility Island が評価するまで data-visible-when の塊を描かない。 */
  it("data-visible-when の FOUC 抑止ルールを持つ", () => {
    expect(classesCss).toMatch(/\[data-visible-when\]:not\(\[data-visible-when-ready\]\)/);
  });
});

describe("tokens/components.css", () => {
  it("cn-checkbox は display を明示する", () => {
    expect(ruleBody(".cn-checkbox")).toMatch(/\b(inline-flex|flex|inline-grid|grid)\b/);
  });

  it("cn-radio-group-item は display を明示する", () => {
    expect(ruleBody(".cn-radio-group-item")).toMatch(/\b(inline-flex|flex|inline-grid|grid)\b/);
  });

  /* 素の `rounded` は @theme の --radius（0.5rem）を引く。16px の箱では
   * 半径 8px = 円になり、チェックボックスがラジオボタンと区別できない。
   * rounded-sm（4px）でも箱の 1/4 が角丸になって丸く見えたため 2px にしてある。 */
  it("cn-checkbox は角丸を rounded-xs で固定する（円に見せない）", () => {
    const body = ruleBody(".cn-checkbox");
    expect(body).toMatch(/\brounded-xs\b/);
    expect(body).not.toMatch(/\brounded(?![-\w])/);
    expect(body).not.toMatch(/\brounded-sm\b/);
    expect(body).not.toMatch(/\brounded-full\b/);
  });

  it("cn-radio-group-item は丸のままにする（チェックボックスと形で区別する）", () => {
    expect(ruleBody(".cn-radio-group-item")).toMatch(/\brounded-full\b/);
  });

  /* 無効は彩度を落として示す。opacity だけで落とすと primary が淡い水色に
   * なり「押せる薄い色のボタン」に読める。 */
  describe("無効状態は無彩色にする", () => {
    it.each([".cn-button", ".cn-checkbox", ".cn-radio-group-item"])(
      "%s は無効時に opacity で色を薄めない",
      (selector) => {
        expect(ruleBody(selector)).not.toMatch(/disabled:opacity-/);
      },
    );

    it("cn-button の無効時は disabled トークンへ差し替える", () => {
      // 面を持つバリアント向けの規則。セレクタが複数行なので前方一致で探す。
      const start = css.indexOf('.cn-button:disabled:not([aria-busy="true"]');
      expect(start, "cn-button の無効スタイルが見つからない").toBeGreaterThan(-1);
      const body = css.slice(start, css.indexOf("}", start));
      expect(body).toMatch(/background-color:\s*var\(--color-disabled\)/);
      expect(body).toMatch(/color:\s*var\(--color-disabled-foreground\)/);
      expect(body).toMatch(/border-color:\s*var\(--color-disabled-border\)/);
    });

    /* loading は「処理中」で「使えない」ではない。アクションの色を保つ。 */
    it("cn-button の無効スタイルは loading（aria-busy）を除外する", () => {
      expect(css).toMatch(/:not\(\[aria-busy="true"\]/);
    });
  });

  /* 選択は左のチェック用の溝ではなく面と文字で示す。未選択のリストでは
   * 溝が最初から最後まで空になり、文字だけが右へずれて見えた。 */
  describe("Select / Combobox の選択状態", () => {
    it.each([".cn-select-item", ".cn-combobox-item"])(
      "%s はチェック用の溝を左に空けない（ラベルの頭を揃える）",
      (selector) => {
        const body = ruleBody(selector);
        expect(body).not.toMatch(/\bpl-8\b/);
        expect(body).toMatch(/\bpl-2\b/);
      },
    );

    it.each([".cn-select-item", ".cn-combobox-item"])("%s は選択を面と文字で示す", (selector) => {
      const body = ruleBody(`${selector}[data-selected]:not([data-selected="false"])`);
      expect(body).toMatch(/var\(--color-primary\)/);
      expect(body).toMatch(/font-weight/);
    });

    /* 行の流れに入れる（ml-auto）と、選択中の行だけ末尾のバッジがチェックの分
     * 左へずれてバッジの列が揃わない。絶対配置のまま右へ回す。 */
    it.each([".cn-select-item-indicator", ".cn-combobox-item-indicator"])(
      "%s は右端に絶対配置する",
      (selector) => {
        const body = ruleBody(selector);
        expect(body).toMatch(/\babsolute\b/);
        expect(body).toMatch(/\bright-2\b/);
        expect(body).not.toMatch(/\bleft-2\b/);
      },
    );
  });

  /* テンプレート用クラス（classes.css）と 1:1 に揃える契約。
   * 片方だけに部品を増やすと、React 画面とテンプレート画面で見た目が割れる。 */
  describe("classes.css との 1:1 対応", () => {
    it.each([
      [".cn-alert", ".alert"],
      [".cn-alert-tone-danger", ".alert-danger"],
      [".cn-breadcrumb-page", '.breadcrumbs [aria-current="page"]'],
      [".cn-page-header-title", ".page-header-title"],
      [".cn-stat-value", ".stat-value"],
      [".cn-switch", 'input[type="checkbox"].switch'],
      [".cn-pagination-summary", ".pagination-summary"],
      [".cn-description-list", ".description-list"],
      [".cn-steps", ".steps"],
      [".cn-step-marker", ".step-marker"],
      [".cn-table-container-sticky", ".data-table-scroll"],
    ])("%s（React）と %s（テンプレート）の両方が定義されている", (cnSelector, templateSelector) => {
      expect(css.includes(`${cnSelector} {`), `${cnSelector} が無い`).toBe(true);
      expect(classesCss.includes(`${templateSelector} {`), `${templateSelector} が無い`).toBe(true);
    });
  });

  /* 横の余白は「外周 12px / 要素間 8px」の 2 値。持ち主が増えると 4 箇所がまたずれる。 */
  describe("InputGroup の余白", () => {
    it(".cn-input-group が要素間の gap を持つ（addon の gap は兄弟の input に効かない）", () => {
      expect(ruleBody(".cn-input-group")).toMatch(/\bgap-x-2\b/);
    });

    it.each([".cn-input-group-addon-align-inline-start", ".cn-input-group-addon-align-inline-end"])(
      "%s は負のマージンで addon の箱を枠の外へ出さない",
      (selector) => {
        expect(ruleBody(selector)).not.toMatch(/m[lr]-\[-|-m[lr]-/);
      },
    );

    it.each(["start", "end"])(
      "addon がある側（inline-%s）は input の padding を 0 にする",
      (side) => {
        const body = ruleBody(
          `.cn-input-group:has(> .cn-input-group-addon-align-inline-${side}) > .cn-input-group-input`,
        );
        expect(body).toMatch(new RegExp(`padding-inline-${side}:\\s*0;`));
      },
    );
  });

  describe("Textarea の余白", () => {
    it("縦の padding は左右と同じ値から half-leading を引く（Input の py を流用しない）", () => {
      const body = ruleBody(".cn-textarea");
      expect(body).not.toMatch(/\bpy-1\.5\b/);
      expect(body).toMatch(
        /padding-block:\s*calc\(var\(--spacing\) \* 3\.5 - \(1lh - 1em\) \/ 2\)/,
      );
    });
  });
});
