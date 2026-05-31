import { eq } from "drizzle-orm";
import { db } from "../db/client";
import { priceCache } from "../db/schema";

const PRICE_TTL_MS = 60_000;
const PRICE_SOURCE = "mock";

// Deterministic baseline USD prices for the testnet showcase.
const BASE_PRICES: Record<string, number> = {
  ETH: 3142.5,
  WETH: 3142.5,
  USDC: 1,
  USDT: 1,
  DAI: 1,
  MATIC: 0.72,
  POL: 0.72,
  LINK: 14.3,
};

function basePrice(symbol: string): number {
  const known = BASE_PRICES[symbol];
  if (known !== undefined) {
    return known;
  }
  // Stable pseudo price for unknown symbols, kept in a sensible range.
  let hash = 0;
  for (let i = 0; i < symbol.length; i++) {
    hash = (hash * 31 + symbol.charCodeAt(i)) >>> 0;
  }
  return Number(((hash % 5000) / 100 + 0.5).toFixed(2));
}

export interface PriceResult {
  symbol: string;
  priceUsd: number;
  source: string;
  updatedAt: number;
}

export async function getPrices(symbols: string[]): Promise<PriceResult[]> {
  const now = Date.now();
  const unique = [...new Set(symbols.map((symbol) => symbol.trim().toUpperCase()).filter(Boolean))];
  const results: PriceResult[] = [];

  for (const symbol of unique) {
    const cached = await db.select().from(priceCache).where(eq(priceCache.symbol, symbol)).get();
    if (cached && now - cached.updatedAt < PRICE_TTL_MS) {
      results.push({
        symbol,
        priceUsd: cached.priceUsd,
        source: cached.source,
        updatedAt: cached.updatedAt,
      });
      continue;
    }

    const priceUsd = basePrice(symbol);
    await db
      .insert(priceCache)
      .values({ symbol, priceUsd, source: PRICE_SOURCE, updatedAt: now })
      .onConflictDoUpdate({
        target: priceCache.symbol,
        set: { priceUsd, source: PRICE_SOURCE, updatedAt: now },
      });

    results.push({ symbol, priceUsd, source: PRICE_SOURCE, updatedAt: now });
  }

  return results;
}
