import type { Expense } from "./ledger";

const API_URL = (process.env.NEXT_PUBLIC_TRIP_API_URL || process.env.NEXT_PUBLIC_CLOUDBASE_API_URL)?.replace(/\/$/, "");
export const TRIP_ID = "northern-xinjiang-2026";
const EXPENSE_CACHE_KEY = "bj-expenses-cache-v2";
const CHECKLIST_CACHE_KEY = "bj-checklist-cache-v2";

export interface ExpenseStore {
  load(): Promise<Expense[] | null>;
  save(expense: Expense): Promise<Expense>;
  remove(id: string): Promise<void>;
}

export interface ChecklistStore {
  load(): Promise<Record<string, boolean> | null>;
  save(id: string, checked: boolean): Promise<void>;
}

export async function checkCloudSession(): Promise<boolean> {
  if (!API_URL) return true;
  const response = await fetch(`${API_URL}/session`, { cache: "no-store", credentials: "same-origin" });
  if (!response.ok) return false;
  return Boolean((await response.json() as { authenticated?: boolean }).authenticated);
}

export async function unlockCloudSession(code: string): Promise<void> {
  if (!API_URL) return;
  const response = await fetch(`${API_URL}/session`, {
    method: "POST",
    credentials: "same-origin",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ code }),
  });
  if (!response.ok) throw new Error((await response.json().catch(() => null))?.error || "同行口令验证失败");
}

function readCache<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) as T : null;
  } catch { return null; }
}

function writeCache(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); }
  catch { /* 浏览器存储已满时仍以云端结果为准。 */ }
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
    try {
      const response = await fetch(`${this.base}/expenses`, { cache: "no-store" });
      if (!response.ok) throw new Error("共享账本读取失败");
      const expenses = await response.json() as Expense[];
      writeCache(EXPENSE_CACHE_KEY, expenses);
      return expenses;
    } catch (error) {
      const cached = readCache<Expense[]>(EXPENSE_CACHE_KEY);
      if (cached) return cached;
      throw error;
    }
  }
  async save(expense: Expense) {
    const images = await Promise.all(expense.images.map(async (image) => {
      if (!image.startsWith("data:")) return image;
      const blob = await (await fetch(image)).blob();
      const imageId = crypto.randomUUID();
      const upload = await fetch(`${this.base}/receipts/${expense.id}/${imageId}`, {
        method: "PUT",
        headers: { "content-type": blob.type || "image/jpeg" },
        body: blob,
      });
      if (!upload.ok) throw new Error((await upload.json().catch(() => null))?.error || "消费凭证上传失败");
      return (await upload.json() as { url: string }).url;
    }));
    const payload = { ...expense, images };
    const response = await fetch(`${this.base}/expenses/${expense.id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error("共享账本保存失败");
    const saved = await response.json() as Expense;
    const current = readCache<Expense[]>(EXPENSE_CACHE_KEY) ?? [];
    writeCache(EXPENSE_CACHE_KEY, current.some((item) => item.id === saved.id)
      ? current.map((item) => item.id === saved.id ? saved : item)
      : [saved, ...current]);
    return saved;
  }
  async remove(id: string) {
    const response = await fetch(`${this.base}/expenses/${id}`, { method: "DELETE" });
    if (!response.ok) throw new Error("共享账本删除失败");
    const current = readCache<Expense[]>(EXPENSE_CACHE_KEY) ?? [];
    writeCache(EXPENSE_CACHE_KEY, current.filter((item) => item.id !== id));
  }
}

class LocalChecklistStore implements ChecklistStore {
  private key = "bj-checklist-v1";
  async load() {
    const raw = localStorage.getItem(this.key);
    return raw ? (JSON.parse(raw) as Record<string, boolean>) : null;
  }
  async save(id: string, checked: boolean) {
    const current = (await this.load()) ?? {};
    localStorage.setItem(this.key, JSON.stringify({ ...current, [id]: checked }));
  }
}

class CloudChecklistStore implements ChecklistStore {
  constructor(private base: string) {}
  async load() {
    try {
      const response = await fetch(`${this.base}/checklist`, { cache: "no-store" });
      if (!response.ok) throw new Error("共享清单读取失败");
      const value = await response.json() as Record<string, boolean>;
      writeCache(CHECKLIST_CACHE_KEY, value);
      return value;
    } catch (error) {
      const cached = readCache<Record<string, boolean>>(CHECKLIST_CACHE_KEY);
      if (cached) return cached;
      throw error;
    }
  }
  async save(id: string, checked: boolean) {
    const response = await fetch(`${this.base}/checklist/${encodeURIComponent(id)}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ checked }),
    });
    if (!response.ok) throw new Error("共享清单保存失败");
    const current = readCache<Record<string, boolean>>(CHECKLIST_CACHE_KEY) ?? {};
    writeCache(CHECKLIST_CACHE_KEY, { ...current, [id]: checked });
  }
}

export const expenseStore: ExpenseStore = API_URL ? new CloudExpenseStore(API_URL) : new LocalExpenseStore();
export const checklistStore: ChecklistStore = API_URL ? new CloudChecklistStore(API_URL) : new LocalChecklistStore();
export const isCloudMode = Boolean(API_URL);
