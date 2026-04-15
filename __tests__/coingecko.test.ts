import { formatPrice, formatMarketCap } from "@/lib/coingecko";

describe("formatPrice", () => {
  it("formats prices >= 1 with 2 decimal places", () => {
    expect(formatPrice(50000)).toBe("$50,000.00");
    expect(formatPrice(1.5)).toBe("$1.50");
    expect(formatPrice(1)).toBe("$1.00");
  });

  it("formats prices < 1 with more decimal places", () => {
    expect(formatPrice(0.0005)).toContain("$");
    expect(formatPrice(0.0005)).toContain("0.0005");
  });

  it("formats zero correctly", () => {
    expect(formatPrice(0)).toContain("$");
    expect(formatPrice(0)).toContain("0.000");
  });

  it("supports multiple currencies", () => {
    expect(formatPrice(10, "eur")).toContain("€");
    expect(formatPrice(10, "gbp")).toContain("£");
  });
});

describe("formatMarketCap", () => {
  it("formats large values compactly", () => {
    expect(formatMarketCap(1_000_000_000_000)).toContain("$");
    expect(formatMarketCap(1_000_000_000_000)).toMatch(/[TMB]/i);
  });

  it("formats standard values with decimals", () => {
    expect(formatMarketCap(999)).toContain("999");
    expect(formatMarketCap(999)).toContain("$");
  });

  it("supports multiple currencies", () => {
    expect(formatMarketCap(1_000_000, "eur")).toContain("€");
    expect(formatMarketCap(1_000_000, "gbp")).toContain("£");
  });
});
