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
});

describe("formatMarketCap", () => {
  it("formats trillions correctly", () => {
    expect(formatMarketCap(1_000_000_000_000)).toBe("$1.00T");
    expect(formatMarketCap(2_500_000_000_000)).toBe("$2.50T");
  });

  it("formats billions correctly", () => {
    expect(formatMarketCap(1_000_000_000)).toBe("$1.00B");
    expect(formatMarketCap(500_000_000)).toBe("$500.00M"); // 500M is shown as millions, not 0.50B
  });

  it("formats millions correctly", () => {
    expect(formatMarketCap(1_000_000)).toBe("$1.00M");
    expect(formatMarketCap(250_000_000)).toBe("$250.00M");
  });

  it("formats small values correctly", () => {
    expect(formatMarketCap(999)).toBe("$999.00");
  });
});
