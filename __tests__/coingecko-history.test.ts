import {
  TIMEFRAME_TO_DAYS,
  buildSparklineHistory,
  formatTimeframeLabel,
} from "@/lib/coingecko";

describe("TIMEFRAME_TO_DAYS", () => {
  it("maps supported timeframes to CoinGecko days", () => {
    expect(TIMEFRAME_TO_DAYS).toEqual({
      "1D": "1",
      "7D": "7",
      "30D": "30",
      "1Y": "365",
    });
  });
});

describe("buildSparklineHistory", () => {
  it("converts price arrays into timestamped history points", () => {
    const nowSpy = jest.spyOn(Date, "now").mockReturnValue(1_000_000);

    expect(buildSparklineHistory([10, 20, 30], "1D")).toEqual([
      { price: 10, timestamp: -85_400_000 },
      { price: 20, timestamp: -42_200_000 },
      { price: 30, timestamp: 1_000_000 },
    ]);

    nowSpy.mockRestore();
  });
});

describe("formatTimeframeLabel", () => {
  it("formats intraday labels with time", () => {
    expect(
      formatTimeframeLabel(Date.UTC(2026, 3, 15, 13, 5), "1D"),
    ).toMatch(/:05/);
  });

  it("formats yearly labels with month and year", () => {
    expect(formatTimeframeLabel(Date.UTC(2026, 3, 15), "1Y")).toContain("Apr");
  });
});
