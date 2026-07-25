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

export const INITIAL_EXPENSES: Expense[] = [
  { id: "hotel-urumqi-first", title: "9/29 乌鲁木齐住宿", amountCents: 49890, paidBy: "张秋晨", occurredAt: "2026-09-29T14:00", note: "桔子乌鲁木齐天山国际机场砂之船奥莱酒店 · 按入住日记账", images: [] },
  { id: "rental-tank300", title: "坦克 300 租车", amountCents: 223100, paidBy: "张秋晨", occurredAt: "2026-09-30T09:00", note: "滴滴租车 · 租金 ¥1,821 + 手续费 ¥40 + 基础保障 ¥270 + 优享保障 ¥400 − 优惠 ¥300 · 9/30 酒店取车，10/9 机场还车", images: [] },
  { id: "hotel-hemu", title: "10/1 禾木住宿", amountCents: 256019, paidBy: "张秋晨", occurredAt: "2026-10-01T12:00", note: "纳兰禾谷民宿 · 订单 1128149389793495 · 按入住日记账", images: [] },
  { id: "hotel-jiadengyu", title: "10/2 贾登峪住宿", amountCents: 107434, paidBy: "张秋晨", occurredAt: "2026-10-02T14:00", note: "喀纳斯金美佳酒店 · 两笔订单 ¥550 + ¥524.34", images: [] },
  { id: "hotel-buerjin-zhefei", title: "10/3 布尔津住宿", amountCents: 120200, paidBy: "张秋晨", occurredAt: "2026-10-03T14:00", note: "喆啡酒店（布尔津友谊峰路店）· 另使用积分抵扣 ¥22", images: [] },
  { id: "hotel-bole-ji", title: "10/4 博乐住宿", amountCents: 70162, paidBy: "张秋晨", occurredAt: "2026-10-04T14:00", note: "全季酒店（博乐青得里大街店）", images: [] },
  { id: "hotel-yining", title: "10/5 伊宁住宿", amountCents: 60838, paidBy: "张秋晨", occurredAt: "2026-10-05T14:00", note: "桔子伊宁万容广场酒店 · 按入住日记账", images: [] },
  { id: "hotel-teks-plan-a", title: "10/6 特克斯住宿", amountCents: 49890, paidBy: "张秋晨", occurredAt: "2026-10-06T14:00", note: "全季特克斯九宫新城酒店 · 已确定入住", images: [] },
  { id: "hotel-xinyuan", title: "10/7 新源住宿", amountCents: 46762, paidBy: "张秋晨", occurredAt: "2026-10-07T14:00", note: "汉庭新源县天鹅湖酒店 · 按入住日记账", images: [] },
  { id: "hotel-urumqi-last", title: "10/8 乌鲁木齐住宿", amountCents: 49890, paidBy: "张秋晨", occurredAt: "2026-10-08T14:00", note: "桔子乌鲁木齐天山国际机场砂之船奥莱酒店 · 按入住日记账", images: [] },
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
