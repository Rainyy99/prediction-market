"use client";
import { createAccount, generatePrivateKey } from "genlayer-js";

const STORAGE_KEY = "genlayer_prediction_wallet_pk";

export function getOrCreateWallet() {
  if (typeof window === "undefined") return null;
  try {
    let privateKey = window.localStorage.getItem(STORAGE_KEY);
    if (!privateKey) {
      privateKey = generatePrivateKey();
      window.localStorage.setItem(STORAGE_KEY, privateKey);
    }
    const account = createAccount(privateKey);
    return { account, privateKey, address: account.address };
  } catch (err) {
    console.error("Wallet storage error:", err);
    return null;
  }
}

export function resetWallet() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error("Wallet reset error:", err);
  }
}
