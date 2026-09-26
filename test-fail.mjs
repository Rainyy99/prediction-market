import { createClient, createAccount, generatePrivateKey } from "genlayer-js";
import { studionet } from "genlayer-js/chains";

const CONTRACT_ADDRESS = "0x2196D2f3C451B1763A68A2b82Abe84138Acb330B";
const client = createClient({ chain: studionet });

const account = createAccount(generatePrivateKey());

try {
  const hash = await client.writeContract({
    account,
    address: CONTRACT_ADDRESS,
    functionName: "create_market_ai",
    args: ["ETH", "1"], // invalid asset, contract should reject
  });
  console.log("tx hash:", hash);

  const receipt = await client.waitForTransactionReceipt({ hash });
  console.log("status_name:", receipt.status_name);
  console.log("result_name:", receipt.result_name);
  console.log("result:", JSON.stringify(receipt.result));
  console.log("data:", JSON.stringify(receipt.data));
} catch (err) {
  console.log("THREW AT writeContract/waitForTransactionReceipt:", err.message);
}
