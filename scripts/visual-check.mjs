import { chromium } from "playwright-core";
import fs from "node:fs/promises";

const baseURL = process.env.BASE_URL || "http://localhost:43127";
const output = process.env.OUTPUT_DIR || "/tmp/bj-roadtrip-visual";
await fs.mkdir(output, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  args: ["--disable-dev-shm-usage"],
});
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, locale: "zh-CN", timezoneId: "Asia/Shanghai" });
const page = await context.newPage();
const errors = [];
page.on("console", (message) => {
  if (message.type() === "error" && !message.text().includes("Failed to load resource: the server responded with a status of 404")) errors.push(`console: ${message.text()}`);
});
page.on("pageerror", (error) => errors.push(`page: ${error.message}`));
page.on("response", (response) => {
  if (response.status() >= 400 && !response.url().includes("/.well-known/") && !response.url().endsWith("/favicon.ico")) errors.push(`response-${response.status()}: ${response.url()}`);
});

await page.goto(baseURL, { waitUntil: "networkidle" });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: "networkidle" });
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
    const image = cards.nth(i).locator("img");
    if (await image.count()) {
      await image.evaluate((img) => img.complete || new Promise((resolve) => { const timer = setTimeout(resolve, 2000); img.addEventListener("load", () => { clearTimeout(timer); resolve(true); }, { once: true }); img.addEventListener("error", () => { clearTimeout(timer); resolve(false); }, { once: true }); }));
      const ok = await image.evaluate((img) => img.naturalWidth > 0);
      if (!ok) errors.push(`image: ${await image.getAttribute("src")}`);
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

await selectDay(3);
const kanas = page.locator(".sight-card").filter({ has: page.getByRole("heading", { name: "喀纳斯湖", exact: true }) });
await kanas.scrollIntoViewIfNeeded();
await kanas.click({ position: { x: 170, y: 70 } });
await page.waitForTimeout(100);
await shot("07-kanas-expanded");

await selectDay(7);
await page.getByText("今晚住宿", { exact: true }).scrollIntoViewIfNeeded();
await shot("08-day-1006-hotels-a");
await page.locator(".hotel-card").nth(1).scrollIntoViewIfNeeded();
await shot("09-day-1006-hotels-b");
await page.getByText("全部待办", { exact: true }).scrollIntoViewIfNeeded();
await shot("10-day-1006-todos");

await page.locator(".bottom-nav button").nth(1).click();
await shot("11-trip-top");
await page.locator(".rental-card").scrollIntoViewIfNeeded();
await shot("12-trip-bottom");

await page.locator(".bottom-nav button").nth(2).click();
await shot("13-map-fallback");

await page.locator(".bottom-nav button").nth(3).click();
await shot("14-checklist-top");
await page.locator(".last-day-card").scrollIntoViewIfNeeded();
await shot("15-checklist-bottom");

await page.locator(".bottom-nav button").nth(4).click();
await shot("16-ledger-identity");
await page.getByRole("button", { name: "王晶 张秋晨 · 王晶", exact: true }).click();
await shot("17-ledger-settlement");
const total = await page.locator(".ledger-hero strong").textContent();
const transfer = await page.locator(".transfer").textContent();
if (!total?.includes("5,760.19")) errors.push(`ledger-total: ${total}`);
if (!transfer?.includes("319.91") || !transfer.includes("闫寒 · 刘一帆") || !transfer.includes("张秋晨 · 王晶")) errors.push(`ledger-transfer: ${transfer}`);
await page.getByRole("button", { name: "＋ 记一笔" }).click();
await shot("18-ledger-new-expense");

const layout = await page.evaluate(() => ({
  viewport: document.documentElement.clientWidth,
  scrollWidth: document.documentElement.scrollWidth,
  navBottom: Math.round(document.querySelector(".bottom-nav").getBoundingClientRect().bottom),
  navHeight: Math.round(document.querySelector(".bottom-nav").getBoundingClientRect().height),
}));
if (layout.scrollWidth > layout.viewport) errors.push(`horizontal-overflow: ${JSON.stringify(layout)}`);
if (layout.navBottom !== 844 || layout.navHeight < 70) errors.push(`bottom-nav: ${JSON.stringify(layout)}`);

await fs.writeFile(`${output}/report.json`, JSON.stringify({ baseURL, screenshots: 18, layout, errors }, null, 2));
console.log(JSON.stringify({ output, screenshots: 18, layout, errors }, null, 2));
await browser.close();
if (errors.length) process.exitCode = 1;
