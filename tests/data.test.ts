import { describe, expect, it } from "vitest";
import { DAYS, POINTS, SIGHTS, amapAppMarker, amapMarker, navigationTarget } from "../lib/data";

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

  it("当天入口只打开终点标注，不预设驾车路线或导航", () => {
    const destination = DAYS[0].routePoints.at(-1)!;
    const link = amapMarker(destination)!;
    expect(link).toContain(`position=${destination.lng},${destination.lat}`);
    expect(link).toContain(`name=${encodeURIComponent(destination.name)}`);
    expect(link).not.toContain("/navigation");
    expect(link).not.toContain("mode=car");
    expect(link).not.toContain("/navi");
  });

  it("手机端使用 App 地图标注 Scheme，只填充地点且不进入导航", () => {
    const destination = DAYS[0].routePoints.at(-1)!;
    const marker = amapMarker(destination)!;
    const ios = amapAppMarker(marker, "ios")!;
    const android = amapAppMarker(marker, "android")!;
    for (const link of [ios, android]) {
      expect(link).toContain("://viewMap?");
      expect(link).toContain(`poiname=${encodeURIComponent(destination.name)}`);
      expect(link).toContain(`lat=${destination.lat}`);
      expect(link).toContain(`lon=${destination.lng}`);
      expect(link).toContain("dev=0");
      expect(link).not.toContain("/navi");
      expect(link).not.toContain("/route");
    }
    expect(ios.startsWith("iosamap://")).toBe(true);
    expect(android.startsWith("androidamap://")).toBe(true);
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

  it("补充三笔住宿订单的房间数量和总金额", () => {
    const hotels = DAYS.flatMap((day) => day.hotels);
    expect(hotels.find((hotel) => hotel.id === "altay")).toMatchObject({ room: "大床房 2 间", amount: "¥798（¥399 × 2 间）" });
    expect(hotels.find((hotel) => hotel.id === "baihaba")).toMatchObject({ room: "客房 2 间", amount: "¥1,904（¥957 + ¥947）" });
    expect(hotels.find((hotel) => hotel.id === "buerjin")).toMatchObject({ room: "库米拉·独栋木屋家庭房 1 间（4 人入住，含早）", amount: "¥947" });
  });
});
