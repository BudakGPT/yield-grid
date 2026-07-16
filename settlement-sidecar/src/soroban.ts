import {
  rpc,
  Horizon,
  TransactionBuilder,
  BASE_FEE,
  type Keypair,
  type xdr,
  type Operation,
} from "@stellar/stellar-sdk";
import { CONFIG, SOROBAN_INCLUSION_FEE } from "./config.js";

export const server = new rpc.Server(CONFIG.rpcUrl, {
  allowHttp: CONFIG.rpcUrl.startsWith("http://"),
});

export const horizon = new Horizon.Server(CONFIG.horizonUrl, {
  allowHttp: CONFIG.horizonUrl.startsWith("http://"),
});

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export type TxResult = { hash: string; returnValue?: xdr.ScVal };

// Builds, simulates, signs, submits, and polls a single-operation soroban tx.
// The source keypair covers require_auth via source-account credentials.
export async function invokeSoroban(
  source: Keypair,
  operation: xdr.Operation | Operation.Operation,
): Promise<TxResult> {
  const account = await server.getAccount(source.publicKey());
  const tx = new TransactionBuilder(account, {
    fee: SOROBAN_INCLUSION_FEE,
    networkPassphrase: CONFIG.networkPassphrase,
  })
    .addOperation(operation as xdr.Operation)
    .setTimeout(90)
    .build();

  const prepared = await server.prepareTransaction(tx);
  prepared.sign(source);

  const sent = await server.sendTransaction(prepared);
  if (sent.status === "ERROR") {
    throw new Error("sendTransaction failed: " + JSON.stringify(sent.errorResult));
  }
  return waitForTx(sent.hash);
}

// Polls getTransaction until the ledger includes the tx or the window expires.
export async function waitForTx(hash: string): Promise<TxResult> {
  for (let attempt = 0; attempt < 45; attempt++) {
    const res = await server.getTransaction(hash);
    if (res.status !== "NOT_FOUND") {
      if (res.status === "SUCCESS") {
        return { hash, returnValue: res.returnValue };
      }
      throw new Error("tx " + hash + " failed with status " + res.status);
    }
    await sleep(1000);
  }
  throw new Error("tx " + hash + " not confirmed in time");
}

// Builds, signs, and submits a classic (non-soroban) transaction via Horizon.
export async function submitClassic(
  source: Keypair,
  operations: xdr.Operation[],
  extraSigners: Keypair[] = [],
): Promise<string> {
  const account = await horizon.loadAccount(source.publicKey());
  const builder = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: CONFIG.networkPassphrase,
  });
  for (const op of operations) {
    builder.addOperation(op);
  }
  const tx = builder.setTimeout(90).build();
  tx.sign(source, ...extraSigners);
  const res = await horizon.submitTransaction(tx);
  return res.hash;
}
