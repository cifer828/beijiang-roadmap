import { getStore } from "@netlify/blobs";
import { createHash } from "node:crypto";
import { DEMO_EXPENSES, type Expense } from "../../lib/ledger";
import { MAX_RECEIPT_BYTES, isSafeId, receiptKeyFromUrl, validateExpense } from "../../lib/cloud-model";

const STORE_NAME = "beijiang-roadtrip-2026";
const EXPENSE_PREFIX = "expenses/";
const CHECKLIST_PREFIX = "checklist/";
const RECEIPT_PREFIX = "receipts/";
const INITIALIZED_KEY = "meta/expenses-initialized";

const store = () => getStore({ name: STORE_NAME, consistency: "strong" });

function json(value: unknown, status = 200, extraHeaders: HeadersInit = {}) {
  return Response.json(value, {
    status,
    headers: {
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
      ...extraHeaders,
    },
  });
}

function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try { return new URL(origin).host === new URL(request.url).host; }
  catch { return false; }
}

function parts(request: Request) {
  const pathname = new URL(request.url).pathname;
  const prefix = "/api/trip-data/";
  return (pathname.startsWith(prefix) ? pathname.slice(prefix.length) : "")
    .split("/").filter(Boolean).map(decodeURIComponent);
}

async function seedExpenses() {
  const data = store();
  if (await data.get(INITIALIZED_KEY)) return;
  await Promise.all(DEMO_EXPENSES.map((expense) => data.setJSON(`${EXPENSE_PREFIX}${expense.id}`, expense)));
  await data.set(INITIALIZED_KEY, new Date().toISOString());
}

async function listExpenses() {
  await seedExpenses();
  const data = store();
  const { blobs } = await data.list({ prefix: EXPENSE_PREFIX });
  const values = await Promise.all(blobs.map(({ key }) => data.get(key, { type: "json" }) as Promise<Expense | null>));
  return values.filter((value): value is Expense => Boolean(value)).sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
}

async function listChecklist() {
  const data = store();
  const { blobs } = await data.list({ prefix: CHECKLIST_PREFIX });
  const entries = await Promise.all(blobs.map(async ({ key }) => {
    const value = await data.get(key, { type: "json" }) as { checked?: boolean } | null;
    return [key.slice(CHECKLIST_PREFIX.length), Boolean(value?.checked)] as const;
  }));
  return Object.fromEntries(entries);
}

async function removeReceiptKeys(keys: string[]) {
  const data = store();
  await Promise.all(keys.map((key) => data.delete(key)));
}

async function handleExpenses(request: Request, route: string[]) {
  const data = store();
  if (request.method === "GET" && route.length === 1) return json(await listExpenses());
  const id = route[1];
  if (!id || !isSafeId(id) || route.length !== 2) return json({ error: "无效的消费编号" }, 400);

  if (request.method === "PUT") {
    const parsed = validateExpense(await request.json().catch(() => null));
    if (!parsed || parsed.id !== id) return json({ error: "消费数据格式无效" }, 400);
    const key = `${EXPENSE_PREFIX}${id}`;
    const previous = await data.get(key, { type: "json" }) as Expense | null;
    await data.setJSON(key, parsed);
    const keep = new Set(parsed.images.map(receiptKeyFromUrl).filter((value): value is string => Boolean(value)));
    const removed = (previous?.images ?? []).map(receiptKeyFromUrl).filter((value): value is string => Boolean(value) && !keep.has(value));
    await removeReceiptKeys(removed);
    return json(parsed);
  }

  if (request.method === "DELETE") {
    await data.delete(`${EXPENSE_PREFIX}${id}`);
    const { blobs } = await data.list({ prefix: `${RECEIPT_PREFIX}${id}/` });
    await removeReceiptKeys(blobs.map(({ key }) => key));
    return new Response(null, { status: 204, headers: { "cache-control": "no-store" } });
  }
  return json({ error: "不支持的请求方式" }, 405, { allow: "GET, PUT, DELETE" });
}

async function handleChecklist(request: Request, route: string[]) {
  if (request.method === "GET" && route.length === 1) return json(await listChecklist());
  const id = route[1];
  if (request.method !== "PUT" || !id || !isSafeId(id) || route.length !== 2) {
    return json({ error: "无效的清单请求" }, request.method === "PUT" ? 400 : 405);
  }
  const body = await request.json().catch(() => null) as { checked?: unknown } | null;
  if (typeof body?.checked !== "boolean") return json({ error: "清单状态无效" }, 400);
  await store().setJSON(`${CHECKLIST_PREFIX}${id}`, { checked: body.checked, updatedAt: new Date().toISOString() });
  return json({ id, checked: body.checked });
}

async function handleReceipts(request: Request, route: string[]) {
  const expenseId = route[1];
  const imageId = route[2];
  if (!expenseId || !imageId || route.length !== 3 || !isSafeId(expenseId) || !isSafeId(imageId)) {
    return json({ error: "无效的图片编号" }, 400);
  }
  const key = `${RECEIPT_PREFIX}${expenseId}/${imageId}`;
  const data = store();

  if (request.method === "PUT") {
    const contentType = request.headers.get("content-type") ?? "";
    const declaredLength = Number(request.headers.get("content-length") ?? "0");
    if (!/^image\/(jpeg|png|webp)$/i.test(contentType)) return json({ error: "只支持 JPG、PNG 或 WebP 图片" }, 415);
    if (declaredLength > MAX_RECEIPT_BYTES) return json({ error: "单张图片不能超过 900KB" }, 413);
    const bytes = await request.arrayBuffer();
    if (!bytes.byteLength || bytes.byteLength > MAX_RECEIPT_BYTES) return json({ error: "单张图片不能超过 900KB" }, 413);
    await data.set(key, bytes, { metadata: { contentType, digest: createHash("sha256").update(Buffer.from(bytes)).digest("hex") } });
    return json({ url: `/api/trip-data/${key}` }, 201);
  }

  if (request.method === "GET") {
    const entry = await data.getWithMetadata(key, { type: "arrayBuffer" });
    if (!entry) return json({ error: "图片不存在" }, 404);
    const metadata = entry.metadata as { contentType?: string; digest?: string };
    return new Response(entry.data as ArrayBuffer, {
      headers: {
        "content-type": metadata.contentType ?? "image/jpeg",
        "cache-control": "private, max-age=300",
        "x-content-type-options": "nosniff",
        ...(metadata.digest ? { etag: `\"${metadata.digest}\"` } : {}),
      },
    });
  }
  return json({ error: "不支持的请求方式" }, 405, { allow: "GET, PUT" });
}

export default async function handler(request: Request) {
  try {
    if (request.method !== "GET" && !sameOrigin(request)) return json({ error: "拒绝跨站写入" }, 403);
    const route = parts(request);
    if (route[0] === "health" && request.method === "GET") return json({ ok: true, storage: "netlify-blobs" });
    if (route[0] === "expenses") return await handleExpenses(request, route);
    if (route[0] === "checklist") return await handleChecklist(request, route);
    if (route[0] === "receipts") return await handleReceipts(request, route);
    return json({ error: "接口不存在" }, 404);
  } catch (error) {
    console.error("trip-data", error);
    return json({ error: "共享数据服务暂时不可用" }, 500);
  }
}

export const config = { path: "/api/trip-data/*" };
