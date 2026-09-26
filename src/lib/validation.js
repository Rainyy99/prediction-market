import { parseEther } from "viem";

export const SUPPORTED_ASSETS = ["BTC", "GOLD", "SILVER", "OIL"];

// Mirrors PredictionMarket.create_market_ai's guards exactly.
export function validateAiMarket({ asset, durationHours }) {
  const errors = [];
  if (!SUPPORTED_ASSETS.includes((asset || "").toUpperCase())) {
    errors.push("Asset must be one of: " + SUPPORTED_ASSETS.join(", "));
  }
  const d = Number(durationHours);
  if (!Number.isInteger(d)) errors.push("Duration must be a whole number of hours");
  else if (d <= 0) errors.push("Duration must be greater than zero");
  else if (d > 720) errors.push("Duration must be at most 720 hours (30 days)");
  return errors;
}

// Mirrors PredictionMarket.create_market_user's guards exactly.
export function validateUserMarket({ question, evidenceUrl, durationHours }) {
  const errors = [];
  if (!question || !question.trim()) errors.push("Question must not be empty");
  const url = (evidenceUrl || "").trim();
  if (!(url.startsWith("http://") || url.startsWith("https://"))) {
    errors.push("Evidence URL must be a valid http(s) URL");
  }
  const d = Number(durationHours);
  if (!Number.isInteger(d)) errors.push("Duration must be a whole number of hours");
  else if (d <= 0) errors.push("Duration must be greater than zero");
  else if (d > 720) errors.push("Duration must be at most 720 hours (30 days)");
  return errors;
}

// Mirrors PredictionMarket.bet's guards. Returns the wei value to send
// as the transaction's native value (GEN has 18 decimals).
export function validateBet({ side, amount }) {
  const errors = [];
  const normalizedSide = (side || "").toUpperCase();
  if (normalizedSide !== "UP" && normalizedSide !== "DOWN") {
    errors.push("Side must be UP or DOWN");
  }

  let valueWei = null;
  try {
    valueWei = parseEther(String(amount));
  } catch (err) {
    errors.push("Amount is not a valid number");
  }
  if (valueWei !== null && valueWei <= 0n) {
    errors.push("Bet amount must be greater than zero");
  }

  return { errors, side: normalizedSide, valueWei };
}
