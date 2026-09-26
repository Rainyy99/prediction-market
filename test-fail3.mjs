import { createClient, createAccount, generatePrivateKey } from "genlayer-js";
import { studionet } from "genlayer-js/chains";

const CONTRACT_ADDRESS = "0x2196D2f3C451B1763A68A2b82Abe84138Acb330B";
const client = createClient({ chain: studionet });

async function waitAndCheck(hash) {
  const receipt = await client.waitForTransactionReceipt({ hash, fullTransaction: true });
  const result = receipt.consensus_data?.leader_receipt?.[0]?.result;
  if (result?.status === "contract_error") {
    throw new Error("Transaction was rejected by the contract. Check your inputs and try again.");
  }
  return receipt;
}

const account = createAccount(generatePrivateKey());

console.log("--- Test 1: invalid asset (should throw) ---");
try {
  const hash = await client.writeContract({
    account,
    address: CONTRACT_ADDRESS,
    functionName: "create_market_ai",
    args: ["ETH", "1"],
  });
  await waitAndCheck(hash);
  console.log("BUG: did not throw for invalid asset!");
} catch (err) {
  console.log("Correctly caught:", err.message);
}

console.log("--- Test 2: valid asset (should succeed) ---");
try {
  const hash = await client.writeContract({
    account,
    address: CONTRACT_ADDRESS,
    functionName: "create_market_ai",
    args: ["BTC", "1"],
  });
  await waitAndCheck(hash);
  console.log("Correctly passed for valid input.");
} catch (err) {
  console.log("BUG: threw for valid input:", err.message);
}
