import { describe, it, expect } from "vitest";
import { formatBytes, formatMs, statusColor, statusBgColor } from "./utils";

describe("formatBytes", () => {
  it("returns bytes for values under 1024", () => {
    expect(formatBytes(0)).toBe("0 B");
    expect(formatBytes(512)).toBe("512 B");
    expect(formatBytes(1023)).toBe("1023 B");
  });

  it("returns KB for values under 1MB", () => {
    expect(formatBytes(1024)).toBe("1.0 KB");
    expect(formatBytes(1536)).toBe("1.5 KB");
  });

  it("returns MB for values 1MB and above", () => {
    expect(formatBytes(1024 * 1024)).toBe("1.0 MB");
    expect(formatBytes(2.5 * 1024 * 1024)).toBe("2.5 MB");
  });
});

describe("formatMs", () => {
  it("returns milliseconds for values under 1000", () => {
    expect(formatMs(0)).toBe("0 ms");
    expect(formatMs(500)).toBe("500 ms");
    expect(formatMs(999)).toBe("999 ms");
  });

  it("returns seconds for values 1000 and above", () => {
    expect(formatMs(1000)).toBe("1.00 s");
    expect(formatMs(1500)).toBe("1.50 s");
    expect(formatMs(12345)).toBe("12.35 s");
  });
});

describe("statusColor", () => {
  it("returns green for 2xx", () => {
    expect(statusColor(200)).toBe("text-green-400");
    expect(statusColor(299)).toBe("text-green-400");
  });

  it("returns yellow for 3xx", () => {
    expect(statusColor(301)).toBe("text-yellow-400");
    expect(statusColor(399)).toBe("text-yellow-400");
  });

  it("returns orange for 4xx", () => {
    expect(statusColor(404)).toBe("text-orange-400");
    expect(statusColor(499)).toBe("text-orange-400");
  });

  it("returns red for 5xx", () => {
    expect(statusColor(500)).toBe("text-red-400");
    expect(statusColor(503)).toBe("text-red-400");
  });
});

describe("statusBgColor", () => {
  it("returns correct bg classes per status range", () => {
    expect(statusBgColor(200)).toBe("bg-green-400/10 text-green-400");
    expect(statusBgColor(301)).toBe("bg-yellow-400/10 text-yellow-400");
    expect(statusBgColor(404)).toBe("bg-orange-400/10 text-orange-400");
    expect(statusBgColor(500)).toBe("bg-red-400/10 text-red-400");
  });
});
