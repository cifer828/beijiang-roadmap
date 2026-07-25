import { describe, expect, it } from "vitest";
import { DAYS, POINTS, SIGHTS, amapAppMarker, amapMarker, navigationTarget } from "../lib/data";

describe("迁移数据完整性", () => {
  it("包含 11 天、22 个景点，并只为已核对落点生成兼容导航", () => {
    expect(DAYS).toHaveLength(11);
    expect(Object.keys(SIGHTS)).toHaveLength(22);
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
    expect(POINTS.tangbula).toMatchObject({ lng: 83.694597, lat: 43.691251 });
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

  it("新订单替换 10 月 2—4 日住宿，10 月 6 日只保留已选全季", () => {
    for (const day of DAYS.filter((item) => item.id >= "2026-10-02" && item.id <= "2026-10-04")) {
      expect(day.hotels).toHaveLength(1);
      expect(day.hotels[0].status).toBe("已预订");
    }
    const october6 = DAYS.find((day) => day.id === "2026-10-06")!;
    expect(october6.hotels).toHaveLength(1);
    expect(october6.hotels[0]).toMatchObject({ id: "teks", status: "已预订 · 已选定" });
    expect(october6.todos.some((todo) => todo.title.includes("取消另一间"))).toBe(false);
  });

  it("完整录入三晚最新酒店订单、金额与房型已知状态", () => {
    const hotels = DAYS.flatMap((day) => day.hotels);
    expect(hotels.find((hotel) => hotel.id === "jiadengyu-jinmeijia")).toMatchObject({
      amount: "¥1,074.34（¥550 + ¥524.34）",
      order: "1128149533658416 / 1128149533633452",
    });
    expect(hotels.find((hotel) => hotel.id === "buerjin-zhefei")).toMatchObject({
      amount: "¥1,202（另使用积分抵扣 ¥22）",
      order: "1128149551951752",
    });
    expect(hotels.find((hotel) => hotel.id === "bole-ji")).toMatchObject({
      room: "高级大床房 2 间",
      amount: "¥701.62",
      order: "入住码 DFW22L",
    });
    expect(hotels.find((hotel) => hotel.id === "altay")?.receipts).toBeUndefined();
    expect(hotels.flatMap((hotel) => hotel.receipts ?? [])).toHaveLength(10);
  });

  it("按最新计划保留 10 月 2—8 日关键自驾时长", () => {
    expect(DAYS.find((day) => day.id === "2026-10-01")?.drive).toContain("禾木区间车约 1 小时");
    expect(DAYS.find((day) => day.id === "2026-10-02")?.drive).toContain("区间车约 3 小时");
    expect(DAYS.find((day) => day.id === "2026-10-03")?.drive).toContain("区间车往返约 2 小时");
    expect(DAYS.find((day) => day.id === "2026-10-04")?.drive).toContain("直达约 8 小时");
    expect(DAYS.find((day) => day.id === "2026-10-05")?.route).toContain("博乐");
    expect(DAYS.find((day) => day.id === "2026-10-06")?.title).toContain("阔克苏");
    expect(DAYS.find((day) => day.id === "2026-10-07")?.sightIds).toContain("tangbula");
    expect(DAYS.find((day) => day.id === "2026-10-08")?.todos.some((todo) => todo.title.includes("独库公路"))).toBe(true);
  });
});
