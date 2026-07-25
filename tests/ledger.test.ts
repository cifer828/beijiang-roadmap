import { describe, expect, it } from "vitest";
import { INITIAL_EXPENSES, settle } from "../lib/ledger";

describe("双家庭固定 50/50 结算", () => {
  it("除阿勒泰一号外的住宿与租车都记录为张秋晨支付", () => {
    expect(INITIAL_EXPENSES).toHaveLength(11);
    expect(INITIAL_EXPENSES.every((expense) => expense.paidBy === "张秋晨")).toBe(true);
    expect(INITIAL_EXPENSES.some((expense) => expense.title.includes("阿勒泰"))).toBe(false);
  });

  it("当前已知订单只生成一笔跨家庭转账", () => {
    const result = settle(INITIAL_EXPENSES);
    expect(result.total).toBe(1187031);
    expect(result.paidA).toBe(0);
    expect(result.paidB).toBe(1187031);
    expect(result.owedA).toBe(593515);
    expect(result.owedB).toBe(593516);
    expect(result.transfer).toEqual({ from: "闫寒 · 刘一帆", to: "张秋晨 · 王晶", amountCents: 593515 });
  });

  it("奇数分由付款家庭多承担一分", () => {
    const a = settle([{ id: "1", title: "测试", amountCents: 101, paidBy: "闫寒", occurredAt: "2026-09-29T10:00", note: "", images: [] }]);
    expect(a.owedA).toBe(51);
    expect(a.owedB).toBe(50);
  });
});
