import { Keypair, Operation, Asset } from "@stellar/stellar-sdk";
import { CONFIG } from "./config.js";
import { submitClassic, horizon } from "./soroban.js";

export type Role = "buyer" | "farmer";

export type ProvisionedAccount = {
  publicKey: string;
  secret: string;
  role: Role;
  mintedRupiah: string;
};

export function ygidrAsset(): Asset {
  return new Asset(CONFIG.ygidrCode, CONFIG.ygidrIssuerPublic);
}

// Funds a brand-new account from Friendbot. Used once for the seed singletons.
export async function friendbotFund(publicKey: string): Promise<void> {
  const res = await fetch(
    CONFIG.friendbotUrl + "/?addr=" + encodeURIComponent(publicKey),
  );
  if (!res.ok) {
    const body = await res.text();
    throw new Error("friendbot failed " + res.status + ": " + body);
  }
}

// Creates and funds an account by transferring XLM from the treasury.
export async function createAndFundAccount(
  destination: string,
  startingBalance: string = CONFIG.provisionXlm,
): Promise<string> {
  const treasury = Keypair.fromSecret(CONFIG.treasurySecret);
  return submitClassic(treasury, [
    Operation.createAccount({ destination, startingBalance }),
  ]);
}

// Establishes the YGIDR trustline for a holder account.
export async function establishTrustline(holder: Keypair): Promise<string> {
  return submitClassic(holder, [
    Operation.changeTrust({ asset: ygidrAsset() }),
  ]);
}

// Shared mint primitive: issuer pays YGIDR to the holder. amount is a rupiah
// display-unit string (1 YGIDR = Rp 1).
export async function mintYgidr(
  destination: string,
  rupiah: string,
): Promise<string> {
  const issuer = Keypair.fromSecret(CONFIG.issuerSecret);
  return submitClassic(issuer, [
    Operation.payment({
      destination,
      asset: ygidrAsset(),
      amount: formatRupiah(rupiah),
    }),
  ]);
}

// The provisioning routine shared by seed and live signup: keypair, treasury
// funding, YGIDR trustline, and a buyer starter mint.
export async function provision(role: Role): Promise<ProvisionedAccount> {
  const kp = Keypair.random();
  await createAndFundAccount(kp.publicKey());
  await establishTrustline(kp);
  let mintedRupiah = "0";
  if (role === "buyer") {
    await mintYgidr(kp.publicKey(), CONFIG.starterMintRupiah);
    mintedRupiah = CONFIG.starterMintRupiah;
  }
  return { publicKey: kp.publicKey(), secret: kp.secret(), role, mintedRupiah };
}

export async function getYgidrBalance(publicKey: string): Promise<string> {
  const account = await horizon.loadAccount(publicKey);
  const line = account.balances.find(
    (b) =>
      "asset_code" in b &&
      b.asset_code === CONFIG.ygidrCode &&
      b.asset_issuer === CONFIG.ygidrIssuerPublic,
  );
  return line ? line.balance : "0";
}

// Normalizes a rupiah value into a classic payment amount string (<=7 decimals).
function formatRupiah(rupiah: string): string {
  const n = Number(rupiah);
  if (!Number.isFinite(n) || n < 0) {
    throw new Error("invalid rupiah amount: " + rupiah);
  }
  return n.toFixed(7);
}
