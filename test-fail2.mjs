import { createClient, createAccount, generatePrivateKey } from "genlayer-js";
import { studionet } from "genlayer-js/chains";

const CONTRACT_ADDRESS = "0x2196D2f3C451B1763A68A2b82Abe84138Acb330B";
const client = createClient({ chain: studionet });

const account = createAccount(generatePrivateKey());

const hash = await client.writeContract({
  account,
  address: CONTRACT_ADDRESS,
  functionName: "create_market_ai",
  args: ["ETH", "1"], // invalid asset
});

const receipt = await client.waitForTransactionReceipt({ hash, fullTransaction: true });
console.log("=== FULL TOP-LEVEL KEYS ===");
console.log(Object.keys(receipt));
console.log("=== consensus_data keys ===");
console.log(receipt.consensus_data ? Object.keys(receipt.consensus_data) : "none");
console.log("=== consensus_data.leader_receipt (first item) ===");
const lr = receipt.consensus_data?.leader_receipt;
console.log(Array.isArray(lr) ? JSON.stringify(lr[0], null, 2).slice(0, 1500) : JSON.stringify(lr, null, 2)?.slice(0, 1500));
