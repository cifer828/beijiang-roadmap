import { describe, expect, it } from "vitest";
import { DEMO_EXPENSES, settle } from "../lib/ledger";

describe("双家庭固定 50/50 结算", () => {
  it("演示数据只生成一笔 319.91 元跨家庭转账", () => {
    const result = settle(DEMO_EXPENSES);
    expect(result.total).toBe(576019);
    expect(result.paidA).toBe(256019);
    expect(result.paidB).toBe(320000);
    expect(result.owedA).toBe(288010);
    expect(result.owedB).toBe(288009);
    expect(result.transfer).toEqual({ from: "闫寒 · 刘一帆", to: "张秋晨 · 王晶", amountCents: 31991 });
  });

  it("奇数分由付款家庭多承担一分", () => {
    const a = settle([{ id: "1", title: "测试", amountCents: 101, paidBy: "闫寒", occurredAt: "2026-09-29T10:00", note: "", images: [] }]);
    expect(a.owedA).toBe(51);
    expect(a.owedB).toBe(50);
  });
});
