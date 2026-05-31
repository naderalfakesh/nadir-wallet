import { Hono } from "hono";
import { z } from "zod";
import type { WalletBalancesResponse, WalletTransactionsResponse } from "@secure-wallet/types";
import { isEvmAddress, isSupportedNetworkId, normalizeAddress } from "@secure-wallet/crypto-core";
import { badRequest } from "../lib/errors";
import { parseOrThrow } from "../lib/validation";
import { getBalances } from "../services/balances";
import { getTransactions } from "../services/transactions";

const querySchema = z.object({ networkId: z.string() });

export const walletRoutes = new Hono();

walletRoutes.get("/wallet/:address/balances", (c) => {
  const address = c.req.param("address");
  const { networkId } = parseOrThrow(querySchema, c.req.query());

  if (!isSupportedNetworkId(networkId)) {
    throw badRequest(`Unsupported networkId: ${networkId}`);
  }
  if (!isEvmAddress(address)) {
    throw badRequest("Invalid wallet address");
  }

  return c.json({
    address: normalizeAddress(address),
    networkId,
    balances: getBalances(address, networkId),
  } satisfies WalletBalancesResponse);
});

walletRoutes.get("/wallet/:address/transactions", (c) => {
  const address = c.req.param("address");
  const { networkId } = parseOrThrow(querySchema, c.req.query());

  if (!isSupportedNetworkId(networkId)) {
    throw badRequest(`Unsupported networkId: ${networkId}`);
  }
  if (!isEvmAddress(address)) {
    throw badRequest("Invalid wallet address");
  }

  return c.json({
    address: normalizeAddress(address),
    networkId,
    transactions: getTransactions(address, networkId),
  } satisfies WalletTransactionsResponse);
});
