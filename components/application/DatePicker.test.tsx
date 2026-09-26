import { fireEvent, render, screen } from "@testing-library/react";
import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import {
  DatePicker,
  formatIsoDate,
  formatValue,
  parseIsoDate,
  parseMultipleString,
  parseRangeString,
  parseSingleDateString,
} from "./DatePicker";

describe("DatePicker parsing functions", () => {
  describe("parseSingleDateString", () => {
    it("8桁の数字（YYYYMMDD）を正しくパースする", () => {
      const date = parseSingleDateString("20260823");
      expect(date).not.toBeNull();
      expect(date?.getFullYear()).toBe(2026);
      expect(date?.getMonth()).toBe(7); // 0-indexed (8月)
      expect(date?.getDate()).toBe(23);
    });

    it("YYYY/MM/DD, YYYY-MM-DD, YYYY.MM.DD 形式を正しくパースする", () => {
      const d1 = parseSingleDateString("2026/08/23");
      const d2 = parseSingleDateString("2026-8-23");
      const d3 = parseSingleDateString("2026.08.23");

      expect(d1?.getTime()).toBe(d2?.getTime());
      expect(d2?.getTime()).toBe(d3?.getTime());
      expect(d1?.getFullYear()).toBe(2026);
      expect(d1?.getMonth()).toBe(7);
      expect(d1?.getDate()).toBe(23);
    });

    it("日本語表記（YYYY年M月D日）を正しくパースする", () => {
      const date = parseSingleDateString("2026年8月23日");
      expect(date).not.toBeNull();
      expect(date?.getFullYear()).toBe(2026);
      expect(date?.getMonth()).toBe(7);
      expect(date?.getDate()).toBe(23);

      const dateNoDay = parseSingleDateString("2026年8月23");
      expect(dateNoDay?.getDate()).toBe(23);
    });

    it("無効な文字列や存在しない日付は null を返す", () => {
      expect(parseSingleDateString("")).toBeNull();
      expect(parseSingleDateString("invalid")).toBeNull();
      expect(parseSingleDateString("2026-02-31")).toBeNull(); // 2月31日は存在しない
      expect(parseSingleDateString("2026-13-01")).toBeNull(); // 13月は存在しない
    });
  });

  describe("parseRangeString", () => {
    it("〜 や - で区切られた期間文字列をパースする", () => {
      const r1 = parseRangeString("2026/08/01 〜 2026/08/31");
      expect(r1?.from?.getDate()).toBe(1);
      expect(r1?.to?.getDate()).toBe(31);

      const r2 = parseRangeString("2026-08-01 - 2026-08-31");
      expect(r2?.from?.getDate()).toBe(1);
      expect(r2?.to?.getDate()).toBe(31);
    });

    it("開始日のみの入力も対応する", () => {
      const r = parseRangeString("2026/08/01 〜");
      expect(r?.from?.getDate()).toBe(1);
      expect(r?.to).toBeUndefined();
    });

    it("開始日と終了日が逆転している場合は自動で昇順に並べる", () => {
      const r = parseRangeString("2026/08/31 〜 2026/08/01");
      expect(r?.from?.getDate()).toBe(1);
      expect(r?.to?.getDate()).toBe(31);
    });
  });

  describe("parseMultipleString", () => {
    it("カンマや読点区切りの複数日付をパースしてソートする", () => {
      const dates = parseMultipleString("2026/08/10, 2026/08/01、2026/08/05");
      expect(dates).toHaveLength(3);
      expect(dates?.[0].getDate()).toBe(1);
      expect(dates?.[1].getDate()).toBe(5);
      expect(dates?.[2].getDate()).toBe(10);
    });

    it("重複日付は除外される", () => {
      const dates = parseMultipleString("2026/08/01, 2026/08/01");
      expect(dates).toHaveLength(1);
    });
  });

  describe("formatValue", () => {
    it("single モードで正しくフォーマットする", () => {
      const d = new Date(2026, 7, 23);
      expect(formatValue("single", d)).toBe("2026-08-23");
    });

    it("range モードで正しくフォーマットする", () => {
      const from = new Date(2026, 7, 1);
      const to = new Date(2026, 7, 31);
      expect(formatValue("range", { from, to })).toBe("2026-08-01 〜 2026-08-31");
      expect(formatValue("range", { from, to: undefined })).toBe("2026-08-01 〜");
    });

    it("multiple モードで正しくフォーマットする", () => {
      const d1 = new Date(2026, 7, 1);
      const d2 = new Date(2026, 7, 2);
      const d3 = new Date(2026, 7, 3);
      const d4 = new Date(2026, 7, 4);
      expect(formatValue("multiple", [d1, d2, d3, d4])).toBe("4日選択（8/1, 8/2, 8/3 他1件）");
    });
  });
});

describe("ISO 日付文字列との変換", () => {
  it("parseIsoDate はローカル時刻の 0 時の Date を返す", () => {
    const date = parseIsoDate("2026-09-23");
    expect(date?.getFullYear()).toBe(2026);
    expect(date?.getMonth()).toBe(8);
    expect(date?.getDate()).toBe(23);
    expect(date?.getHours()).toBe(0);
  });

  it("parseIsoDate は時刻付きでも日付部分だけを読む", () => {
    expect(formatIsoDate(parseIsoDate("2026-09-23T23:30:00+09:00"))).toBe("2026-09-23");
  });

  it("parseIsoDate は空・不正な値を undefined にする", () => {
    expect(parseIsoDate("")).toBeUndefined();
    expect(parseIsoDate(undefined)).toBeUndefined();
    expect(parseIsoDate(null)).toBeUndefined();
    expect(parseIsoDate("2026/09/23")).toBeUndefined();
  });

  it("formatIsoDate はローカル時刻の年月日を 0 埋めで返し、未選択は空文字", () => {
    expect(formatIsoDate(new Date(2026, 0, 5, 1, 30))).toBe("2026-01-05");
    expect(formatIsoDate(undefined)).toBe("");
    expect(formatIsoDate(null)).toBe("");
  });
});

describe("DatePicker Component", () => {
  it("キーボードで直接日付を入力して Enter を押すと onChange が呼ばれフォーマットされる", async () => {
    const onChange = vi.fn();
    render(<DatePicker mode="single" onChange={onChange} placeholder="日付を選択" />);

    const input = screen.getByPlaceholderText("日付を選択") as HTMLInputElement;
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "2026/08/23" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onChange).toHaveBeenCalledTimes(1);
    const calledDate = onChange.mock.calls[0][0] as Date;
    expect(calledDate.getFullYear()).toBe(2026);
    expect(calledDate.getMonth()).toBe(7);
    expect(calledDate.getDate()).toBe(23);
    expect(input.value).toBe("2026-08-23");
  });

  it("フォーカスが外れた（blur）ときに入力値がパースされて反映される", async () => {
    const onChange = vi.fn();
    render(<DatePicker mode="single" onChange={onChange} placeholder="日付を選択" />);

    const input = screen.getByPlaceholderText("日付を選択") as HTMLInputElement;
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "20260815" } });
    fireEvent.blur(input);

    expect(onChange).toHaveBeenCalledTimes(1);
    const calledDate = onChange.mock.calls[0][0] as Date;
    expect(calledDate.getDate()).toBe(15);
    expect(input.value).toBe("2026-08-15");
  });

  it("range モードでキーボードから期間を入力できる", async () => {
    const onChange = vi.fn();
    render(<DatePicker mode="range" onChange={onChange} placeholder="期間を選択" />);

    const input = screen.getByPlaceholderText("期間を選択") as HTMLInputElement;
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "2026/08/01 〜 2026/08/10" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onChange).toHaveBeenCalledTimes(1);
    const calledRange = onChange.mock.calls[0][0];
    expect(calledRange.from.getDate()).toBe(1);
    expect(calledRange.to.getDate()).toBe(10);
    expect(input.value).toBe("2026-08-01 〜 2026-08-10");
  });

  it("error が渡されたときは aria-invalid が付く", () => {
    render(<DatePicker error placeholder="日付を選択" />);
    const input = screen.getByPlaceholderText("日付を選択");
    expect(input.getAttribute("aria-invalid")).toBe("true");
  });
});
