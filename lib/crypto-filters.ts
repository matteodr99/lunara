import type { CryptoData } from "@/lib/coingecko";

export type CryptoTrendFilter = "all" | "gainers" | "losers";

export function filterCryptocurrencies(
  cryptos: CryptoData[],
  searchQuery: string,
  trendFilter: CryptoTrendFilter,
): CryptoData[] {
  const normalizedQuery = searchQuery.trim().toLowerCase();

  return cryptos.filter((coin) => {
    const matchesSearch =
      normalizedQuery.length === 0 ||
      coin.name.toLowerCase().includes(normalizedQuery) ||
      coin.symbol.toLowerCase().includes(normalizedQuery);

    const matchesTrend =
      trendFilter === "all" ||
      (trendFilter === "gainers" &&
        coin.price_change_percentage_24h >= 0) ||
      (trendFilter === "losers" && coin.price_change_percentage_24h < 0);

    return matchesSearch && matchesTrend;
  });
}
