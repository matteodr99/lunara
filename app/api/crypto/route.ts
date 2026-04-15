import { NextRequest, NextResponse } from "next/server";
import redis from "@/lib/redis";
import {
  CURRENCY_CONFIG,
  fetchCryptoPrices,
  type SupportedCurrency,
} from "@/lib/coingecko";

const CACHE_TTL = 60;

function isSupportedCurrency(value: string): value is SupportedCurrency {
  return value in CURRENCY_CONFIG;
}

export async function GET(request: NextRequest) {
  const currencyParam = request.nextUrl.searchParams.get("currency") ?? "usd";

  if (!isSupportedCurrency(currencyParam)) {
    return NextResponse.json({ error: "Invalid currency" }, { status: 400 });
  }

  const cacheKey = `crypto:prices:${currencyParam}`;

  
  try {
    // Prova a leggere dalla cache Redis
    const cached = await redis.get(cacheKey);
    if (cached) {
      return NextResponse.json({ data: cached, source: "cache" });
    }

    // Se non c'è cache, chiama CoinGecko
    const data = await fetchCryptoPrices(currencyParam);

    // Salva in cache per 60 secondi
    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(data));

    return NextResponse.json({ data, source: "api" });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch crypto data" },
      { status: 500 },
    );
  }
}
