import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { parseEther } from "viem";

export const CONTRACT_ADDRESS = "0x2196D2f3C451B1763A68A2b82Abe84138Acb330B";
export const client = createClient({ chain: studionet });

// Decodes a write tx's return value (e.g. bet()'s {bet_id, pool_up, pool_down}).
// The contract's `str` return type comes back double-JSON-encoded (a JSON
// string containing the JSON string), so this unwraps it twice if needed.
// Returns null for a contract_error receipt or anything unparseable.
export function getReturnValue(receipt) {
  const result = receipt.consensus_data?.leader_receipt?.[0]?.result;
  if (result?.status !== "return") return null;
  try {
    let value = JSON.parse(result.payload.readable);
    if (typeof value === "string") {
      value = JSON.parse(value);
    }
    return value;
  } catch (err) {
    console.error("Failed to parse return value:", err.message);
    return null;
  }
}

export function createMarketAi({ account, asset, durationHours }) {
  return client.writeContract({
    account, address: CONTRACT_ADDRESS, functionName: "create_market_ai",
    args: [String(asset).toUpperCase(), String(durationHours)],
  });
}
export function createMarketUser({ account, question, evidenceUrl, durationHours }) {
  return client.writeContract({
    account, address: CONTRACT_ADDRESS, functionName: "create_market_user",
    args: [question, evidenceUrl, String(durationHours)],
  });
}
export function aiVote({ account, marketId }) {
  return client.writeContract({
    account, address: CONTRACT_ADDRESS, functionName: "ai_vote",
    args: [String(marketId)],
  });
}
export function placeBet({ account, marketId, side, amount }) {
  return client.writeContract({
    account, address: CONTRACT_ADDRESS, functionName: "bet",
    args: [String(marketId), String(side).toUpperCase()],
    value: parseEther(String(amount)),
  });
}
export function resolveMarket({ account, marketId }) {
  return client.writeContract({
    account, address: CONTRACT_ADDRESS, functionName: "resolve",
    args: [String(marketId)],
  });
}
export function claimBet({ account, betId }) {
  return client.writeContract({
    account, address: CONTRACT_ADDRESS, functionName: "claim",
    args: [String(betId)],
  });
}
