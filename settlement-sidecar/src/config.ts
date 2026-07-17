import "dotenv/config";
import { Networks } from "@stellar/stellar-sdk";

// Central runtime config. Fields are mutable so deploy.ts can inject freshly
// generated singletons before invoking the chain helpers.
export const CONFIG = {
  rpcUrl: process.env.SOROBAN_RPC_URL ?? "https://soroban-testnet.stellar.org",
  horizonUrl: process.env.HORIZON_URL ?? "https://horizon-testnet.stellar.org",
  friendbotUrl: process.env.FRIENDBOT_URL ?? "https://friendbot.stellar.org",
  networkPassphrase: process.env.NETWORK_PASSPHRASE ?? Networks.TESTNET,
  ygidrCode: process.env.YGIDR_CODE ?? "YGIDR",
  issuerSecret: process.env.ISSUER_SECRET ?? "",
  adminSecret: process.env.ADMIN_SECRET ?? "",
  treasurySecret: process.env.TREASURY_SECRET ?? "",
  ygidrIssuerPublic: process.env.YGIDR_ISSUER_PUBLIC ?? "",
  ygidrSacAddress: process.env.YGIDR_SAC_ADDRESS ?? "",
  escrowContractId: process.env.ESCROW_CONTRACT_ID ?? "",
  port: Number(process.env.PORT || process.env.SIDECAR_PORT || 8090),
  host: process.env.HOST || "::",
  authToken: process.env.SIDECAR_TOKEN ?? "dev-sidecar-token",
  provisionXlm: process.env.PROVISION_XLM_AMOUNT ?? "5",
  starterMintRupiah: process.env.STARTER_MINT_RUPIAH ?? "5000000",
};

// YGIDR mirrors classic-asset SAC decimals: Rp 1 = 1.0000000 YGIDR
export const YGIDR_DECIMALS = 7;

// Inclusion fee floor for soroban transactions; prepareTransaction adds the
// resource fee on top after simulation.
export const SOROBAN_INCLUSION_FEE = "1000000";
