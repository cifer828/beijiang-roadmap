const { createServer } = require("node:http");
const { createHash } = require("node:crypto");
const cloudbase = require("@cloudbase/node-sdk");

const PORT = Number(process.env.PORT || 9000);
const TRIP_ID = "northern-xinjiang-2026";
const PEOPLE = new Set(["闫寒", "刘一帆", "张秋晨", "王晶"]);
const MAX_BODY_BYTES = 8 * 1024 * 1024;
const MAX_IMAGE_BYTES = 1.8 * 1024 * 1024;
const MAX_IMAGES = 3;

const app = cloudbase.init({ env: cloudbase.SYMBOL_CURRENT_ENV });
const db = app.database();
const expenses = db.collection("trip_expenses");
const states = db.collection("trip_state");

function json(res, status, value, extraHeaders = {}) {
  res.writeHead(status, { "content-type": "application/json; charset=utf-8", ...extraHeaders });
  res.end(JSON.stringify(value));
}

function setCors(req, res) {
  const allowed = (process.env.ALLOWED_ORIGIN || "*").split(",").map((value) => value.trim()).filter(Boolean);
  const origin = req.headers.origin;
  const selected = allowed.includes("*") ? "*" : origin && allowed.includes(origin) ? origin : allowed[0];
  if (selected) res.setHeader("access-control-allow-origin", selected);
  res.setHeader("access-control-allow-methods", "GET,PUT,POST,DELETE,OPTIONS");
  res.setHeader("access-control-allow-headers", "content-type");
  res.setHeader("access-control-max-age", "86400");
}

function requestPath(req) {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  return { url, pathname: url.pathname.replace(/^\/api(?=\/|$)/, "") || "/" };
}

function apiBase(req) {
  if (process.env.API_PUBLIC_BASE_URL) return process.env.API_PUBLIC_BASE_URL.replace(/\/$/, "");
  const proto = String(req.headers["x-forwarded-proto"] || "https").split(",")[0];
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const prefix = new URL(req.url, `http://${req.headers.host || "localhost"}`).pathname.startsWith("/api/") ? "/api" : "";
  return `${proto}://${host}${prefix}`;
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(Object.assign(new Error("请求内容超过 8MB"), { status: 413 }));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => {
      try { resolve(chunks.length ? JSON.parse(Buffer.concat(chunks).toString("utf8")) : {}); }
      catch { reject(Object.assign(new Error("JSON 格式无效"), { status: 400 })); }
    });
    req.on("error", reject);
  });
}

function safeId(value) {
  return typeof value === "string" && /^[a-zA-Z0-9_-]{1,80}$/.test(value);
}

function encodeFileID(fileID) {
  return Buffer.from(fileID, "utf8").toString("base64url");
}

function decodeFileID(value) {
  try { return Buffer.from(value, "base64url").toString("utf8"); }
  catch { return ""; }
}

function expenseForClient(doc, req) {
  const base = apiBase(req);
  return {
    id: doc._id || doc.id,
    title: doc.title,
    amountCents: doc.amountCents,
    paidBy: doc.paidBy,
    occurredAt: doc.occurredAt,
    note: doc.note || "",
    images: (doc.imageFileIDs || []).map((fileID) => `${base}/trips/${TRIP_ID}/files/${encodeFileID(fileID)}`),
  };
}

function parseExistingFileID(image, req) {
  if (typeof image !== "string" || image.startsWith("data:")) return null;
  try {
    const pathname = new URL(image, apiBase(req)).pathname.replace(/^\/api(?=\/|$)/, "");
    const match = pathname.match(/^\/trips\/northern-xinjiang-2026\/files\/([^/]+)$/);
    return match ? decodeFileID(match[1]) : null;
  } catch { return null; }
}

async function uploadImage(image, tripId, expenseId, index) {
  const match = /^data:image\/(?:jpeg|jpg|png|webp);base64,([a-zA-Z0-9+/=]+)$/.exec(image);
  if (!match) throw Object.assign(new Error("凭证图片格式无效"), { status: 400 });
  const buffer = Buffer.from(match[1], "base64");
  if (!buffer.length || buffer.length > MAX_IMAGE_BYTES) throw Object.assign(new Error("单张凭证图片不能超过 1.8MB"), { status: 413 });
  const digest = createHash("sha256").update(buffer).digest("hex").slice(0, 12);
  const cloudPath = `receipts/${tripId}/${expenseId}/${Date.now()}-${index}-${digest}.jpg`;
  const result = await app.uploadFile({ cloudPath, fileContent: buffer });
  if (!result.fileID) throw new Error("凭证上传失败");
  return result.fileID;
}

async function normalizeExpense(body, tripId, expenseId, req) {
  if (!body || typeof body !== "object") throw Object.assign(new Error("消费数据不能为空"), { status: 400 });
  if (typeof body.title !== "string" || !body.title.trim() || body.title.trim().length > 80) throw Object.assign(new Error("付款内容无效"), { status: 400 });
  if (!Number.isInteger(body.amountCents) || body.amountCents <= 0 || body.amountCents > 100_000_000) throw Object.assign(new Error("金额无效"), { status: 400 });
  if (!PEOPLE.has(body.paidBy)) throw Object.assign(new Error("付款人无效"), { status: 400 });
  if (typeof body.occurredAt !== "string" || body.occurredAt.length > 32) throw Object.assign(new Error("消费时间无效"), { status: 400 });
  const inputImages = Array.isArray(body.images) ? body.images.slice(0, MAX_IMAGES) : [];
  const imageFileIDs = [];
  for (let index = 0; index < inputImages.length; index += 1) {
    const existing = parseExistingFileID(inputImages[index], req);
    if (existing) imageFileIDs.push(existing);
    else imageFileIDs.push(await uploadImage(inputImages[index], tripId, expenseId, index));
  }
  return {
    tripId,
    title: body.title.trim(),
    amountCents: body.amountCents,
    paidBy: body.paidBy,
    occurredAt: body.occurredAt,
    note: typeof body.note === "string" ? body.note.trim().slice(0, 500) : "",
    imageFileIDs,
    updatedAt: new Date().toISOString(),
  };
}

async function deleteFiles(fileIDs) {
  if (!fileIDs?.length) return;
  try { await app.deleteFile({ fileList: fileIDs }); }
  catch (error) { console.error("delete receipt files failed", error); }
}

async function proxyAmap(req, res, url, pathname) {
  const jscode = process.env.AMAP_SECURITY_JSCODE;
  if (!jscode) return json(res, 503, { status: "0", info: "AMAP_SECURITY_JSCODE 未配置" });
  const suffix = pathname.replace(/^\/amap\/?/, "");
  const target = new URL(`https://restapi.amap.com/${suffix}`);
  url.searchParams.forEach((value, key) => target.searchParams.set(key, value));
  target.searchParams.set("jscode", jscode);
  const response = await fetch(target, { method: req.method, headers: { accept: req.headers.accept || "application/json" } });
  res.writeHead(response.status, { "content-type": response.headers.get("content-type") || "application/json", "cache-control": "no-store" });
  res.end(Buffer.from(await response.arrayBuffer()));
}

async function handle(req, res) {
  setCors(req, res);
  if (req.method === "OPTIONS") { res.writeHead(204); res.end(); return; }
  const { url, pathname } = requestPath(req);
  if (pathname === "/health" && req.method === "GET") return json(res, 200, { ok: true, tripId: TRIP_ID });
  if (pathname.startsWith("/amap/")) return proxyAmap(req, res, url, pathname);

  const checklistMatch = pathname.match(/^\/trips\/([^/]+)\/checklist$/);
  if (checklistMatch) {
    const tripId = checklistMatch[1];
    if (tripId !== TRIP_ID) return json(res, 404, { error: "行程不存在" });
    if (req.method === "GET") {
      const result = await states.doc(tripId).get();
      return json(res, 200, result.data?.[0]?.checklist || {});
    }
    if (req.method === "PUT") {
      const body = await readJson(req);
      const checklist = Object.fromEntries(Object.entries(body).filter(([key, value]) => safeId(key) && typeof value === "boolean").slice(0, 100));
      await states.doc(tripId).set({ checklist, updatedAt: new Date().toISOString() });
      return json(res, 200, checklist);
    }
  }

  const expenseListMatch = pathname.match(/^\/trips\/([^/]+)\/expenses$/);
  if (expenseListMatch && req.method === "GET") {
    const tripId = expenseListMatch[1];
    if (tripId !== TRIP_ID) return json(res, 404, { error: "行程不存在" });
    const result = await expenses.where({ tripId }).get();
    const list = (result.data || []).sort((a, b) => String(b.occurredAt).localeCompare(String(a.occurredAt))).map((doc) => expenseForClient(doc, req));
    return json(res, 200, list, { "cache-control": "no-store" });
  }

  const expenseMatch = pathname.match(/^\/trips\/([^/]+)\/expenses\/([^/]+)$/);
  if (expenseMatch) {
    const [, tripId, expenseId] = expenseMatch;
    if (tripId !== TRIP_ID || !safeId(expenseId)) return json(res, 404, { error: "消费不存在" });
    if (req.method === "PUT") {
      const old = await expenses.doc(expenseId).get();
      const oldFileIDs = old.data?.[0]?.imageFileIDs || [];
      const value = await normalizeExpense(await readJson(req), tripId, expenseId, req);
      await expenses.doc(expenseId).set(value);
      await deleteFiles(oldFileIDs.filter((fileID) => !value.imageFileIDs.includes(fileID)));
      return json(res, 200, expenseForClient({ _id: expenseId, ...value }, req));
    }
    if (req.method === "DELETE") {
      const old = await expenses.doc(expenseId).get();
      await expenses.doc(expenseId).remove();
      await deleteFiles(old.data?.[0]?.imageFileIDs || []);
      return json(res, 200, { ok: true });
    }
  }

  const fileMatch = pathname.match(/^\/trips\/([^/]+)\/files\/([^/]+)$/);
  if (fileMatch && req.method === "GET") {
    const [, tripId, encoded] = fileMatch;
    const fileID = decodeFileID(encoded);
    if (tripId !== TRIP_ID || !fileID.startsWith("cloud://") || !fileID.includes(`/receipts/${tripId}/`)) return json(res, 404, { error: "凭证不存在" });
    const result = await app.getTempFileURL({ fileList: [{ fileID, maxAge: 3600 }] });
    const target = result.fileList?.[0]?.tempFileURL;
    if (!target) return json(res, 404, { error: "凭证不存在" });
    res.writeHead(302, { location: target, "cache-control": "private, max-age=300" });
    res.end();
    return;
  }

  return json(res, 404, { error: "接口不存在" });
}

createServer((req, res) => {
  handle(req, res).catch((error) => {
    console.error(error);
    if (!res.headersSent) json(res, error.status || 500, { error: error.status ? error.message : "服务器暂时不可用" });
    else res.end();
  });
}).listen(PORT, "0.0.0.0", () => console.log(`trip-api listening on ${PORT}`));
