import type { Expense } from "./ledger";

const API_URL = process.env.NEXT_PUBLIC_CLOUDBASE_API_URL?.replace(/\/$/, "");
export const TRIP_ID = "northern-xinjiang-2026";

export interface ExpenseStore {
  load(): Promise<Expense[] | null>;
  save(expense: Expense): Promise<Expense>;
  remove(id: string): Promise<void>;
}

export interface ChecklistStore {
  load(): Promise<Record<string, boolean> | null>;
  save(value: Record<string, boolean>): Promise<void>;
}

class LocalExpenseStore implements ExpenseStore {
  private key = "bj-expenses-v1";
  async load() {
    const raw = localStorage.getItem(this.key);
    return raw ? (JSON.parse(raw) as Expense[]) : null;
  }
  async save(expense: Expense) {
    const current = (await this.load()) ?? [];
    const next = current.some((item) => item.id === expense.id)
      ? current.map((item) => item.id === expense.id ? expense : item)
      : [expense, ...current];
    localStorage.setItem(this.key, JSON.stringify(next));
    return expense;
  }
  async remove(id: string) {
    const current = (await this.load()) ?? [];
    localStorage.setItem(this.key, JSON.stringify(current.filter((item) => item.id !== id)));
  }
}

class CloudExpenseStore implements ExpenseStore {
  constructor(private base: string) {}
  async load() {
    const response = await fetch(`${this.base}/trips/${TRIP_ID}/expenses`, { cache: "no-store" });
    if (!response.ok) throw new Error("共享账本读取失败");
    return response.json() as Promise<Expense[]>;
  }
  async save(expense: Expense) {
    const response = await fetch(`${this.base}/trips/${TRIP_ID}/expenses/${expense.id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(expense),
    });
    if (!response.ok) throw new Error("共享账本保存失败");
    return response.json() as Promise<Expense>;
  }
  async remove(id: string) {
    const response = await fetch(`${this.base}/trips/${TRIP_ID}/expenses/${id}`, { method: "DELETE" });
    if (!response.ok) throw new Error("共享账本删除失败");
  }
}

class LocalChecklistStore implements ChecklistStore {
  private key = "bj-checklist-v1";
  async load() {
    const raw = localStorage.getItem(this.key);
    return raw ? (JSON.parse(raw) as Record<string, boolean>) : null;
  }
  async save(value: Record<string, boolean>) {
    localStorage.setItem(this.key, JSON.stringify(value));
  }
}

class CloudChecklistStore implements ChecklistStore {
  constructor(private base: string) {}
  async load() {
    const response = await fetch(`${this.base}/trips/${TRIP_ID}/checklist`, { cache: "no-store" });
    if (!response.ok) throw new Error("共享清单读取失败");
    return response.json() as Promise<Record<string, boolean>>;
  }
  async save(value: Record<string, boolean>) {
    const response = await fetch(`${this.base}/trips/${TRIP_ID}/checklist`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(value),
    });
    if (!response.ok) throw new Error("共享清单保存失败");
  }
}

export const expenseStore: ExpenseStore = API_URL ? new CloudExpenseStore(API_URL) : new LocalExpenseStore();
export const checklistStore: ChecklistStore = API_URL ? new CloudChecklistStore(API_URL) : new LocalChecklistStore();
export const isCloudMode = Boolean(API_URL);
