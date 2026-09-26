import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";

const CONTRACT_ADDRESS = "0x2196D2f3C451B1763A68A2b82Abe84138Acb330B";
const client = createClient({ chain: studionet });

try {
  const total = await client.readContract({
    address: CONTRACT_ADDRESS,
    functionName: "get_total_markets",
    args: [],
  });
  console.log("get_total_markets:", total);

  const assets = await client.readContract({
    address: CONTRACT_ADDRESS,
    functionName: "get_supported_assets",
    args: [],
  });
  console.log("get_supported_assets:", assets);

  if (Number(total) > 0) {
    const market1 = await client.readContract({
      address: CONTRACT_ADDRESS,
      functionName: "get_market",
      args: ["1"],
    });
    console.log("get_market('1'):", market1);
  }
} catch (err) {
  console.error("ERROR:", err.message || err);
}
