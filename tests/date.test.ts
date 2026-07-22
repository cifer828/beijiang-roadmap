import { describe, expect, it } from "vitest";
import { beijingDate, defaultTripDate } from "../lib/date";

describe("北京时间行程日期", () => {
  it("按 Asia/Shanghai 跨日", () => {
    expect(beijingDate(new Date("2026-09-28T16:30:00Z"))).toBe("2026-09-29");
  });
  it("行程前、行程中、行程后选择正确日期", () => {
    expect(defaultTripDate(new Date("2026-07-21T00:00:00Z"))).toBe("2026-09-29");
    expect(defaultTripDate(new Date("2026-10-04T04:00:00Z"))).toBe("2026-10-04");
    expect(defaultTripDate(new Date("2026-11-01T00:00:00Z"))).toBe("2026-10-09");
  });
});
