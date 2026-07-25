import { chromium } from "playwright-core";

const baseURL = process.env.BASE_URL || "http://localhost:43128";
const iterations = Number(process.env.MAP_TOGGLE_COUNT || 12);
const failFirstLoad = process.env.MAP_FAIL_ONCE === "1";
const browserArgs = ["--disable-dev-shm-usage", process.env.BROWSER_PROXY ? `--proxy-server=${process.env.BROWSER_PROXY}` : "--no-proxy-server"];
const browser = await chromium.launch({
  headless: true,
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  args: browserArgs,
});
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
  locale: "zh-CN",
  timezoneId: "Asia/Shanghai",
  userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1",
});
const page = await context.newPage();
const errors = [];
let blockedFirstLoad = false;
let retryObserved = false;

if (failFirstLoad) {
  await page.route("https://webapi.amap.com/maps?*", async (route) => {
    if (!blockedFirstLoad) {
      blockedFirstLoad = true;
      await route.abort("failed");
      return;
    }
    await route.continue();
  });
}

page.on("console", (message) => {
  if (
    message.type() === "error"
    && !message.text().includes("favicon")
    && !(failFirstLoad && message.text().includes("ERR_FAILED"))
  ) errors.push(message.text().replace(/https?:\/\/[^ "'?]+[^\s"']*/g, "[url]"));
});
page.on("pageerror", (error) => {
  // 高德 2D 图层在 Chrome 的 iPhone 仿真环境会抛出这一条内部 WebGL 探测错误，
  // 随后会正常回退到单个 2D canvas；下方仍会逐轮检查实际地图 DOM。
  if (error.message.includes("U.Module.WebGLRender is not a constructor")) return;
  errors.push((error.stack || error.message).replace(/https?:\/\/[^ "'?]+[^\s"']*/g, "[url]"));
});

try {
  await page.goto(baseURL, { waitUntil: "networkidle" });
  const snapshots = [];
  for (let iteration = 1; iteration <= iterations; iteration += 1) {
    await page.locator(".bottom-nav button").nth(2).evaluate((button) => button.click());
    if (failFirstLoad && iteration === 1) {
      const retry = page.getByRole("button", { name: "重新加载地图", exact: true });
      await retry.waitFor({ state: "visible", timeout: 5_000 });
      retryObserved = true;
      await retry.click();
    }
    await page.locator(".amap-canvas").waitFor({ state: "visible", timeout: 16_000 });
    await page.waitForFunction(() => (document.querySelector(".amap-canvas")?.childElementCount ?? 0) > 0, null, { timeout: 8_000 });
    snapshots.push(await page.evaluate((count) => ({
      iteration: count,
      mapCanvas: document.querySelectorAll(".amap-canvas").length,
      fallback: document.querySelectorAll(".map-fallback").length,
      mapChildren: document.querySelector(".amap-canvas")?.childElementCount ?? 0,
      canvases: document.querySelectorAll("canvas").length,
    }), iteration));
    await page.locator(".bottom-nav button").nth(0).evaluate((button) => button.click());
    await page.locator(".map-page").waitFor({ state: "hidden", timeout: 3_000 });
  }
  console.log(JSON.stringify({ baseURL, iterations, failFirstLoad, retryObserved, snapshots, errors }, null, 2));
  if (errors.length || (failFirstLoad && !retryObserved) || snapshots.some((item) => item.mapCanvas !== 1 || item.fallback !== 0 || item.mapChildren === 0)) process.exitCode = 1;
} finally {
  await browser.close();
}
