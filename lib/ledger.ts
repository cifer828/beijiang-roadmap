export const PEOPLE = ["闫寒", "刘一帆", "张秋晨", "王晶"] as const;
export type Person = (typeof PEOPLE)[number];
export const FAMILY_A = "闫寒 · 刘一帆";
export const FAMILY_B = "张秋晨 · 王晶";

export type Expense = {
  id: string;
  title: string;
  amountCents: number;
  paidBy: Person;
  occurredAt: string;
  note: string;
  images: string[];
};

export const DEMO_EXPENSES: Expense[] = [
  { id: "demo-hemu", title: "禾木民宿", amountCents: 256019, paidBy: "刘一帆", occurredAt: "2026-10-01T23:11", note: "纳兰禾谷民宿", images: [] },
  { id: "demo-car", title: "租车费用", amountCents: 320000, paidBy: "王晶", occurredAt: "2026-09-30T09:00", note: "", images: [] },
];

export function familyOf(person: Person): "A" | "B" {
  return person === "闫寒" || person === "刘一帆" ? "A" : "B";
}

export function settle(expenses: Expense[]) {
  let paidA = 0;
  let paidB = 0;
  let owedA = 0;
  let owedB = 0;
  for (const expense of expenses) {
    const family = familyOf(expense.paidBy);
    if (family === "A") paidA += expense.amountCents;
    else paidB += expense.amountCents;
    const half = Math.floor(expense.amountCents / 2);
    if (family === "A") {
      owedA += expense.amountCents - half;
      owedB += half;
    } else {
      owedA += half;
      owedB += expense.amountCents - half;
    }
  }
  const total = paidA + paidB;
  const netA = paidA - owedA;
  return {
    total,
    paidA,
    paidB,
    owedA,
    owedB,
    transfer: netA === 0 ? null : {
      from: netA > 0 ? FAMILY_B : FAMILY_A,
      to: netA > 0 ? FAMILY_A : FAMILY_B,
      amountCents: Math.abs(netA),
    },
  };
}

export function formatMoney(cents: number): string {
  return `¥${(cents / 100).toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
