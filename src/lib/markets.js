import { formatEther } from "viem";
import { client, CONTRACT_ADDRESS } from "./genlayer";

// Parse one raw get_market() JSON string into a display-ready object.
// Throws if `raw` is "{}" (market not found) -- caller must guard for that.
export function formatMarket(raw) {
  const record = JSON.parse(raw);
  if (!record.market_id) {
    throw new Error("Market not found");
  }
  const createdAt = new Date(record.created_at);
  const deadline = new Date(
    createdAt.getTime() + Number(record.duration_hours) * 3600 * 1000
  );
  const isCustom = record.asset === "CUSTOM";

  return {
    id: record.market_id,
    title: isCustom ? record.question : `${record.asset} price direction`,
    isCustom,
    status: record.status,
    aiPosition: record.ai_position || null,
    reasoning: record.reasoning || "",
    evidenceUrl: record.evidence_url || null,
    createdBy: record.created_by,
    poolUp: formatEther(BigInt(record.pool_up)),
    poolDown: formatEther(BigInt(record.pool_down)),
    deadline: deadline.toISOString(),
    isPastDeadline: Date.now() > deadline.getTime(),
    outcome: record.outcome || null,
    outcomeExplanation: record.outcome_explanation || null,
  };
}

// Fetch every market by looping id 1..total_markets (no bulk getter exists
// on the contract). Skips ids that come back empty instead of throwing,
// so one bad id doesn't break the whole list.
export async function fetchAllMarkets() {
  const totalRaw = await client.readContract({
    address: CONTRACT_ADDRESS,
    functionName: "get_total_markets",
    args: [],
  });
  const total = Number(totalRaw);
  if (!total || total <= 0) return [];

  const results = [];
  for (let id = 1; id <= total; id++) {
    try {
      const raw = await client.readContract({
        address: CONTRACT_ADDRESS,
        functionName: "get_market",
        args: [String(id)],
      });
      results.push(formatMarket(raw));
    } catch (err) {
      console.error(`Skipping market ${id}:`, err.message);
    }
  }
  return results.reverse(); // newest first
}

export async function fetchMarket(marketId) {
  const raw = await client.readContract({
    address: CONTRACT_ADDRESS,
    functionName: "get_market",
    args: [String(marketId)],
  });
  return formatMarket(raw);
}
