export type CryptoData = {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  image: string;
  sparkline_in_7d: { price: number[] };
};

export type CryptoTimeframe = "1D" | "7D" | "30D" | "1Y";
export type SupportedCurrency = "usd" | "eur" | "gbp";

export type CryptoHistoryPoint = {
  timestamp: number;
  price: number;
};

export const TIMEFRAME_TO_DAYS: Record<CryptoTimeframe, string> = {
  "1D": "1",
  "7D": "7",
  "30D": "30",
  "1Y": "365",
};

export const CURRENCY_CONFIG: Record<
  SupportedCurrency,
  { code: string; locale: string; label: string }
> = {
  usd: { code: "USD", locale: "en-US", label: "USD" },
  eur: { code: "EUR", locale: "en-US", label: "EUR" },
  gbp: { code: "GBP", locale: "en-GB", label: "GBP" },
};

export async function fetchCryptoPrices(
  currency: SupportedCurrency,
): Promise<CryptoData[]> {
  const res = await fetch(
    `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${currency}&order=market_cap_desc&per_page=10&page=1&sparkline=true&price_change_percentage=24h`,
    { headers: { Accept: "application/json" } },
  );

  if (!res.ok) throw new Error("Failed to fetch crypto prices");
  return res.json();
}

export async function fetchCryptoHistory(
  coinId: string,
  timeframe: CryptoTimeframe,
  currency: SupportedCurrency,
): Promise<CryptoHistoryPoint[]> {
  const days = TIMEFRAME_TO_DAYS[timeframe];
  const res = await fetch(
    `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=${currency}&days=${days}`,
    { headers: { Accept: "application/json" } },
  );

  if (!res.ok) throw new Error("Failed to fetch crypto history");

  const json = (await res.json()) as { prices?: [number, number][] };
  return (json.prices ?? []).map(([timestamp, price]) => ({
    timestamp,
    price,
  }));
}

export function buildSparklineHistory(
  prices: number[],
  timeframe: CryptoTimeframe,
): CryptoHistoryPoint[] {
  const now = Date.now();
  const totalDurationMs =
    Number(TIMEFRAME_TO_DAYS[timeframe]) * 24 * 60 * 60 * 1000;
  const intervalMs =
    prices.length > 1 ? totalDurationMs / (prices.length - 1) : totalDurationMs;

  return prices.map((price, index) => ({
    price,
    timestamp: now - totalDurationMs + intervalMs * index,
  }));
}

export function formatPrice(
  price: number,
  currency: SupportedCurrency = "usd",
): string {
  const config = CURRENCY_CONFIG[currency];

  if (price >= 1) {
    return new Intl.NumberFormat(config.locale, {
      style: "currency",
      currency: config.code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  }
  return new Intl.NumberFormat(config.locale, {
    style: "currency",
    currency: config.code,
    minimumFractionDigits: 4,
    maximumFractionDigits: 6,
  }).format(price);
}

export function formatMarketCap(
  value: number,
  currency: SupportedCurrency = "usd",
): string {
  const config = CURRENCY_CONFIG[currency];

  return new Intl.NumberFormat(config.locale, {
    style: "currency",
    currency: config.code,
    notation: value >= 1_000_000 ? "compact" : "standard",
    maximumFractionDigits: 2,
    minimumFractionDigits: value < 1_000_000 ? 2 : 0,
  }).format(value);
}

export function formatTimeframeLabel(
  timestamp: number,
  timeframe: CryptoTimeframe,
): string {
  if (timeframe === "1D") {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
    }).format(timestamp);
  }

  if (timeframe === "1Y") {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      year: "2-digit",
    }).format(timestamp);
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(timestamp);
}
