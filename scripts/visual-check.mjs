import { chromium } from "playwright-core";
import fs from "node:fs/promises";
import path from "node:path";

const baseURL = process.env.BASE_URL || "http://localhost:43127";
const output = process.env.OUTPUT_DIR || "/tmp/bj-roadtrip-visual";
const browserArgs = ["--disable-dev-shm-usage", process.env.BROWSER_PROXY ? `--proxy-server=${process.env.BROWSER_PROXY}` : "--no-proxy-server"];
await fs.mkdir(output, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  args: browserArgs,
});
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, locale: "zh-CN", timezoneId: "Asia/Shanghai" });
const page = await context.newPage();
const errors = [];
const localPreview = new URL(baseURL).hostname === "127.0.0.1";
page.on("console", (message) => {
  if (message.type() === "error" && !message.text().includes("Failed to load resource: the server responded with a status of 404")) errors.push(`console: ${message.text()}`);
});
page.on("pageerror", (error) => errors.push(`page: ${error.message}`));
page.on("response", (response) => {
  const localReceipt = localPreview && response.url().includes("/api/trip-data/receipts/");
  if (response.status() >= 400 && !localReceipt && !response.url().includes("/.well-known/") && !response.url().endsWith("/favicon.ico")) errors.push(`response-${response.status()}: ${response.url()}`);
});

await page.goto(baseURL, { waitUntil: "domcontentloaded", timeout: 60_000 });
await page.locator(".bottom-nav").waitFor({ state: "visible", timeout: 30_000 });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: "domcontentloaded", timeout: 60_000 });
await page.locator(".bottom-nav").waitFor({ state: "visible", timeout: 30_000 });
await page.evaluate(() => { document.documentElement.style.scrollBehavior = "auto"; });

const shot = (name) => page.screenshot({ path: `${output}/${name}.png`, fullPage: false });
const selectDay = async (index) => {
  await page.locator(".date-strip button").nth(index).click();
  await page.waitForTimeout(120);
};
const loadCards = async () => {
  const cards = page.locator(".sight-card, .hotel-card");
  for (let i = 0; i < await cards.count(); i++) {
    await cards.nth(i).evaluate((element) => element.scrollIntoView({ block: "center" }));
    await page.waitForTimeout(80);
    const images = cards.nth(i).locator("img");
    for (let imageIndex = 0; imageIndex < await images.count(); imageIndex++) {
      const image = images.nth(imageIndex);
      const src = await image.getAttribute("src");
      const localReceipt = localPreview && src?.startsWith("/api/trip-data/receipts/");
      if (localReceipt) continue;
      await image.evaluate((img) => img.complete || new Promise((resolve) => { const timer = setTimeout(resolve, 2000); img.addEventListener("load", () => { clearTimeout(timer); resolve(true); }, { once: true }); img.addEventListener("error", () => { clearTimeout(timer); resolve(false); }, { once: true }); }));
      const ok = await image.evaluate((img) => img.naturalWidth > 0);
      if (!ok) errors.push(`image: ${src}`);
    }
  }
};

await shot("01-today-0929-top");
await page.getByText("今天怎么走", { exact: true }).scrollIntoViewIfNeeded();
await shot("02-today-0929-timeline");
await loadCards();
await page.getByText("全部待办", { exact: true }).scrollIntoViewIfNeeded();
await shot("03-today-0929-bottom");

for (let dayIndex = 0; dayIndex < 11; dayIndex++) {
  await selectDay(dayIndex);
  await loadCards();
  const links = page.locator("a[href*='uri.amap.com']");
  for (let i = 0; i < await links.count(); i++) {
    const href = await links.nth(i).getAttribute("href");
    if (!href || !href.includes("coordinate=gaode") || !href.includes("callnative=1") || (!href.includes("position=") && !href.includes("from="))) errors.push(`amap-link: ${href}`);
  }
}

await selectDay(2);
await page.evaluate(() => window.scrollTo(0, 0));
await shot("04-day-1001-top");
await page.getByText("全部景点", { exact: true }).scrollIntoViewIfNeeded();
await shot("05-day-1001-sights");
await page.getByText("今晚住宿", { exact: true }).scrollIntoViewIfNeeded();
await shot("06-day-1001-hotel");
await page.locator(".hotel-receipts").scrollIntoViewIfNeeded();
await shot("06b-day-1001-order");

await selectDay(3);
const kanas = page.locator(".sight-card").filter({ has: page.getByRole("heading", { name: "喀纳斯湖", exact: true }) });
await kanas.scrollIntoViewIfNeeded();
await kanas.click({ position: { x: 170, y: 70 } });
await page.waitForTimeout(100);
await shot("07-kanas-expanded");
await page.getByText("今晚住宿", { exact: true }).scrollIntoViewIfNeeded();
await shot("08-day-1002-jiadengyu-hotel");
await page.locator(".hotel-receipts").scrollIntoViewIfNeeded();
await shot("08b-day-1002-jiadengyu-orders");
const receiptPageCount = context.pages().length;
const receiptPageUrl = page.url();
await page.locator(".hotel-receipts button").first().click();
await page.locator(".image-lightbox").waitFor({ state: "visible" });
const hotelPreviewLoaded = await page.locator(".image-lightbox img").evaluate((image) => image.naturalWidth > 0);
if (!hotelPreviewLoaded) errors.push("hotel-receipt-preview: image did not load");
if (context.pages().length !== receiptPageCount || page.url() !== receiptPageUrl) errors.push("hotel-receipt-preview: opened a new page");
await shot("08c-day-1002-order-full");
await page.getByRole("button", { name: "关闭原图" }).click();

await selectDay(4);
await page.getByText("今晚住宿", { exact: true }).scrollIntoViewIfNeeded();
await shot("09-day-1003-buerjin-hotel");
await page.locator(".hotel-receipts").scrollIntoViewIfNeeded();
await shot("09b-day-1003-buerjin-order");

await selectDay(5);
await page.getByText("今晚住宿", { exact: true }).scrollIntoViewIfNeeded();
await shot("10-day-1004-bole-hotel");
await page.locator(".hotel-receipts").scrollIntoViewIfNeeded();
await shot("10b-day-1004-bole-order");

await selectDay(7);
await page.getByText("今晚住宿", { exact: true }).scrollIntoViewIfNeeded();
await shot("11-day-1006-hotel");
await page.locator(".hotel-receipts").scrollIntoViewIfNeeded();
await shot("11b-day-1006-order");
await page.getByText("全部待办", { exact: true }).scrollIntoViewIfNeeded();
await shot("12-day-1006-todos");

await selectDay(8);
await page.getByRole("heading", { name: "唐布拉草原", exact: true }).scrollIntoViewIfNeeded();
await shot("13-day-1007-tangbula");

await page.locator(".bottom-nav button").nth(1).click();
await shot("14-trip-top");
await page.locator(".rental-card").scrollIntoViewIfNeeded();
await shot("15-trip-bottom");

await page.locator(".bottom-nav button").nth(2).click();
await page.locator(".amap-canvas").waitFor({ state: "visible", timeout: 16_000 });
await page.waitForFunction(() => (document.querySelector(".amap-canvas")?.childElementCount ?? 0) > 0, null, { timeout: 8_000 });
const mapTimeChecks = ["航班日", "5—6 小时", "禾木区间车约 1 小时", "区间车约 3 小时", "区间车往返约 2 小时", "8.5 小时", "3.5 小时", "阔克苏往返另计", "5.5 小时", "7 小时", "还车 + 航班"];
for (let index = 0; index < mapTimeChecks.length; index++) {
  await page.locator(".map-dates button").nth(index).click();
  await page.waitForTimeout(80);
  const travelTime = await page.locator(".map-stats b").last().textContent();
  if (!travelTime?.includes(mapTimeChecks[index])) errors.push(`map-travel-time-${index}: ${travelTime}`);
  if (index >= 2 && index <= 4) await shot(`16-map-${["1001", "1002", "1003"][index - 2]}-time`);
}
await shot("16-map-route");

await page.locator(".bottom-nav button").nth(3).click();
await shot("17-checklist-top");
await page.locator(".last-day-card").scrollIntoViewIfNeeded();
await shot("18-checklist-bottom");

await page.locator(".bottom-nav button").nth(4).click();
await shot("19-ledger-identity");
await page.getByRole("button", { name: "王晶 张秋晨 · 王晶", exact: true }).click();
await shot("20-ledger-settlement");
const total = await page.locator(".ledger-hero strong").textContent();
const transfer = await page.locator(".transfer").textContent();
if (!total?.includes("10,295.53")) errors.push(`ledger-total: ${total}`);
if (!transfer?.includes("5,147.76") || !transfer.includes("闫寒 · 刘一帆") || !transfer.includes("张秋晨 · 王晶")) errors.push(`ledger-transfer: ${transfer}`);
await page.getByRole("button", { name: "＋ 记一笔" }).click();
await shot("21-ledger-new-expense");
await page.getByLabel("付款内容").fill("图片预览验收");
await page.getByLabel("金额").fill("1");
await page.locator(".expense-sheet input[type='file']").setInputFiles(path.resolve("public/images/share/og.png"));
await page.locator(".image-preview-open").waitFor({ state: "visible" });
await page.getByRole("button", { name: "保存并更新结算" }).click();

const imageExpense = page.locator(".expense-card").filter({ hasText: "图片预览验收" });
await imageExpense.waitFor({ state: "visible" });
await imageExpense.scrollIntoViewIfNeeded();
await imageExpense.locator(".receipt-images button").click();
await page.locator(".image-lightbox").waitFor({ state: "visible" });
const cardPreviewLoaded = await page.locator(".image-lightbox img").evaluate((image) => image.naturalWidth > 0);
if (!cardPreviewLoaded) errors.push("ledger-card-image-preview: image did not load");
await shot("22-ledger-card-image-full");
await page.getByRole("button", { name: "关闭原图" }).click();

await imageExpense.getByRole("button", { name: "修改" }).click();
await page.locator(".image-preview-open").click();
await page.locator(".image-lightbox").waitFor({ state: "visible" });
const editPreviewLoaded = await page.locator(".image-lightbox img").evaluate((image) => image.naturalWidth > 0);
if (!editPreviewLoaded) errors.push("ledger-edit-image-preview: image did not load");
await shot("23-ledger-edit-image-full");
await page.getByRole("button", { name: "关闭原图" }).click();
await page.locator(".sheet-close").click();

const layout = await page.evaluate(() => ({
  viewport: document.documentElement.clientWidth,
  scrollWidth: document.documentElement.scrollWidth,
  navBottom: Math.round(document.querySelector(".bottom-nav").getBoundingClientRect().bottom),
  navHeight: Math.round(document.querySelector(".bottom-nav").getBoundingClientRect().height),
}));
if (layout.scrollWidth > layout.viewport) errors.push(`horizontal-overflow: ${JSON.stringify(layout)}`);
if (layout.navBottom !== 844 || layout.navHeight < 70) errors.push(`bottom-nav: ${JSON.stringify(layout)}`);

const screenshots = (await fs.readdir(output)).filter((name) => name.endsWith(".png")).length;
await fs.writeFile(`${output}/report.json`, JSON.stringify({ baseURL, screenshots, layout, errors }, null, 2));
console.log(JSON.stringify({ output, screenshots, layout, errors }, null, 2));
await browser.close();
if (errors.length) process.exitCode = 1;
