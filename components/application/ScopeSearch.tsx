/**
 * ScopeSearch - 1本の入力で複数種別を横断検索する（種別グループ付きサジェスト）
 *
 * 「社員も部署も拠点も、どれを探しているか決めないまま打ち始める」入口のための部品。
 * 候補は種別（kind）ごとに見出しと件数を付けて出し、上部のチップで種別を絞れる。
 * 空欄のときは最近見た項目を出すので、打つ前から次の操作へ進める。
 *
 * <important>
 * これは「探して1件へ移動する」ための検索窓で、フォームの値を決める部品ではない。
 * 選択結果をフォームに入れたいなら Combobox（1種類の候補から選ぶ）か
 * TreeSelect（階層から選ぶ）を使う。
 *
 * 候補は必ず props で受け取る。マスタ取得・endpoint・認証をこの中に持たせない
 * （ドメイン連携を内部に持った時点で、置き場はドメインを所有するプロジェクト側になる）。
 * サーバー検索と組み合わせるときは `filterMode="none"` にして、
 * `onQueryChange` で取得した結果を `items` に流し込む。
 * </important>
 */

import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "../../lib/utils";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "../ui/empty";
import { Spinner } from "../ui/spinner";
import { ButtonGroup } from "./ButtonGroup";
import { SearchInput } from "./SearchInput";

/**
 * 種別チップに渡す内部 ID。
 *
 * <important>
 * kind の文字列そのものをチップの value にしてはいけない。kind は呼び出し側が
 * 自由に決める値なので、「すべて」用の予約文字列と衝突し得る（衝突すると
 * その kind だけに絞れず、チップの押下状態も壊れる）。kinds の index から
 * 作った ID を渡し、選択されたら kind へ戻す。
 * </important>
 */
const ALL_SCOPE_ID = "all";
const kindScopeId = (index: number) => `kind-${index}`;

export interface ScopeSearchItem {
  /**
   * 選択時の値。候補の識別子（社員番号・部署コードなど）。
   *
   * <important>
   * **種別をまたいで一意にすること。** この部品は種別を横断して1本の一覧に
   * 並べるため、value が同じ候補が複数あると `recentValues` がどれを指すか
   * 決まらない（社員の "1" と部署の "1" が衝突する）。
   * 種別ごとに採番が独立しているなら `emp-1` / `dept-1` のように前置きする。
   * </important>
   */
  value: string;

  /** 種別。グループ見出しと種別チップの単位になる（例: 社員 / 部署 / 拠点） */
  kind: string;

  /** 主表示。絞り込みの対象になる */
  label: string;

  /** ラベル下の補足（所属・住所・件数など）。絞り込みの対象になる */
  description?: string;

  /**
   * 追加の検索キー。かな・英字表記・社員番号など「表示はしないが打たれる文字」を入れる。
   * これがないと「かちょう」や社員番号での検索が当たらない。
   */
  keywords?: string;
}

export interface ScopeSearchProps {
  /** 検索対象の候補 */
  items: ScopeSearchItem[];

  /**
   * 種別チップとグループ見出しの並び。
   * 省略すると `items` に出てきた順で作る。ここに無い種別は末尾へ回す（隠さない）。
   */
  kinds?: string[];

  /** 候補を決定したときに呼ばれる */
  onSelect?: (item: ScopeSearchItem) => void;

  /** 入力文字列（制御コンポーネントとして使う場合） */
  query?: string;

  /** 初期の入力文字列（非制御の場合） */
  defaultQuery?: string;

  /**
   * 入力が変わったときに呼ばれる。サーバー検索はここで投げる。
   *
   * 候補を決定したときにも、その候補のラベルで呼ばれる（入力欄に決定内容を残すため）。
   * 決定後に入力を空にしたい場合は、`query` を制御して自分で空にする。
   */
  onQueryChange?: (query: string) => void;

  /** 絞り込み中の種別（制御コンポーネントとして使う場合）。`null` は「すべて」 */
  scope?: string | null;

  /** 初期の種別（非制御の場合）。`null` は「すべて」 */
  defaultScope?: string | null;

  /** 種別チップが変わったときに呼ばれる */
  onScopeChange?: (kind: string | null) => void;

  /**
   * 入力が空のときに出す候補の value。「最近見た項目」として使う。
   * 空にすると、入力が空のあいだは `promptMessage` を出す。
   *
   * `items` の value が種別をまたいで一意であることが前提（`value` の説明を参照）。
   */
  recentValues?: string[];

  /**
   * 入力が空のときのグループ見出し
   * @default "最近見た項目"
   */
  recentLabel?: string;

  /**
   * 種別チップの「すべて」の文言
   * @default "すべて"
   */
  allLabel?: string;

  /**
   * 文字での絞り込みを誰がやるか。
   * - internal: この部品が `label` / `description` / `keywords` で絞る（既定）
   * - none: 絞らずに `items` をそのまま出す。サーバー検索の結果を渡す場合に使う
   *
   * どちらでも種別チップによる絞り込みは効く（`kind` を見るだけなので二重にならない）。
   * @default "internal"
   */
  filterMode?: "internal" | "none";

  /** 検索中を示す。サーバー検索の待ち時間に使う */
  loading?: boolean;

  /**
   * 入力欄のプレースホルダ
   * @default "検索"
   */
  placeholder?: string;

  /**
   * ヒット 0 件のときの文言。
   * 省略すると「『入力語』に一致する項目がありません」を出す。
   */
  emptyMessage?: React.ReactNode;

  /** ヒット 0 件のときの補足。次に何を試せばよいかを書く */
  emptySubMessage?: string;

  /**
   * 入力が空で、出す候補も無いときの文言
   * @default "キーワードを入力すると候補が出ます"
   */
  promptMessage?: string;

  /**
   * パネル下部に出す操作ヒント
   * @default "↑↓ で移動 ・ Enter で決定"
   */
  hint?: string;

  /** 操作不可にする */
  disabled?: boolean;

  /** ラッパーに付けるクラス。幅は呼び出し側が決める */
  className?: string;

  /**
   * 候補パネルの描画先。省略時（`null` を含む）は `document.body`。
   *
   * <important>
   * パネルは呼び出し側の `overflow: hidden` で切れないよう、入力欄の DOM の外へ
   * portal で出す。Dialog の中で使うときは Dialog のポップアップ要素を渡すこと。
   * body へ出すと、パネル内の操作が「Dialog の外側」として扱われ、
   * モーダルのフォーカス管理や外側クリックの判定とぶつかる。
   * </important>
   */
  portalContainer?: HTMLElement | null;

  /**
   * 入力欄のラベル。
   *
   * <important>
   * 視覚的なラベルを置かないことが多いため、省略時は `placeholder` を使う。
   * </important>
   */
  "aria-label"?: string;

  /**
   * 入力欄の id。
   *
   * <important>
   * FormField はラベルの htmlFor をこの id に向ける。受け取らないと
   * `<label for>` が実在しない要素を指し、ラベルクリックが効かない。
   * </important>
   */
  id?: string;

  /** ラベルとなる要素の id。渡すと `aria-label` より優先する */
  "aria-labelledby"?: string;

  /** 説明・エラー文言の id（FormField が自動で渡す） */
  "aria-describedby"?: string;

  /** エラー状態（FormField が自動で渡す） */
  "aria-invalid"?: boolean;
}

interface ResolvedGroup {
  kind: string;
  label: string;
  items: ScopeSearchItem[];
}

/** 出てきた順で種別を並べる（kinds 未指定のとき） */
function kindsFromItems(items: ScopeSearchItem[]): string[] {
  const seen: string[] = [];
  for (const item of items) {
    if (!seen.includes(item.kind)) seen.push(item.kind);
  }
  return seen;
}

/** label / description / keywords のいずれかに部分一致するか（大文字小文字を無視） */
function matchesQuery(item: ScopeSearchItem, needle: string): boolean {
  const haystack = `${item.label} ${item.description ?? ""} ${item.keywords ?? ""}`;
  return haystack.toLowerCase().includes(needle);
}

/** 入力欄とパネルの間隔（px） */
const PANEL_GAP = 4;

/** パネルを画面の上下端から離す量（px） */
const VIEWPORT_MARGIN = 8;

/**
 * パネルを入力欄の真下（入りきらず、上のほうが広ければ真上）へ `position: fixed` で置く。
 *
 * <important>
 * パネルは portal で入力欄の DOM の外へ出している。`position: absolute` のままだと
 * 呼び出し側の `overflow: hidden`（カード・スクロール領域・モーダル）で切れ、
 * z-index では直らない（クリッピングは重なり順と無関係）。
 *
 * 描画先の祖先に transform 等があると fixed の基準がその要素へ移るため、
 * 置いたあとに実測して、ずれた分を戻す。
 * </important>
 */
function placePanel(anchor: HTMLElement, panel: HTMLElement) {
  const rect = anchor.getBoundingClientRect();
  const viewportWidth = document.documentElement.clientWidth;

  // 前回の上限を外してから、中身どおりの高さを測る
  panel.style.width = `${rect.width}px`;
  panel.style.maxHeight = "";
  const naturalHeight = panel.offsetHeight;

  const spaceBelow = window.innerHeight - rect.bottom - PANEL_GAP - VIEWPORT_MARGIN;
  const spaceAbove = rect.top - PANEL_GAP - VIEWPORT_MARGIN;
  const side = naturalHeight > spaceBelow && spaceAbove > spaceBelow ? "top" : "bottom";
  const available = Math.max(side === "top" ? spaceAbove : spaceBelow, 0);
  const height = Math.min(naturalHeight, available);

  const top = side === "top" ? rect.top - PANEL_GAP - height : rect.bottom + PANEL_GAP;
  // min-w-64 で入力欄より広くなることがあるため、右端からはみ出す分だけ左へ寄せる
  const left = Math.max(
    Math.min(rect.left, viewportWidth - VIEWPORT_MARGIN - panel.offsetWidth),
    0,
  );

  panel.style.maxHeight = `${available}px`;
  panel.style.top = `${top}px`;
  panel.style.left = `${left}px`;
  panel.dataset.side = side;

  const placed = panel.getBoundingClientRect();
  const driftTop = top - placed.top;
  const driftLeft = left - placed.left;
  if (Math.abs(driftTop) > 0.5 || Math.abs(driftLeft) > 0.5) {
    panel.style.top = `${top + driftTop}px`;
    panel.style.left = `${left + driftLeft}px`;
  }
}

/**
 * 開いているあいだ、パネルを入力欄へ追従させる。
 *
 * 位置は state ではなく style へ直接書く。スクロールのたびに再レンダーさせないため。
 */
function useAnchoredPanel(open: boolean) {
  const anchorRef = React.useRef<HTMLDivElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);

  // 候補の件数が変わると高さも変わるので、描画のたびに置き直す
  React.useLayoutEffect(() => {
    if (open && anchorRef.current && panelRef.current) {
      placePanel(anchorRef.current, panelRef.current);
    }
  });

  React.useEffect(() => {
    const anchor = anchorRef.current;
    const panel = panelRef.current;
    if (!open || !anchor || !panel) return;

    const update = () => placePanel(anchor, panel);
    window.addEventListener("resize", update);
    // capture で拾えば、どの祖先がスクロールしても追従できる
    document.addEventListener("scroll", update, true);
    const observer = typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(update);
    observer?.observe(anchor);
    observer?.observe(panel);

    return () => {
      window.removeEventListener("resize", update);
      document.removeEventListener("scroll", update, true);
      observer?.disconnect();
    };
  }, [open]);

  return { anchorRef, panelRef };
}

const TABBABLE_SELECTOR = "a[href], button, input, select, textarea, [tabindex]";

/** Tab で止まる要素（文書順） */
function tabbables(scope: ParentNode): HTMLElement[] {
  return Array.from(scope.querySelectorAll<HTMLElement>(TABBABLE_SELECTOR)).filter(
    (el) => el.tabIndex >= 0 && !el.matches(":disabled"),
  );
}

/** 先頭から順に focus し、実際に移れたら true。非表示の要素は focus できないため飛ばす */
function focusFirstOf(candidates: HTMLElement[]): boolean {
  for (const el of candidates) {
    el.focus();
    if (document.activeElement === el) return true;
  }
  return false;
}

/**
 * ScopeSearch コンポーネント
 *
 * @example
 * ```tsx
 * const items = [
 *   { value: "10024", kind: "社員", label: "青木 里佐",
 *     description: "首都圏営業部 課長", keywords: "あおき りさ 10024" },
 *   { value: "d1", kind: "部署", label: "首都圏営業部",
 *     description: "営業本部 ・ 42 名", keywords: "しゅとけんえいぎょうぶ" },
 * ]
 *
 * // 手元の候補から探す
 * <ScopeSearch
 *   items={items}
 *   placeholder="社員・部署を検索"
 *   recentValues={["d1"]}
 *   onSelect={(item) => router.push(`/${item.kind}/${item.value}`)}
 * />
 *
 * // サーバー検索と組み合わせる
 * <ScopeSearch
 *   items={results}
 *   filterMode="none"
 *   loading={isFetching}
 *   query={query}
 *   onQueryChange={setQuery}
 *   onSelect={open}
 * />
 * ```
 */
export const ScopeSearch = React.forwardRef<HTMLInputElement, ScopeSearchProps>(
  (
    {
      items,
      kinds,
      onSelect,
      query,
      defaultQuery = "",
      onQueryChange,
      scope,
      defaultScope = null,
      onScopeChange,
      recentValues,
      recentLabel = "最近見た項目",
      allLabel = "すべて",
      filterMode = "internal",
      loading = false,
      placeholder = "検索",
      emptyMessage,
      emptySubMessage,
      promptMessage = "キーワードを入力すると候補が出ます",
      hint = "↑↓ で移動 ・ Enter で決定",
      disabled = false,
      className,
      portalContainer,
      id,
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledBy,
      "aria-describedby": ariaDescribedBy,
      "aria-invalid": ariaInvalid,
    },
    ref,
  ) => {
    const reactId = React.useId();
    const listId = `${reactId}-list`;
    const optionId = (index: number) => `${reactId}-option-${index}`;

    const [open, setOpen] = React.useState(false);
    const panelVisible = open && !disabled;
    const { anchorRef: rootRef, panelRef } = useAnchoredPanel(panelVisible);
    const portalTarget =
      portalContainer ?? (typeof document === "undefined" ? null : document.body);

    // パネルは portal で入力欄の DOM の外にあるため、「内側か」は両方を見て判定する
    const isInside = (node: Node | null) =>
      node !== null &&
      (rootRef.current?.contains(node) === true || panelRef.current?.contains(node) === true);

    // カーソルは「どの検索条件のときの位置か」と一緒に持つ。
    // 条件が変わったら 0 に戻したいが、effect で戻すと 1 フレームだけ
    // 前の位置が残り、その間の Enter が別の候補を選ぶ。
    const [cursorState, setCursorState] = React.useState({ key: "", index: 0 });

    // query / scope はどちらも制御・非制御の両対応。value が来ていればそれを正にする。
    const [uncontrolledQuery, setUncontrolledQuery] = React.useState(defaultQuery);
    const [uncontrolledScope, setUncontrolledScope] = React.useState<string | null>(defaultScope);
    const currentQuery = query ?? uncontrolledQuery;
    const currentScope = scope !== undefined ? scope : uncontrolledScope;

    const updateQuery = (next: string) => {
      if (query === undefined) setUncontrolledQuery(next);
      onQueryChange?.(next);
    };

    const updateScope = (next: string | null) => {
      if (scope === undefined) setUncontrolledScope(next);
      onScopeChange?.(next);
    };

    const needle = currentQuery.trim().toLowerCase();
    const hasQuery = needle.length > 0;

    const scopeKinds = React.useMemo(() => kinds ?? kindsFromItems(items), [kinds, items]);

    // 表示する候補と、その並び順で作ったグループ。
    // キーボード操作は「見た目の順に並べた1本のリスト」の index で動かす。
    const groups = React.useMemo<ResolvedGroup[]>(() => {
      const scoped = items.filter((item) => currentScope === null || item.kind === currentScope);

      if (!hasQuery) {
        if (!recentValues?.length) return [];
        /* recentValues の順（= 最近見た順）を保つ。
         * value は種別をまたいで一意である前提だが、破られたときも挙動が
         * 揺れないよう先に現れたものを採る（Map は後勝ちになるため）。 */
        const byValue = new Map<string, ScopeSearchItem>();
        for (const item of scoped) {
          if (!byValue.has(item.value)) byValue.set(item.value, item);
        }
        const recent = recentValues
          .map((value) => byValue.get(value))
          .filter((item): item is ScopeSearchItem => item !== undefined);
        return recent.length ? [{ kind: recentLabel, label: recentLabel, items: recent }] : [];
      }

      const hit =
        filterMode === "none" ? scoped : scoped.filter((item) => matchesQuery(item, needle));

      // kinds の順に見出しを立て、kinds に無い種別は出てきた順で末尾へ回す
      const order = [...scopeKinds, ...kindsFromItems(hit).filter((k) => !scopeKinds.includes(k))];
      return order
        .map((kind) => ({
          kind,
          label: kind,
          items: hit.filter((item) => item.kind === kind),
        }))
        .filter((group) => group.items.length > 0);
    }, [items, currentScope, hasQuery, recentValues, recentLabel, filterMode, needle, scopeKinds]);

    const flat = React.useMemo(() => groups.flatMap((group) => group.items), [groups]);

    // 絞り込み中の kind → チップの内部 ID。kinds に無い kind で絞っているときは
    // どのチップも押下状態にしない（「すべて」を光らせると表示と実態が食い違う）。
    const scopeIndex = currentScope === null ? -1 : scopeKinds.indexOf(currentScope);
    const currentScopeId =
      currentScope === null ? ALL_SCOPE_ID : scopeIndex >= 0 ? kindScopeId(scopeIndex) : "";

    const cursorKey = `${filterMode} ${currentScope ?? ""} ${needle}`;
    const cursor = cursorState.key === cursorKey ? cursorState.index : 0;
    const setCursor = (index: number) => setCursorState({ key: cursorKey, index });
    const activeIndex = flat.length === 0 ? -1 : Math.min(cursor, flat.length - 1);

    // カーソル行を可視範囲へ入れる。キーボードだけで端まで送れるようにする。
    // useId が生成する id は CSS セレクタとして無効な文字を含み得るので、
    // querySelector ではなく getElementById で引く。
    React.useEffect(() => {
      if (!open || activeIndex < 0) return;
      const el = document.getElementById(optionId(activeIndex));
      el?.scrollIntoView?.({ block: "nearest" });
    });

    // 外側クリックで閉じる。パネル内のチップを Tab で辿れるよう、
    // 閉じる条件はフォーカスがルート外へ出たときに限る。
    React.useEffect(() => {
      if (!open) return;
      const onPointerDown = (event: MouseEvent) => {
        const target = event.target as Node;
        if (!rootRef.current?.contains(target) && !panelRef.current?.contains(target)) {
          setOpen(false);
        }
      };
      document.addEventListener("mousedown", onPointerDown);
      return () => document.removeEventListener("mousedown", onPointerDown);
    }, [open, rootRef, panelRef]);

    const select = (item: ScopeSearchItem) => {
      setOpen(false);
      updateQuery(item.label);
      onSelect?.(item);
    };

    const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setOpen(true);
        setCursor(Math.min(activeIndex + 1, flat.length - 1));
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setCursor(Math.max(activeIndex - 1, 0));
      } else if (event.key === "Enter") {
        const item = flat[activeIndex];
        if (open && item) {
          event.preventDefault();
          select(item);
        }
      } else if (event.key === "Escape") {
        if (open) {
          event.preventDefault();
          setOpen(false);
        }
      } else if (event.key === "Tab" && !event.shiftKey) {
        // パネルは portal で DOM の末尾にあるため、ブラウザ任せの Tab では
        // 種別チップへ入れない。入力欄の次はパネル内、という順路をここで作る。
        const panel = panelRef.current;
        if (open && panel && focusFirstOf(tabbables(panel))) event.preventDefault();
      }
    };

    const onPanelKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key !== "Tab") return;
      const inPanel = tabbables(event.currentTarget);
      const target = event.target as HTMLElement;

      if (event.shiftKey && target === inPanel[0]) {
        // パネルの先頭から戻るときは入力欄へ
        const input = rootRef.current?.querySelector("input");
        if (input) {
          event.preventDefault();
          input.focus();
        }
      } else if (!event.shiftKey && target === inPanel[inPanel.length - 1]) {
        // パネルを抜けたら、ページ上で ScopeSearch の次にある要素へ進める
        const root = rootRef.current;
        const panel = event.currentTarget;
        if (!root) return;
        const following = tabbables(document).filter(
          (el) =>
            !root.contains(el) &&
            !panel.contains(el) &&
            (root.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0,
        );
        if (focusFirstOf(following)) event.preventDefault();
      }
    };

    const showEmpty = hasQuery && !loading && flat.length === 0;
    const showPrompt = !hasQuery && !loading && flat.length === 0;

    let renderedIndex = -1;

    return (
      <div
        ref={rootRef}
        className={cn("w-full", className)}
        onBlur={(event) => {
          // Tab でパネル外へ出たら閉じる（パネル内の移動では閉じない）。
          // パネルは DOM 上はここの外にあるが、React のイベントは portal からもここへ届く。
          if (!isInside(event.relatedTarget as Node | null)) setOpen(false);
        }}
      >
        <SearchInput
          ref={ref}
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-activedescendant={open && activeIndex >= 0 ? optionId(activeIndex) : undefined}
          aria-autocomplete="list"
          autoComplete="off"
          id={id}
          // aria-labelledby があるときは名前をそちらへ譲る（二重に名前を持たせない）
          aria-label={ariaLabelledBy ? undefined : (ariaLabel ?? placeholder)}
          aria-labelledby={ariaLabelledBy}
          aria-describedby={ariaDescribedBy}
          aria-invalid={ariaInvalid}
          placeholder={placeholder}
          disabled={disabled}
          value={currentQuery}
          onChange={(event) => {
            updateQuery(event.target.value);
            setOpen(true);
          }}
          onClear={() => {
            updateQuery("");
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onClick={() => setOpen(true)}
          onKeyDown={onKeyDown}
        />

        {panelVisible &&
          portalTarget &&
          createPortal(
            <div
              ref={panelRef}
              onKeyDown={onPanelKeyDown}
              className="fixed z-50 flex min-w-64 flex-col overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-lg"
            >
              {scopeKinds.length > 1 && (
                <div className="overflow-x-auto border-b border-border p-2">
                  <ButtonGroup
                    size="sm"
                    variant="primary"
                    aria-label="種別で絞り込む"
                    items={[
                      { value: ALL_SCOPE_ID, label: allLabel },
                      ...scopeKinds.map((kind, index) => ({
                        value: kindScopeId(index),
                        label: kind,
                      })),
                    ]}
                    value={currentScopeId}
                    onValueChange={(id) => {
                      const index = scopeKinds.findIndex((_, i) => kindScopeId(i) === id);
                      updateScope(index >= 0 ? (scopeKinds[index] as string) : null);
                    }}
                  />
                </div>
              )}

              {/* フォーカスは入力欄に留め、位置は aria-activedescendant で伝える
               * （ARIA 1.2 の combobox パターン）。この一覧と行は Tab の順路に
               * 入れないため tabIndex は -1 で固定する。 */}
              <div
                id={listId}
                role="listbox"
                tabIndex={-1}
                aria-label={ariaLabel ?? placeholder}
                className="max-h-80 min-h-0 overflow-y-auto p-1.5"
              >
                {groups.map((group, groupIndex) => {
                  const headingId = `${reactId}-group-${groupIndex}`;
                  return (
                    <div key={group.kind} role="group" aria-labelledby={headingId}>
                      <div className="flex items-baseline justify-between gap-2 px-2 pt-2 pb-1">
                        <span
                          id={headingId}
                          className="text-[11px] font-semibold tracking-wide text-muted-foreground"
                        >
                          {group.label}
                        </span>
                        {hasQuery && (
                          <span className="text-[11px] text-muted-foreground tabular-nums">
                            {group.items.length} 件
                          </span>
                        )}
                      </div>

                      {group.items.map((item) => {
                        renderedIndex += 1;
                        const index = renderedIndex;
                        const active = index === activeIndex;
                        return (
                          <div
                            key={item.value}
                            id={optionId(index)}
                            role="option"
                            tabIndex={-1}
                            aria-selected={active}
                            // 入力欄からフォーカスを奪わない（aria-activedescendant で位置を伝える）
                            onMouseDown={(event) => event.preventDefault()}
                            onMouseMove={() => setCursor(index)}
                            onClick={() => select(item)}
                            className={cn(
                              "flex cursor-pointer items-center gap-2.5 rounded-sm px-2 py-1.5",
                              active ? "bg-accent" : "hover:bg-accent/50",
                            )}
                          >
                            <span
                              aria-hidden="true"
                              className={cn(
                                "w-0.5 self-stretch rounded-full",
                                active ? "bg-primary" : "bg-transparent",
                              )}
                            />
                            <span className="flex min-w-0 flex-1 flex-col">
                              <span className="truncate text-sm font-medium text-foreground">
                                {item.label}
                              </span>
                              {item.description && (
                                <span className="truncate text-xs text-muted-foreground">
                                  {item.description}
                                </span>
                              )}
                            </span>
                            <span className="shrink-0 text-[11px] text-muted-foreground">
                              {item.kind}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}

                {loading && (
                  <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
                    <Spinner />
                    検索中
                  </div>
                )}

                {showEmpty && (
                  <Empty className="py-8">
                    <EmptyHeader>
                      <EmptyTitle className="text-sm">
                        {emptyMessage ?? `「${currentQuery.trim()}」に一致する項目がありません`}
                      </EmptyTitle>
                      {emptySubMessage && (
                        <EmptyDescription className="text-xs">{emptySubMessage}</EmptyDescription>
                      )}
                    </EmptyHeader>
                  </Empty>
                )}

                {showPrompt && (
                  <p className="px-2 py-8 text-center text-sm text-muted-foreground">
                    {promptMessage}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between gap-2 border-t border-border bg-card px-2.5 py-1.5">
                <span className="text-[11px] text-muted-foreground">{hint}</span>
                {hasQuery && !loading && (
                  <span className="text-[11px] text-muted-foreground tabular-nums">
                    {flat.length} 件
                  </span>
                )}
              </div>
            </div>,
            portalTarget,
          )}
      </div>
    );
  },
);

ScopeSearch.displayName = "ScopeSearch";
