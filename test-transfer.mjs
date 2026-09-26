import { createClient, createAccount } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { parseEther } from "viem";

const client = createClient({ chain: studionet });

const privateKey = process.env.SOURCE_PRIVATE_KEY;
if (!privateKey) throw new Error("Set SOURCE_PRIVATE_KEY env var first");
const account = createAccount(privateKey);

const TARGET_ADDRESS = "0xbdf27b79235a85afd4b1f683ccb27122789f1cd8"; // ganti dengan address tujuan (wallet auto-generate)

console.log("From:", account.address);
console.log("To:", TARGET_ADDRESS);

const balanceBefore = await client.getBalance({ address: TARGET_ADDRESS });
console.log("Target balance before:", balanceBefore.toString());

const hash = await client.sendTransaction({
  account,
  to: TARGET_ADDRESS,
  value: parseEther("5"), // 5 GEN
});
console.log("tx hash:", hash);

const receipt = await client.waitForTransactionReceipt({ hash });
console.log("status:", receipt.status_name || receipt.status);

const balanceAfter = await client.getBalance({ address: TARGET_ADDRESS });
console.log("Target balance after:", balanceAfter.toString());
