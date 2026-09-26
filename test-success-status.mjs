import { createClient, createAccount, generatePrivateKey } from "genlayer-js";
import { studionet } from "genlayer-js/chains";

const CONTRACT_ADDRESS = "0x2196D2f3C451B1763A68A2b82Abe84138Acb330B";
const client = createClient({ chain: studionet });
const account = createAccount(generatePrivateKey());

const hash = await client.writeContract({
  account,
  address: CONTRACT_ADDRESS,
  functionName: "create_market_ai",
  args: ["BTC", "1"], // valid this time
});

const receipt = await client.waitForTransactionReceipt({ hash, fullTransaction: true });
const lr = receipt.consensus_data.leader_receipt[0].result;
console.log("status:", lr.status);
console.log("payload:", lr.payload);
console.log("raw (base64):", lr.raw);
console.log("decoded raw:", Buffer.from(lr.raw, "base64").toString("utf-8"));
