import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Table, type TableColumn } from "./Table";

type Row = { id: number; name: string; amount: number };

const ROWS: Row[] = [
  { id: 1, name: "モニター", amount: 30000 },
  { id: 2, name: "キーボード", amount: 8000 },
  { id: 3, name: "マウス", amount: 3000 },
];

const COLUMNS: TableColumn<Row>[] = [
  { key: "name", header: "名前", cell: (r) => r.name, sortable: true },
  { key: "amount", header: "金額", cell: (r) => r.amount, align: "right", sortable: true },
  { key: "note", header: "備考", cell: () => "-" },
];

describe("Table", () => {
  describe("並び替えの状態表示", () => {
    it("sortable な列だけがボタンになり、押すと asc で onSortChange を呼ぶ", () => {
      const onSortChange = vi.fn();
      render(
        <Table<Row>
          columns={COLUMNS}
          rows={ROWS}
          rowKey={(r) => r.id}
          onSortChange={onSortChange}
        />,
      );
      expect(screen.getByRole("button", { name: "名前" })).toBeTruthy();
      expect(screen.queryByRole("button", { name: "備考" })).toBeNull();

      fireEvent.click(screen.getByRole("button", { name: "名前" }));
      expect(onSortChange).toHaveBeenCalledWith({ key: "name", direction: "asc" });
    });

    it("同じ列を押すと asc → desc、別の列は asc から", () => {
      const onSortChange = vi.fn();
      render(
        <Table<Row>
          columns={COLUMNS}
          rows={ROWS}
          rowKey={(r) => r.id}
          sort={{ key: "name", direction: "asc" }}
          onSortChange={onSortChange}
        />,
      );
      fireEvent.click(screen.getByRole("button", { name: "名前" }));
      expect(onSortChange).toHaveBeenLastCalledWith({ key: "name", direction: "desc" });
      fireEvent.click(screen.getByRole("button", { name: "金額" }));
      expect(onSortChange).toHaveBeenLastCalledWith({ key: "amount", direction: "asc" });
    });

    it("aria-sort を並び替え中の列にだけ付ける（他の sortable 列は none）", () => {
      render(
        <Table<Row>
          columns={COLUMNS}
          rows={ROWS}
          rowKey={(r) => r.id}
          sort={{ key: "amount", direction: "desc" }}
          onSortChange={() => {}}
        />,
      );
      const headers = screen.getAllByRole("columnheader");
      expect(headers[0].getAttribute("aria-sort")).toBe("none");
      expect(headers[1].getAttribute("aria-sort")).toBe("descending");
      expect(headers[2].getAttribute("aria-sort")).toBeNull();
    });

    it("onSortChange が無ければ sortable でもボタンにしない（従来と同じ DOM）", () => {
      render(<Table<Row> columns={COLUMNS} rows={ROWS} rowKey={(r) => r.id} />);
      expect(screen.queryAllByRole("button")).toHaveLength(0);
    });
  });

  describe("行選択", () => {
    it("selection を渡すと選択列が付き、行のチェックで onChange に key 一式が渡る", () => {
      const onChange = vi.fn();
      render(
        <Table<Row>
          columns={COLUMNS}
          rows={ROWS}
          rowKey={(r) => r.id}
          selection={{ selectedKeys: [2], onChange, ariaLabel: (r) => `${r.name} を選択` }}
        />,
      );
      fireEvent.click(screen.getByRole("checkbox", { name: "モニター を選択" }));
      expect(onChange).toHaveBeenCalledWith([2, 1]);
    });

    it("全選択は選択可能な行だけを対象にし、解除で外す", () => {
      const onChange = vi.fn();
      render(
        <Table<Row>
          columns={COLUMNS}
          rows={ROWS}
          rowKey={(r) => r.id}
          selection={{ selectedKeys: [], onChange, isRowSelectable: (r) => r.id !== 3 }}
        />,
      );
      fireEvent.click(screen.getByRole("checkbox", { name: "すべて選択" }));
      expect(onChange).toHaveBeenCalledWith([1, 2]);
    });

    it("選択中の行に aria-selected が付く", () => {
      render(
        <Table<Row>
          columns={COLUMNS}
          rows={ROWS}
          rowKey={(r) => r.id}
          selection={{ selectedKeys: [1], onChange: () => {} }}
        />,
      );
      const rows = screen.getAllByRole("row").slice(1); // ヘッダー行を除く
      expect(rows[0].getAttribute("aria-selected")).toBe("true");
      expect(rows[1].getAttribute("aria-selected")).toBe("false");
    });

    it("チェックボックスのクリックは onRowClick を呼ばない", () => {
      const onRowClick = vi.fn();
      render(
        <Table<Row>
          columns={COLUMNS}
          rows={ROWS}
          rowKey={(r) => r.id}
          onRowClick={onRowClick}
          selection={{ selectedKeys: [], onChange: () => {} }}
        />,
      );
      fireEvent.click(screen.getAllByRole("checkbox", { name: "行を選択" })[0]);
      expect(onRowClick).not.toHaveBeenCalled();
      fireEvent.click(screen.getByText("キーボード"));
      expect(onRowClick).toHaveBeenCalledTimes(1);
    });

    it("selection に rowKey が無いと警告する", () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
      render(
        <Table<Row>
          columns={COLUMNS}
          rows={ROWS}
          selection={{ selectedKeys: [], onChange: () => {} }}
        />,
      );
      expect(warn).toHaveBeenCalledWith(expect.stringContaining("rowKey"));
      warn.mockRestore();
    });

    it("空状態の colSpan は選択列を含む", () => {
      render(
        <Table<Row>
          columns={COLUMNS}
          rows={[]}
          rowKey={(r) => r.id}
          selection={{ selectedKeys: [], onChange: () => {} }}
          emptyMessage="ありません"
        />,
      );
      expect(screen.getByText("ありません").closest("td")?.getAttribute("colspan")).toBe("4");
    });
  });

  it("stickyHeader は容器に固定用クラスと高さを付ける", () => {
    const { container } = render(
      <Table<Row>
        columns={COLUMNS}
        rows={ROWS}
        rowKey={(r) => r.id}
        stickyHeader
        maxHeight={200}
      />,
    );
    const wrapper = container.querySelector('[data-slot="table-container"]') as HTMLElement;
    expect(wrapper.className).toContain("cn-table-container-sticky");
    expect(wrapper.style.maxHeight).toBe("200px");
  });

  it("既定は枠つき（framed）で、plain クラスを付けない", () => {
    const { container } = render(<Table<Row> columns={COLUMNS} rows={ROWS} />);
    const wrapper = container.querySelector('[data-slot="table-container"]') as HTMLElement;
    expect(wrapper.className).toContain("cn-table-container");
    expect(wrapper.className).not.toContain("cn-table-container-plain");
  });

  it('variant="plain" は容器に枠なしのクラスを付け、stickyHeader と併用できる', () => {
    const { container } = render(
      <Table<Row> columns={COLUMNS} rows={ROWS} variant="plain" stickyHeader maxHeight={200} />,
    );
    const wrapper = container.querySelector('[data-slot="table-container"]') as HTMLElement;
    expect(wrapper.className).toContain("cn-table-container-plain");
    expect(wrapper.className).toContain("cn-table-container-sticky");
  });
});
