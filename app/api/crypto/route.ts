import { NextResponse } from "next/server";
import redis from "@/lib/redis";
import { fetchCryptoPrices } from "@/lib/coingecko";

const CACHE_KEY = "crypto:prices";
const CACHE_TTL = 60; // 60 secondi

export async function GET() {
  try {
    // Prova a leggere dalla cache Redis
    const cached = await redis.get(CACHE_KEY);
    if (cached) {
      return NextResponse.json({ data: cached, source: "cache" });
    }

    // Se non c'è cache, chiama CoinGecko
    const data = await fetchCryptoPrices();

    // Salva in cache per 60 secondi
    await redis.setex(CACHE_KEY, CACHE_TTL, JSON.stringify(data));

    return NextResponse.json({ data, source: "api" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch crypto data" },
      { status: 500 },
    );
  }
}
