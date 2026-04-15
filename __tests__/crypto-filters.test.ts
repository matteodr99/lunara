import {
  filterCryptocurrencies,
  type CryptoTrendFilter,
} from "@/lib/crypto-filters";
import type { CryptoData } from "@/lib/coingecko";

const createCoin = (
  overrides: Partial<CryptoData>,
  index: number,
): CryptoData => ({
  id: `coin-${index}`,
  symbol: `c${index}`,
  name: `Coin ${index}`,
  image: "/coin.png",
  current_price: 100 + index,
  price_change_percentage_24h: index,
  market_cap: 1_000_000,
  total_volume: 500_000,
  sparkline_in_7d: { price: [1, 2, 3] },
  ...overrides,
});

describe("filterCryptocurrencies", () => {
  const cryptos: CryptoData[] = [
    createCoin(
      { id: "bitcoin", name: "Bitcoin", symbol: "btc", price_change_percentage_24h: 3.2 },
      1,
    ),
    createCoin(
      { id: "ethereum", name: "Ethereum", symbol: "eth", price_change_percentage_24h: -1.4 },
      2,
    ),
    createCoin(
      { id: "solana", name: "Solana", symbol: "sol", price_change_percentage_24h: 0 },
      3,
    ),
  ];

  it.each<[string, CryptoTrendFilter, string[]]>([
    ["bit", "all", ["bitcoin"]],
    ["ETH", "all", ["ethereum"]],
    ["", "gainers", ["bitcoin", "solana"]],
    ["", "losers", ["ethereum"]],
    ["sol", "gainers", ["solana"]],
  ])(
    "returns expected ids for query %s and filter %s",
    (searchQuery, trendFilter, expectedIds) => {
      expect(
        filterCryptocurrencies(cryptos, searchQuery, trendFilter).map(
          (coin) => coin.id,
        ),
      ).toEqual(expectedIds);
    },
  );

  it("ignores surrounding whitespace in the search query", () => {
    expect(
      filterCryptocurrencies(cryptos, "  bit  ", "all").map((coin) => coin.id),
    ).toEqual(["bitcoin"]);
  });
});
