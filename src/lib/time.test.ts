import { describe, expect, it, vi, afterEach } from "vitest";
import { timeAgo, getOrdinalSuffix } from "./time";

describe("timeAgo", () => {
  afterEach(() => vi.useRealTimers());

  it("returns 'now' for very recent dates", () => {
    expect(timeAgo(new Date().toISOString())).toBe("now");
  });

  it("returns minutes", () => {
    vi.useFakeTimers();
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    expect(timeAgo(fiveMinAgo)).toBe("5m");
    vi.useRealTimers();
  });

  it("returns hours", () => {
    vi.useFakeTimers();
    const twoHoursAgo = new Date(Date.now() - 2 * 3600 * 1000).toISOString();
    expect(timeAgo(twoHoursAgo)).toBe("2h");
    vi.useRealTimers();
  });

  it("returns days", () => {
    vi.useFakeTimers();
    const threeDaysAgo = new Date(Date.now() - 3 * 86400 * 1000).toISOString();
    expect(timeAgo(threeDaysAgo)).toBe("3d");
    vi.useRealTimers();
  });

  it("returns weeks", () => {
    vi.useFakeTimers();
    const twoWeeksAgo = new Date(Date.now() - 14 * 86400 * 1000).toISOString();
    expect(timeAgo(twoWeeksAgo)).toBe("2w");
    vi.useRealTimers();
  });

  it("returns months", () => {
    vi.useFakeTimers();
    const twoMonthsAgo = new Date(Date.now() - 60 * 86400 * 1000).toISOString();
    expect(timeAgo(twoMonthsAgo)).toBe("2mo");
    vi.useRealTimers();
  });

  it("returns years", () => {
    vi.useFakeTimers();
    const twoYearsAgo = new Date(Date.now() - 730 * 86400 * 1000).toISOString();
    expect(timeAgo(twoYearsAgo)).toBe("2y");
    vi.useRealTimers();
  });
});

describe("getOrdinalSuffix", () => {
  it("returns 'st' for 1, 21, 31", () => {
    expect(getOrdinalSuffix(1)).toBe("st");
    expect(getOrdinalSuffix(21)).toBe("st");
    expect(getOrdinalSuffix(31)).toBe("st");
  });

  it("returns 'nd' for 2, 22", () => {
    expect(getOrdinalSuffix(2)).toBe("nd");
    expect(getOrdinalSuffix(22)).toBe("nd");
  });

  it("returns 'rd' for 3, 23", () => {
    expect(getOrdinalSuffix(3)).toBe("rd");
    expect(getOrdinalSuffix(23)).toBe("rd");
  });

  it("returns 'th' for everything else", () => {
    expect(getOrdinalSuffix(4)).toBe("th");
    expect(getOrdinalSuffix(11)).toBe("th");
    expect(getOrdinalSuffix(12)).toBe("th");
    expect(getOrdinalSuffix(13)).toBe("th");
    expect(getOrdinalSuffix(14)).toBe("th");
    expect(getOrdinalSuffix(20)).toBe("th");
    expect(getOrdinalSuffix(30)).toBe("th");
  });
});
