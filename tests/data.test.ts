import { describe, expect, it } from "vitest";
import { DAYS, POINTS, SIGHTS, amapDeepLink, amapMarker, amapNavigation, mobileAmapPlatform, navigationTarget } from "../lib/data";

describe("迁移数据完整性", () => {
  it("包含 11 天、21 个景点，并只为已核对落点生成兼容导航", () => {
    expect(DAYS).toHaveLength(11);
    expect(Object.keys(SIGHTS)).toHaveLength(21);
    for (const sight of Object.values(SIGHTS)) {
      const target = navigationTarget(sight);
      const link = amapMarker(sight);
      if (!target) {
        expect(link).toBeNull();
        continue;
      }
      expect(link).toContain(`position=${target.lng},${target.lat}`);
      expect(link).toContain(`name=${encodeURIComponent(target.name)}`);
      expect(link).toContain("src=beijiang-trip&coordinate=gaode&callnative=1");
    }
    for (const day of DAYS) {
      for (const item of day.timeline.filter((entry) => entry.point)) {
        const target = navigationTarget(item.point!);
        const link = amapMarker(item.point!);
        if (target) expect(link).toContain(`position=${target.lng},${target.lat}`);
        else expect(link).toBeNull();
      }
      for (const hotel of day.hotels) {
        expect(amapMarker(hotel)).toContain(`position=${hotel.lng},${hotel.lat}`);
      }
    }
  });

  it("修复已知错误景点坐标，并隐藏没有唯一可靠落点的按钮", () => {
    expect(POINTS.ulungur).toMatchObject({ lng: 87.412829, lat: 47.244158 });
    expect(POINTS.fish).toMatchObject({ lng: 86.993546, lat: 48.72665 });
    expect(POINTS.baihaba).toMatchObject({ lng: 86.783596, lat: 48.695717 });
    expect(POINTS.wucaitan).toMatchObject({ lng: 86.680702, lat: 47.837537 });
    expect(POINTS.ghost).toMatchObject({ lng: 85.733205, lat: 46.135149 });
    expect(amapMarker(POINTS.ahe)).toBeNull();
    expect(amapMarker(POINTS.kalajun)).toBeNull();
  });

  it("当天路线使用可在内置浏览器回落的高德链接", () => {
    const link = amapNavigation(DAYS[0].routePoints);
    expect(link).toContain("src=beijiang-trip&coordinate=gaode&callnative=1");
    expect(link).toContain(`from=${DAYS[0].routePoints[0].lng},${DAYS[0].routePoints[0].lat}`);
    expect(link).toContain(`to=${DAYS[0].routePoints.at(-1)!.lng},${DAYS[0].routePoints.at(-1)!.lat}`);
  });

  it("手机端导航按钮生成高德 App 的 iOS/Android Scheme", () => {
    const marker = amapMarker(POINTS.sayram)!;
    expect(amapDeepLink(marker, "ios")).toContain("iosamap://navi?sourceApplication=beijiang-trip");
    expect(amapDeepLink(marker, "android")).toContain("androidamap://navi?sourceApplication=beijiang-trip");
    expect(amapDeepLink(marker, "ios")).toContain(`lat=${navigationTarget(POINTS.sayram)!.lat}`);

    const route = amapNavigation(DAYS[0].routePoints);
    expect(amapDeepLink(route, "ios")).toContain("iosamap://path?");
    expect(amapDeepLink(route, "android")).toContain("amapuri://route/plan/?");
    expect(mobileAmapPlatform("Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)")).toBe("ios");
    expect(mobileAmapPlatform("Mozilla/5.0 (Linux; Android 15; Pixel 9)")).toBe("android");
  });

  it("10 月 3 日至 8 日住宿全部保留待确认状态且 10 月 6 日双方案并存", () => {
    for (const day of DAYS.filter((item) => item.id >= "2026-10-03" && item.id <= "2026-10-08")) {
      expect(day.hotels.length).toBeGreaterThan(0);
      for (const hotel of day.hotels) expect(hotel.status).toBe("保底预订 · 待确认");
    }
    const october6 = DAYS.find((day) => day.id === "2026-10-06")!;
    expect(october6.hotels.map((hotel) => hotel.plan)).toEqual(["Plan A", "Plan B"]);
    expect(october6.todos.some((todo) => todo.title.includes("取消另一间"))).toBe(true);
  });
});
