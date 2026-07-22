import { PEOPLE, type Expense, type Person } from "./ledger";

export const MAX_RECEIPT_BYTES = 900 * 1024;
export const MAX_EXPENSE_AMOUNT_CENTS = 100_000_000;

const ID_PATTERN = /^[a-zA-Z0-9_-]{1,80}$/;
const RECEIPT_URL_PATTERN = /^\/api\/trip-data\/receipts\/[a-zA-Z0-9_-]{1,80}\/[a-zA-Z0-9_-]{1,80}$/;

export function isSafeId(value: string): boolean {
  return ID_PATTERN.test(value);
}

export function isPerson(value: unknown): value is Person {
  return typeof value === "string" && (PEOPLE as readonly string[]).includes(value);
}

export function validateExpense(value: unknown): Expense | null {
  if (!value || typeof value !== "object") return null;
  const candidate = value as Partial<Expense>;
  if (
    typeof candidate.id !== "string" || !isSafeId(candidate.id) ||
    typeof candidate.title !== "string" || !candidate.title.trim() || candidate.title.length > 80 ||
    !Number.isSafeInteger(candidate.amountCents) || candidate.amountCents! <= 0 || candidate.amountCents! > MAX_EXPENSE_AMOUNT_CENTS ||
    !isPerson(candidate.paidBy) ||
    typeof candidate.occurredAt !== "string" || candidate.occurredAt.length > 32 ||
    typeof candidate.note !== "string" || candidate.note.length > 500 ||
    !Array.isArray(candidate.images) || candidate.images.length > 3 ||
    candidate.images.some((image) => typeof image !== "string" || !RECEIPT_URL_PATTERN.test(image))
  ) return null;

  return {
    id: candidate.id,
    title: candidate.title.trim(),
    amountCents: candidate.amountCents!,
    paidBy: candidate.paidBy,
    occurredAt: candidate.occurredAt,
    note: candidate.note.trim(),
    images: [...candidate.images],
  };
}

export function receiptKeyFromUrl(url: string): string | null {
  if (!RECEIPT_URL_PATTERN.test(url)) return null;
  return url.slice("/api/trip-data/".length);
}
