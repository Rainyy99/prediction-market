import { createClient, createAccount } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { parseEther } from "viem";

const FUND_AMOUNT_GEN = "5";

export async function POST(request) {
  let address;
  try {
    const body = await request.json();
    address = body.address;
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!address || typeof address !== "string" || !address.startsWith("0x")) {
    return Response.json({ error: "Invalid address" }, { status: 400 });
  }

  const privateKey = process.env.SOURCE_PRIVATE_KEY;
  if (!privateKey) {
    console.error("SOURCE_PRIVATE_KEY not set");
    return Response.json({ error: "Server not configured" }, { status: 500 });
  }

  try {
    const client = createClient({ chain: studionet });
    const account = createAccount(privateKey);

    // Don't re-fund an address that already has a balance -- prevents abuse
    // via repeated calls and avoids draining the source account.
    const existingBalance = await client.getBalance({ address });
    if (existingBalance > 0n) {
      return Response.json({ skipped: true, reason: "Address already funded" });
    }

    const hash = await client.sendTransaction({
      account,
      to: address,
      value: parseEther(FUND_AMOUNT_GEN),
    });

    return Response.json({ hash });
  } catch (err) {
    console.error("Fund error:", err.message);
    return Response.json({ error: "Funding failed" }, { status: 500 });
  }
}
