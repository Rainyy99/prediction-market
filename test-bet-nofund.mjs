import { createClient, createAccount, generatePrivateKey } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { parseEther } from "viem";

const CONTRACT_ADDRESS = "0x2196D2f3C451B1763A68A2b82Abe84138Acb330B";
const client = createClient({ chain: studionet });

const account = createAccount(generatePrivateKey());
console.log("Fresh, unfunded account:", account.address);

const balance = await client.getBalance({ address: account.address });
console.log("Balance before bet:", balance.toString());

try {
  const hash = await client.writeContract({
    account,
    address: CONTRACT_ADDRESS,
    functionName: "bet",
    args: ["1", "UP"],
    value: parseEther("1"),
  });
  console.log("tx hash:", hash);
  const receipt = await client.waitForTransactionReceipt({ hash, fullTransaction: true });
  console.log("status_name:", receipt.status_name);
  const result = receipt.consensus_data?.leader_receipt?.[0]?.result;
  console.log("execution result status:", result?.status);
} catch (err) {
  console.log("THREW:", err.message);
}
