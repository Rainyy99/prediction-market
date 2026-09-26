import { createClient, createAccount, generatePrivateKey } from "genlayer-js";
import { studionet } from "genlayer-js/chains";

const CONTRACT_ADDRESS = "0x2196D2f3C451B1763A68A2b82Abe84138Acb330B";
const client = createClient({ chain: studionet });

const privateKey = generatePrivateKey();
const account = createAccount(privateKey);
console.log("Generated fresh test account:", account.address);

try {
  const hash = await client.writeContract({
    account,
    address: CONTRACT_ADDRESS,
    functionName: "create_market_ai",
    args: ["BTC", "1"],
  });
  console.log("tx hash:", hash);

  const receipt = await client.waitForTransactionReceipt({ hash });
  console.log("status:", receipt.status);
  console.log("txExecutionResultName:", receipt.txExecutionResultName);
  console.log("full receipt:", JSON.stringify(receipt, null, 2));
} catch (err) {
  console.error("ERROR:", err.message || err);
}
