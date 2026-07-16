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
  return BigInt(rupiah) * 10n ** BigInt(YGIDR_DECIMALS);
}

// Encodes a UUID (with or without dashes) as the contract BytesN<16> order id.
function orderIdScVal(orderId: string): xdr.ScVal {
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
  const admin = Keypair.fromSecret(CONFIG.adminSecret);
  const contract = new Contract(CONFIG.escrowContractId);
  const op = contract.call(
    "settle_with_discount",
    orderIdScVal(params.orderId),
    nativeToScVal(params.discountBps, { type: "u32" }),
  );
  return invokeSoroban(admin, op);
}
