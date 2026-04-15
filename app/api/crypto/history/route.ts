import { NextRequest, NextResponse } from "next/server";
import redis from "@/lib/redis";
import {
  CURRENCY_CONFIG,
  fetchCryptoHistory,
  TIMEFRAME_TO_DAYS,
  type CryptoTimeframe,
  type SupportedCurrency,
} from "@/lib/coingecko";

const CACHE_TTL = 300;

function isCryptoTimeframe(value: string): value is CryptoTimeframe {
  return value in TIMEFRAME_TO_DAYS;
}

function isSupportedCurrency(value: string): value is SupportedCurrency {
  return value in CURRENCY_CONFIG;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const coinId = searchParams.get("coin");
  const timeframeParam = searchParams.get("timeframe") ?? "7D";
  const currencyParam = searchParams.get("currency") ?? "usd";

  if (
    !coinId ||
    !isCryptoTimeframe(timeframeParam) ||
    !isSupportedCurrency(currencyParam)
  ) {
    return NextResponse.json(
      { error: "Invalid coin, timeframe, or currency" },
      { status: 400 },
    );
  }

  const cacheKey = `crypto:history:${coinId}:${timeframeParam}:${currencyParam}`;

  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      return NextResponse.json({ data: cached, source: "cache" });
    }

    const data = await fetchCryptoHistory(
      coinId,
      timeframeParam,
      currencyParam,
    );
    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(data));

    return NextResponse.json({ data, source: "api" });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch crypto history" },
      { status: 500 },
    );
  }
}
