import { client, CONTRACT_ADDRESS } from "./genlayer";

const STORAGE_PREFIX = "genlayer_prediction_bets_";

function storageKey(walletAddress) {
  return STORAGE_PREFIX + walletAddress;
}

// We only store a pointer (which bet_ids belong to this wallet) --
// the actual side/amount/claimed status always comes fresh from the
// contract via get_bet(), never trusted from localStorage.
export function recordBetPointer(walletAddress, { betId, marketId }) {
  if (typeof window === "undefined") return;
  try {
    const key = storageKey(walletAddress);
    const existing = JSON.parse(window.localStorage.getItem(key) || "[]");
    if (existing.some((p) => p.betId === betId)) return;
    existing.push({ betId, marketId });
    window.localStorage.setItem(key, JSON.stringify(existing));
  } catch (err) {
    console.error("recordBetPointer error:", err);
  }
}

function getBetPointers(walletAddress) {
  if (typeof window === "undefined") return [];
  try {
    const key = storageKey(walletAddress);
    return JSON.parse(window.localStorage.getItem(key) || "[]");
  } catch (err) {
    console.error("getBetPointers error:", err);
    return [];
  }
}

// Mirrors the contract's claim() winning-side logic exactly.
export function computeBetStatus(bet, market) {
  if (!market) return "UNKNOWN";
  if (market.status !== "RESOLVED") return "PENDING";
  const winningSide =
    market.outcome === "CORRECT"
      ? market.aiPosition
      : market.aiPosition === "UP" ? "DOWN" : "UP";
  if (bet.side !== winningSide) return "LOST";
  return bet.claimed ? "CLAIMED" : "WON_UNCLAIMED";
}

// Fetches fresh bet data for this wallet's pointers and combines it with
// the already-loaded markets list to compute each bet's status.
export async function fetchMyBets(walletAddress, marketsById) {
  const pointers = getBetPointers(walletAddress);
  const results = [];
  for (const { betId } of pointers) {
    try {
      const raw = await client.readContract({
        address: CONTRACT_ADDRESS,
        functionName: "get_bet",
        args: [betId],
      });
      const bet = JSON.parse(raw);
      if (!bet.bet_id) continue;
      const market = marketsById.get(bet.market_id);
      results.push({
        betId: bet.bet_id,
        marketId: bet.market_id,
        marketTitle: market ? market.title : `Market #${bet.market_id}`,
        side: bet.side,
        amountWei: bet.amount,
        claimed: bet.claimed,
        status: computeBetStatus(bet, market),
      });
    } catch (err) {
      console.error(`Skipping bet ${betId}:`, err.message);
    }
  }
  return results;
}
