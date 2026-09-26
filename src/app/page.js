"use client";
import { useEffect, useState, useCallback } from "react";
import { getOrCreateWallet } from "@/lib/wallet";
import { fetchAllMarkets } from "@/lib/markets";
import {
  createMarketAi,
  createMarketUser,
  aiVote,
  placeBet,
  resolveMarket,
  claimBet,
  client,
} from "@/lib/genlayer";
import {
  SUPPORTED_ASSETS,
  validateAiMarket,
  validateUserMarket,
  validateBet,
} from "@/lib/validation";

async function waitAndCheck(hash) {
  const receipt = await client.waitForTransactionReceipt({ hash });
  if (receipt.txExecutionResultName === "FINISHED_WITH_ERROR") {
    throw new Error("Transaction executed but failed on-chain. Check inputs and try again.");
  }
  return receipt;
}

export default function Home() {
  const [wallet] = useState(() => getOrCreateWallet());
  const [markets, setMarkets] = useState([]);
  const [loadingMarkets, setLoadingMarkets] = useState(true);
  const [busy, setBusy] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [showCreate, setShowCreate] = useState(null);

  const [aiAsset, setAiAsset] = useState(SUPPORTED_ASSETS[0]);
  const [aiDuration, setAiDuration] = useState("24");

  const [userQuestion, setUserQuestion] = useState("");
  const [userEvidenceUrl, setUserEvidenceUrl] = useState("");
  const [userDuration, setUserDuration] = useState("24");

  const [betAmounts, setBetAmounts] = useState({});

  const loadMarkets = useCallback(async () => {
    setLoadingMarkets(true);
    try {
      const all = await fetchAllMarkets();
      setMarkets(all);
    } catch (err) {
      setStatusMsg("Failed to load markets: " + err.message);
    } finally {
      setLoadingMarkets(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time initial fetch on mount, no race condition (refresh button re-triggers outside this effect)
    loadMarkets();
  }, [loadMarkets]);

  async function handleCreateAi(e) {
    e.preventDefault();
    const errors = validateAiMarket({ asset: aiAsset, durationHours: aiDuration });
    if (errors.length) return setStatusMsg(errors.join(" "));
    setBusy(true);
    setStatusMsg("Submitting AI market...");
    try {
      const hash = await createMarketAi({
        account: wallet.account,
        asset: aiAsset,
        durationHours: aiDuration,
      });
      setStatusMsg("Waiting for confirmation...");
      await waitAndCheck(hash);
      setStatusMsg("Market created.");
      setShowCreate(null);
      await loadMarkets();
    } catch (err) {
      setStatusMsg("Error: " + err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleCreateUser(e) {
    e.preventDefault();
    const errors = validateUserMarket({
      question: userQuestion,
      evidenceUrl: userEvidenceUrl,
      durationHours: userDuration,
    });
    if (errors.length) return setStatusMsg(errors.join(" "));
    setBusy(true);
    setStatusMsg("Submitting question for AI review...");
    try {
      const hash = await createMarketUser({
        account: wallet.account,
        question: userQuestion,
        evidenceUrl: userEvidenceUrl,
        durationHours: userDuration,
      });
      setStatusMsg("Waiting for confirmation...");
      await waitAndCheck(hash);
      setStatusMsg("Market created. Waiting for AI to vote before betting opens.");
      setShowCreate(null);
      setUserQuestion("");
      setUserEvidenceUrl("");
      await loadMarkets();
    } catch (err) {
      setStatusMsg("Error: " + err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleAiVote(marketId) {
    setBusy(true);
    setStatusMsg("Requesting AI vote...");
    try {
      const hash = await aiVote({ account: wallet.account, marketId });
      await waitAndCheck(hash);
      setStatusMsg("AI voted.");
      await loadMarkets();
    } catch (err) {
      setStatusMsg("Error: " + err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleBet(marketId, side) {
    const amount = betAmounts[marketId] || "";
    const { errors } = validateBet({ side, amount });
    if (errors.length) return setStatusMsg(errors.join(" "));
    setBusy(true);
    setStatusMsg(`Placing ${side} bet...`);
    try {
      const hash = await placeBet({ account: wallet.account, marketId, side, amount });
      await waitAndCheck(hash);
      setStatusMsg("Bet placed.");
      await loadMarkets();
    } catch (err) {
      setStatusMsg("Error: " + err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleResolve(marketId) {
    setBusy(true);
    setStatusMsg("Resolving market...");
    try {
      const hash = await resolveMarket({ account: wallet.account, marketId });
      await waitAndCheck(hash);
      setStatusMsg("Market resolved.");
      await loadMarkets();
    } catch (err) {
      setStatusMsg("Error: " + err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleClaim(marketId) {
    const betId = window.prompt("Enter your bet ID to claim:");
    if (!betId) return;
    setBusy(true);
    setStatusMsg("Claiming payout...");
    try {
      const hash = await claimBet({ account: wallet.account, betId });
      await waitAndCheck(hash);
      setStatusMsg("Claim submitted.");
    } catch (err) {
      setStatusMsg("Error: " + err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="max-w-3xl mx-auto w-full px-4 py-8 space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">GenLayer Prediction Market</h1>
        <p className="text-sm text-slate-400">
          AI predicts a direction, you bet for or against it. No wallet connect needed --
          a wallet is generated for you in this browser.
        </p>
        {wallet && (
          <div className="text-xs bg-slate-900 border border-slate-800 rounded p-2 break-all">
            Your wallet: <span className="text-emerald-400">{wallet.address}</span>
            <br />
            <span className="text-slate-500">
              This address only exists in this browser. Clearing site data or switching
              devices loses access to any funds sent here.
            </span>
          </div>
        )}
      </header>

      {statusMsg && (
        <div className="text-sm bg-slate-900 border border-slate-800 rounded p-3">
          {statusMsg}
        </div>
      )}

      <div className="flex gap-2">
        <button
          disabled={busy}
          onClick={() => setShowCreate(showCreate === "ai" ? null : "ai")}
          className="px-3 py-2 rounded bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-sm font-medium"
        >
          New AI Market
        </button>
        <button
          disabled={busy}
          onClick={() => setShowCreate(showCreate === "user" ? null : "user")}
          className="px-3 py-2 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-sm font-medium"
        >
          Propose Your Own Question
        </button>
      </div>

      {showCreate === "ai" && (
        <form onSubmit={handleCreateAi} className="bg-slate-900 border border-slate-800 rounded p-4 space-y-3">
          <div>
            <label className="block text-sm mb-1">Asset</label>
            <select
              value={aiAsset}
              onChange={(e) => setAiAsset(e.target.value)}
              className="w-full bg-slate-800 rounded px-2 py-1"
            >
              {SUPPORTED_ASSETS.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Duration (hours, 1-720)</label>
            <input
              value={aiDuration}
              onChange={(e) => setAiDuration(e.target.value)}
              className="w-full bg-slate-800 rounded px-2 py-1"
            />
          </div>
          <button disabled={busy} className="px-3 py-2 rounded bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-sm">
            Create
          </button>
        </form>
      )}

      {showCreate === "user" && (
        <form onSubmit={handleCreateUser} className="bg-slate-900 border border-slate-800 rounded p-4 space-y-3">
          <div>
            <label className="block text-sm mb-1">Question</label>
            <input
              value={userQuestion}
              onChange={(e) => setUserQuestion(e.target.value)}
              placeholder="Will X happen by Y date?"
              className="w-full bg-slate-800 rounded px-2 py-1"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Evidence URL (a page the AI can check)</label>
            <input
              value={userEvidenceUrl}
              onChange={(e) => setUserEvidenceUrl(e.target.value)}
              placeholder="https://..."
              className="w-full bg-slate-800 rounded px-2 py-1"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Duration (hours, 1-720)</label>
            <input
              value={userDuration}
              onChange={(e) => setUserDuration(e.target.value)}
              className="w-full bg-slate-800 rounded px-2 py-1"
            />
          </div>
          <p className="text-xs text-slate-500">
            An AI will review whether this question is clear and resolvable before it opens.
          </p>
          <button disabled={busy} className="px-3 py-2 rounded bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-sm">
            Submit
          </button>
        </form>
      )}

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Markets</h2>
          <button onClick={loadMarkets} className="text-xs text-slate-400 hover:text-slate-200">
            Refresh
          </button>
        </div>

        {loadingMarkets && <p className="text-sm text-slate-500">Loading markets...</p>}
        {!loadingMarkets && markets.length === 0 && (
          <p className="text-sm text-slate-500">No markets yet. Create the first one above.</p>
        )}

        {markets.map((m) => (
          <div key={m.id} className="bg-slate-900 border border-slate-800 rounded p-4 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">{m.title}</h3>
              <span className="text-xs uppercase text-slate-400">{m.status}</span>
            </div>
            <p className="text-xs text-slate-500">
              {m.createdBy === "AI" ? "AI-generated market" : "User-submitted question"} · deadline {new Date(m.deadline).toLocaleString()}
            </p>
            {m.aiPosition ? (
              <p className="text-sm">AI position: <span className="font-semibold">{m.aiPosition}</span></p>
            ) : (
              <p className="text-sm text-amber-400">AI has not voted yet.</p>
            )}
            <p className="text-sm">Pool -- UP: {m.poolUp} GEN · DOWN: {m.poolDown} GEN</p>
            {m.outcome && (
              <p className="text-sm">Outcome: <span className="font-semibold">{m.outcome}</span> -- {m.outcomeExplanation}</p>
            )}

            {m.status === "OPEN" && !m.aiPosition && m.isCustom && (
              <button
                disabled={busy}
                onClick={() => handleAiVote(m.id)}
                className="text-xs px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-50"
              >
                Trigger AI vote
              </button>
            )}

            {m.status === "OPEN" && m.aiPosition && !m.isPastDeadline && (
              <div className="flex items-center gap-2">
                <input
                  placeholder="GEN amount"
                  value={betAmounts[m.id] || ""}
                  onChange={(e) => setBetAmounts((prev) => ({ ...prev, [m.id]: e.target.value }))}
                  className="bg-slate-800 rounded px-2 py-1 text-sm w-28"
                />
                <button disabled={busy} onClick={() => handleBet(m.id, "UP")} className="text-xs px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50">
                  Bet UP
                </button>
                <button disabled={busy} onClick={() => handleBet(m.id, "DOWN")} className="text-xs px-2 py-1 rounded bg-rose-600 hover:bg-rose-500 disabled:opacity-50">
                  Bet DOWN
                </button>
              </div>
            )}

            {m.status === "OPEN" && m.aiPosition && m.isPastDeadline && (
              <button disabled={busy} onClick={() => handleResolve(m.id)} className="text-xs px-2 py-1 rounded bg-amber-600 hover:bg-amber-500 disabled:opacity-50">
                Resolve now
              </button>
            )}

            {m.status === "RESOLVED" && (
              <button disabled={busy} onClick={() => handleClaim(m.id)} className="text-xs px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-50">
                Claim a winning bet
              </button>
            )}
          </div>
        ))}
      </section>
    </main>
  );
}
