import { chromium } from "playwright-core";

const browser = await chromium.launch({
  headless: true,
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  args: ["--disable-dev-shm-usage"],
});
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  timezoneId: "Asia/Shanghai",
  locale: "zh-CN",
  geolocation: { longitude: 87.6177, latitude: 43.7928, accuracy: 18 },
  permissions: ["geolocation"],
});
const page = await context.newPage();
const errors = [];
page.on("pageerror", (error) => errors.push(`page: ${error.message}`));
page.on("response", (response) => {
  if (response.status() >= 400 && !response.url().includes("/.well-known/") && !response.url().endsWith("/favicon.ico")) {
    errors.push(`response-${response.status()}: ${response.url().replace(/([?&](?:key|jscode)=)[^&]+/g, "$1[redacted]")}`);
  }
});

await page.goto("http://localhost:43127", { waitUntil: "networkidle" });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: "networkidle" });
await page.locator(".bottom-nav button").nth(2).click();
await page.waitForFunction(() => Boolean(window.AMap) && Boolean(document.querySelector(".amap-canvas .amap-maps")), null, { timeout: 20_000 });
await page.locator(".map-dates button").nth(7).click();
await page.waitForTimeout(1200);
await page.getByRole("button", { name: "路线居中" }).click();

const beforeLocate = await page.evaluate(() => {
  const card = document.querySelector(".map-info").getBoundingClientRect();
  const mapPage = document.querySelector(".map-page").getBoundingClientRect();
  return {
    amapLoaded: Boolean(window.AMap),
    mapsDom: Boolean(document.querySelector(".amap-canvas .amap-maps")),
    allMarkers: document.querySelectorAll(".amap-route-dot").length,
    currentMarkers: document.querySelectorAll(".amap-route-dot.is-current").length,
    fitEnabled: !document.querySelector(".map-fit").disabled,
    locateEnabled: !document.querySelector(".map-actions button").disabled,
    cardBottomGap: Math.round(mapPage.bottom - card.bottom),
    cardHeight: Math.round(card.height),
    zoom: window.__BJTripMap?.getZoom(),
    center: window.__BJTripMap?.getCenter()?.toString(),
    markerRects: Array.from(document.querySelectorAll(".amap-route-dot")).slice(0, 5).map((marker) => {
      const rect = marker.getBoundingClientRect();
      return { x: Math.round(rect.x), y: Math.round(rect.y), current: marker.classList.contains("is-current") };
    }),
  };
});
await page.screenshot({ path: "/tmp/bj-amap-live.png", fullPage: false });

await page.getByRole("button", { name: "◎ 定位" }).click();
await page.waitForFunction(() => document.querySelector(".map-message")?.textContent?.includes("定位成功"), null, { timeout: 20_000 });
const locateMessage = await page.locator(".map-message").textContent();
const afterLocate = await page.evaluate(() => ({
  zoom: window.__BJTripMap?.getZoom(),
  center: window.__BJTripMap?.getCenter()?.toString(),
}));
await page.screenshot({ path: "/tmp/bj-amap-located.png", fullPage: false });

console.log(JSON.stringify({ beforeLocate, afterLocate, locateMessage, errors }, null, 2));
await browser.close();
if (errors.length || !beforeLocate.amapLoaded || !beforeLocate.mapsDom || beforeLocate.currentMarkers < 2 || !locateMessage?.includes("定位成功")) process.exitCode = 1;
