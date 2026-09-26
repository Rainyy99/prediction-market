import { createClient, createAccount, generatePrivateKey } from "genlayer-js";
import { studionet } from "genlayer-js/chains";

const CONTRACT_ADDRESS = "0x2196D2f3C451B1763A68A2b82Abe84138Acb330B";
const client = createClient({ chain: studionet });

const account = createAccount(generatePrivateKey());
const hash = await client.writeContract({
  account,
  address: CONTRACT_ADDRESS,
  functionName: "create_market_ai",
  args: ["BTC", "1"],
});

const receipt = await client.waitForTransactionReceipt({ hash });
console.log("=== TOP-LEVEL KEYS ===");
console.log(Object.keys(receipt));
console.log("=== status / status_name ===");
console.log(receipt.status, receipt.status_name);
console.log("=== data keys (if exists) ===");
console.log(receipt.data ? Object.keys(receipt.data) : "no .data");
console.log("=== result_name (top level) ===");
console.log(receipt.result_name);
