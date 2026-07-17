import {
  Address,
  Contract,
  Keypair,
  nativeToScVal,
  xdr,
} from "@stellar/stellar-sdk";
import { CONFIG, YGIDR_DECIMALS } from "./config.js";
import { invokeSoroban, type TxResult } from "./soroban.js";

// Converts a rupiah display value into YGIDR base units (rupiah x 10^7).
export function rupiahToBaseUnits(rupiah: string | number): bigint {
  const normalized = String(rupiah).trim();
  if (!/^\d+(\.\d{1,7})?$/.test(normalized)) {
    throw new Error("rupiah must be a non-negative decimal with at most 7 places");
  }
  const [whole, fraction = ""] = normalized.split(".");
  return BigInt(whole) * 10n ** BigInt(YGIDR_DECIMALS) + BigInt(fraction.padEnd(YGIDR_DECIMALS, "0"));
}

export function parseBaseUnits(amountBaseUnits: string): bigint {
  if (!/^\d+$/.test(amountBaseUnits) || amountBaseUnits === "0") {
    throw new Error("amountBaseUnits must be a positive integer string");
  }
  return BigInt(amountBaseUnits);
}

// Encodes a UUID (with or without dashes) as the contract BytesN<16> order id.
export function orderIdScVal(orderId: string): xdr.ScVal {
  const buf = Buffer.from(orderId.replace(/-/g, ""), "hex");
  if (buf.length !== 16) {
    throw new Error("order_id must encode to 16 bytes, got " + buf.length);
  }
  return xdr.ScVal.scvBytes(buf);
}

function addressScVal(value: string): xdr.ScVal {
  return new Address(value).toScVal();
}

// buyer funds escrow; buyer is the tx source so require_auth is covered.
export async function createOrder(params: {
  orderId: string;
  buyerKeypair: Keypair;
  farmerPublicKey: string;
  amountBaseUnits: bigint;
}): Promise<TxResult> {
  const contract = new Contract(CONFIG.escrowContractId);
  const op = contract.call(
    "create_order",
    orderIdScVal(params.orderId),
    addressScVal(params.buyerKeypair.publicKey()),
    addressScVal(params.farmerPublicKey),
    nativeToScVal(params.amountBaseUnits, { type: "i128" }),
  );
  return invokeSoroban(params.buyerKeypair, op);
}

// happy path; admin releases the full escrow to the recorded farmer.
export async function confirmDelivery(params: {
  orderId: string;
}): Promise<TxResult> {
  const admin = Keypair.fromSecret(CONFIG.adminSecret);
  const contract = new Contract(CONFIG.escrowContractId);
  const op = contract.call("confirm_delivery", orderIdScVal(params.orderId));
  return invokeSoroban(admin, op);
}

// breach path; admin pays farmer amount minus discount and refunds the rest.
export async function settleWithDiscount(params: {
  orderId: string;
  discountBps: number;
}): Promise<TxResult> {
  if (!Number.isInteger(params.discountBps) || params.discountBps < 0 || params.discountBps > 10_000) {
    throw new Error("discountBps must be an integer from 0 to 10000");
  }
  const admin = Keypair.fromSecret(CONFIG.adminSecret);
  const contract = new Contract(CONFIG.escrowContractId);
  const op = contract.call(
    "settle_with_discount",
    orderIdScVal(params.orderId),
    nativeToScVal(params.discountBps, { type: "u32" }),
  );
  return invokeSoroban(admin, op);
}
