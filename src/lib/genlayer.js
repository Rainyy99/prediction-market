import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { parseEther } from "viem";

export const CONTRACT_ADDRESS = "0x2196D2f3C451B1763A68A2b82Abe84138Acb330B";

export const client = createClient({ chain: studionet });

// --- Writes (all require a wallet `account`) ---

export function createMarketAi({ account, asset, durationHours }) {
  return client.writeContract({
    account,
    address: CONTRACT_ADDRESS,
    functionName: "create_market_ai",
    args: [String(asset).toUpperCase(), String(durationHours)],
  });
}

export function createMarketUser({ account, question, evidenceUrl, durationHours }) {
  return client.writeContract({
    account,
    address: CONTRACT_ADDRESS,
    functionName: "create_market_user",
    args: [question, evidenceUrl, String(durationHours)],
  });
}

export function aiVote({ account, marketId }) {
  return client.writeContract({
    account,
    address: CONTRACT_ADDRESS,
    functionName: "ai_vote",
    args: [String(marketId)],
  });
}

// amount is a plain GEN string like "1.5" -- converted to wei here.
export function placeBet({ account, marketId, side, amount }) {
  return client.writeContract({
    account,
    address: CONTRACT_ADDRESS,
    functionName: "bet",
    args: [String(marketId), String(side).toUpperCase()],
    value: parseEther(String(amount)),
  });
}

export function resolveMarket({ account, marketId }) {
  return client.writeContract({
    account,
    address: CONTRACT_ADDRESS,
    functionName: "resolve",
    args: [String(marketId)],
  });
}

export function claimBet({ account, betId }) {
  return client.writeContract({
    account,
    address: CONTRACT_ADDRESS,
    functionName: "claim",
    args: [String(betId)],
  });
}
