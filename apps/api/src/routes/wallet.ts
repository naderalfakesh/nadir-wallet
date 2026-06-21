import { Hono } from "hono";
import { z } from "zod";
import type { WalletBalancesResponse, WalletTransactionsResponse } from "@nadir-wallet/types";
import { requireEvmAddress, requireNetworkId } from "../lib/request";
import { parseOrThrow } from "../lib/validation";
import { getBalances } from "../services/balances";
import { getTransactions } from "../services/transactions";

const querySchema = z.object({ networkId: z.string() });

export const walletRoutes = new Hono();

walletRoutes.get("/wallet/:address/balances", (c) => {
  const address = requireEvmAddress(c.req.param("address"), "Invalid wallet address");
  const { networkId } = parseOrThrow(querySchema, c.req.query());
  const network = requireNetworkId(networkId);

  return c.json({
    address,
    networkId: network,
    balances: getBalances(address, network),
  } satisfies WalletBalancesResponse);
});

walletRoutes.get("/wallet/:address/transactions", (c) => {
  const address = requireEvmAddress(c.req.param("address"), "Invalid wallet address");
  const { networkId } = parseOrThrow(querySchema, c.req.query());
  const network = requireNetworkId(networkId);

  return c.json({
    address,
    networkId: network,
    transactions: getTransactions(address, network),
  } satisfies WalletTransactionsResponse);
});
