import { describe, expect, it } from "vitest";
import { isSafeId, receiptKeyFromUrl, validateExpense } from "../lib/cloud-model";

const expense = {
  id: "expense-1",
  title: "晚餐",
  amountCents: 38800,
  paidBy: "闫寒",
  occurredAt: "2026-10-01T19:30",
  note: "四人用餐",
  images: ["/api/trip-data/receipts/expense-1/image-1"],
};

describe("共享数据入参校验", () => {
  it("接受完整且安全的消费数据", () => {
    expect(validateExpense(expense)).toEqual(expense);
  });

  it("拒绝未知付款人、外部图片和危险编号", () => {
    expect(validateExpense({ ...expense, paidBy: "陌生人" })).toBeNull();
    expect(validateExpense({ ...expense, images: ["https://example.com/a.jpg"] })).toBeNull();
    expect(isSafeId("../checklist")).toBe(false);
  });

  it("只从本站凭证地址提取固定 Blob key", () => {
    expect(receiptKeyFromUrl(expense.images[0])).toBe("receipts/expense-1/image-1");
    expect(receiptKeyFromUrl("/api/trip-data/receipts/../../secret")).toBeNull();
  });
});
