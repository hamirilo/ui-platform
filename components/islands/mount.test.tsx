import { act } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/* レジストリと自動マウントの開始フラグはモジュール単位の状態なので、
 * テストごとにモジュールを読み直して前のテストの登録を持ち越さない。 */
async function loadIslands() {
  vi.resetModules();
  const [registry, mount, defaults] = await Promise.all([
    import("./registry"),
    import("./mount"),
    import("./default-islands"),
  ]);
  return { ...registry, ...mount, ...defaults };
}

function Hello({ name }: { name?: string }) {
  return <p>hello {name}</p>;
}

function Other() {
  return <p>other</p>;
}

function addIsland(name: string, html = "", attrs: Record<string, string> = {}) {
  const el = document.createElement("div");
  el.dataset.react = name;
  for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, value);
  el.innerHTML = html;
  document.body.appendChild(el);
  return el;
}

/** 解決を外から制御できる loader */
function deferredLoader<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  const load = vi.fn(() => promise);
  return { load, resolve, reject };
}

describe("island registry の優先順位", () => {
  it("アプリの登録はキット標準より優先され、登録順に左右されない", async () => {
    const islands = await loadIslands();

    // アプリが先に登録し、後からキット標準を登録しても上書きされない（auto-mount の順）
    islands.registerIslandComponents({ "date-picker": Hello });
    islands.registerDefaultIslands();
    expect(islands.getIslandComponent("date-picker")).toBe(Hello);

    // キット標準が先でも、後からのアプリの登録が勝つ
    islands.registerIslandComponents({ tabs: Other });
    expect(islands.getIslandComponent("tabs")).toBe(Other);
  });

  it("アプリの登録どうしは、関数の種類に関係なく後から登録したものが勝つ", async () => {
    const islands = await loadIslands();

    // コンポーネント → loader: 読み込み前の状態に戻る
    islands.registerIslandComponents({ widget: Hello });
    islands.registerIslandLoaders({ widget: () => Promise.resolve(Other) });
    expect(islands.getIslandComponent("widget")).toBeNull();
    await expect(islands.loadIslandComponent("widget")).resolves.toBe(Other);

    // loader（読み込み済み）→ コンポーネント
    islands.registerIslandComponents({ widget: Hello });
    expect(islands.getIslandComponent("widget")).toBe(Hello);

    // 同じ関数どうしも後勝ち
    islands.registerIslandComponents({ widget: Other });
    expect(islands.getIslandComponent("widget")).toBe(Other);
  });

  it("キット標準は遅延登録で、読み込むまで getIslandComponent は null を返す", async () => {
    const islands = await loadIslands();
    islands.registerDefaultIslands();

    expect(islands.getRegisteredIslandComponents()).toContain("date-picker");
    expect(islands.getIslandComponent("date-picker")).toBeNull();

    const { DatePickerIsland } = await import("./DatePickerIsland");
    await expect(islands.loadIslandComponent("date-picker")).resolves.toBe(DatePickerIsland);
    expect(islands.getIslandComponent("date-picker")).toBe(DatePickerIsland);
  });

  it("キット標準の loader はすべて islands エントリの同名 export を解決する", async () => {
    const islands = await loadIslands();
    const publicApi = (await import("./index")) as Record<string, unknown>;
    islands.registerDefaultIslands();

    const names = Object.keys(islands.defaultIslandDefinitions);
    expect(names).toHaveLength(10);
    for (const name of names) {
      const component = await islands.loadIslandComponent(name);
      const exportName = `${name.replace(/(^|-)(\w)/g, (_, __, c: string) => c.toUpperCase())}Island`;
      expect(component, name).toBe(publicApi[exportName]);
    }
  });

  it("未登録の名前は null に解決する", async () => {
    const islands = await loadIslands();
    await expect(islands.loadIslandComponent("unknown")).resolves.toBeNull();
    expect(islands.hasIslandComponent("unknown")).toBe(false);
  });
});

describe("mountIsland", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("同期登録のコンポーネントはその場でマウントし、data-* を props にする", async () => {
    const islands = await loadIslands();
    islands.registerIslandComponents({ hello: Hello });
    const el = addIsland("hello", "", { "data-name": "kit" });

    act(() => {
      void islands.mountIsland(el, "hello");
    });

    expect(el.dataset.reactMounted).toBe("true");
    expect(el.textContent).toBe("hello kit");
  });

  it("遅延登録は読み込み完了までサーバーが描いた中身を残し、loader は 1 回だけ呼ぶ", async () => {
    const islands = await loadIslands();
    const loader = deferredLoader<typeof Hello>();
    islands.registerIslandLoaders({ hello: loader.load });
    const el = addIsland("hello", "<span>server</span>");

    act(() => {
      islands.initializeIslands();
      // htmx:afterSwap 等で読み込み中に再走査されても二重に読まない
      islands.initializeIslands();
    });

    expect(loader.load).toHaveBeenCalledTimes(1);
    expect(el.dataset.reactMounted).toBe("pending");
    expect(el.innerHTML).toBe("<span>server</span>");

    await act(async () => {
      loader.resolve(Hello);
    });

    expect(el.dataset.reactMounted).toBe("true");
    expect(el.textContent).toBe("hello ");
  });

  it("読み込み中に DOM から外れた要素はマウントしない", async () => {
    const islands = await loadIslands();
    const loader = deferredLoader<typeof Hello>();
    islands.registerIslandLoaders({ hello: loader.load });
    const el = addIsland("hello", "<span>server</span>");

    const mounted = islands.mountIsland(el, "hello");
    el.remove();
    await act(async () => {
      loader.resolve(Hello);
      await mounted;
    });

    expect(el.dataset.reactMounted).toBeUndefined();
    expect(el.innerHTML).toBe("<span>server</span>");
  });

  it("読み込みに失敗したら印を外してエラーを出し、次の走査で読み直せる", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const islands = await loadIslands();
    const load = vi
      .fn<() => Promise<typeof Hello>>()
      .mockRejectedValueOnce(new Error("network"))
      .mockResolvedValueOnce(Hello);
    islands.registerIslandLoaders({ hello: load });
    const el = addIsland("hello", "<span>server</span>");

    await act(async () => {
      await islands.mountIsland(el, "hello");
    });
    expect(el.dataset.reactMounted).toBeUndefined();
    expect(error).toHaveBeenCalledWith(
      '[React Islands] Failed to load "hello":',
      expect.any(Error),
    );

    await act(async () => {
      await islands.mountIsland(el, "hello");
    });
    expect(load).toHaveBeenCalledTimes(2);
    expect(el.textContent).toBe("hello ");
  });

  it("未登録の名前はエラーを出してマウントしない", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const islands = await loadIslands();
    const el = addIsland("missing", "<span>server</span>");

    await islands.mountIsland(el, "missing");

    expect(error).toHaveBeenCalledTimes(1);
    expect(el.dataset.reactMounted).toBeUndefined();
    expect(el.innerHTML).toBe("<span>server</span>");
  });

  it("キット標準の rawAttributes を使い、アプリが上書きした Island には使わない", async () => {
    const islands = await loadIslands();
    let received: unknown;
    const Capture = (props: { value?: unknown }) => {
      received = props.value;
      return null;
    };
    islands.registerDefaultIslands();
    expect(islands.getIslandRawAttributes("copy-field")).toEqual(["value"]);

    islands.registerIslandComponents({ "copy-field": Capture });
    const el = addIsland("copy-field", "", { "data-value": "12345678901234567890" });
    act(() => {
      void islands.mountIsland(el, "copy-field");
    });
    // アプリの Island は通常どおり JSON として解釈される
    expect(typeof received).toBe("number");
  });
});

describe("startIslandAutoMount", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  afterEach(() => {
    window.ReactIslands = undefined;
  });

  it("最初の走査を microtask まで遅らせ、呼び出し直後に同期登録した Island もマウントする", async () => {
    const islands = await loadIslands();
    const el = addIsland("hello");

    islands.startIslandAutoMount();
    // `import 'auto-mount'` の後に書いた registerIslandComponents() と同じ状況
    islands.registerIslandComponents({ hello: Hello });
    expect(el.dataset.reactMounted).toBeUndefined();

    await act(async () => {
      await Promise.resolve();
    });
    expect(el.textContent).toBe("hello ");
    expect(window.ReactIslands?.mount).toBe(islands.mountIsland);
  });

  it("htmx:afterSwap で追加された Island をマウントし、2 回目の開始は何もしない", async () => {
    const islands = await loadIslands();
    islands.registerIslandComponents({ hello: Hello });
    islands.startIslandAutoMount();
    islands.startIslandAutoMount();
    await act(async () => {
      await Promise.resolve();
    });

    const swapped = addIsland("hello", "", { "data-name": "swap" });
    act(() => {
      document.body.dispatchEvent(new CustomEvent("htmx:afterSwap", { bubbles: true }));
    });
    expect(swapped.textContent).toBe("hello swap");
  });
});

describe("auto-mount エントリ", () => {
  afterEach(() => {
    window.ReactIslands = undefined;
  });

  it("import するとキット標準を遅延登録し、自動マウントを開始する", async () => {
    vi.resetModules();
    await import("./auto-mount");
    const registry = await import("./registry");
    const { defaultIslandDefinitions } = await import("./default-islands");

    for (const name of Object.keys(defaultIslandDefinitions)) {
      expect(registry.hasIslandComponent(name)).toBe(true);
      // import しただけではどの Island も読み込まない
      expect(registry.getIslandComponent(name)).toBeNull();
    }
    expect(typeof window.ReactIslands?.initialize).toBe("function");
  });
});
