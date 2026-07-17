import {
  Keypair,
  Asset,
  Operation,
  Address,
  scValToNative,
} from "@stellar/stellar-sdk";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { randomBytes } from "node:crypto";
import { CONFIG } from "../src/config.js";
import { invokeSoroban } from "../src/soroban.js";
import { friendbotFund } from "../src/stellar.js";

const WASM_PATH = resolve(
  process.cwd(),
  "../contract/target/wasm32v1-none/release/yieldgrid_escrow.wasm",
);
const ENV_PATH = resolve(process.cwd(), ".env");

async function main(): Promise<void> {
  console.log("Generating singleton keypairs (issuer, admin, treasury)...");
  const issuer = Keypair.random();
  const admin = Keypair.random();
  const treasury = Keypair.random();

  // Inject into CONFIG so chain helpers use them at call time.
  CONFIG.issuerSecret = issuer.secret();
  CONFIG.adminSecret = admin.secret();
  CONFIG.treasurySecret = treasury.secret();
  CONFIG.ygidrIssuerPublic = issuer.publicKey();

  console.log("Funding issuer/admin/treasury via friendbot...");
  await friendbotFund(issuer.publicKey());
  await friendbotFund(admin.publicKey());
  await friendbotFund(treasury.publicKey());

  console.log("Deploying YGIDR Stellar Asset Contract...");
  const asset = new Asset(CONFIG.ygidrCode, issuer.publicKey());
  try {
    await invokeSoroban(admin, Operation.createStellarAssetContract({ asset }));
  } catch (err) {
    console.warn("  SAC deploy note:", err instanceof Error ? err.message : err);
  }
  const sacAddress = asset.contractId(CONFIG.networkPassphrase);
  CONFIG.ygidrSacAddress = sacAddress;
  console.log("  YGIDR SAC:", sacAddress);

  console.log("Uploading escrow wasm...");
  const wasm = readFileSync(WASM_PATH);
  const upload = await invokeSoroban(admin, Operation.uploadContractWasm({ wasm }));
  const wasmHash = Buffer.from(scValToNative(upload.returnValue!) as Uint8Array);
  console.log("  wasm hash:", wasmHash.toString("hex"));

  console.log("Creating escrow contract with constructor(admin, token)...");
  const create = await invokeSoroban(
    admin,
    Operation.createCustomContract({
      address: new Address(admin.publicKey()),
      wasmHash,
      salt: randomBytes(32),
      constructorArgs: [
        new Address(admin.publicKey()).toScVal(),
        new Address(sacAddress).toScVal(),
      ],
    }),
  );
  const contractId = scValToNative(create.returnValue!) as string;
  CONFIG.escrowContractId = contractId;
  console.log("  escrow contract:", contractId);

  writeEnv(issuer, admin, treasury, sacAddress, contractId);
  console.log("\nDeploy complete. Wrote", ENV_PATH);
  console.log(
    "stellar.expert:",
    "https://stellar.expert/explorer/testnet/contract/" + contractId,
  );
}

function writeEnv(
  issuer: Keypair,
  admin: Keypair,
  treasury: Keypair,
  sacAddress: string,
  contractId: string,
): void {
  const lines = [
    "NETWORK_PASSPHRASE=" + CONFIG.networkPassphrase,
    "SOROBAN_RPC_URL=" + CONFIG.rpcUrl,
    "HORIZON_URL=" + CONFIG.horizonUrl,
    "FRIENDBOT_URL=" + CONFIG.friendbotUrl,
    "YGIDR_CODE=" + CONFIG.ygidrCode,
    "ISSUER_SECRET=" + issuer.secret(),
    "ADMIN_SECRET=" + admin.secret(),
    "TREASURY_SECRET=" + treasury.secret(),
    "YGIDR_ISSUER_PUBLIC=" + issuer.publicKey(),
    "YGIDR_SAC_ADDRESS=" + sacAddress,
    "ESCROW_CONTRACT_ID=" + contractId,
    "SIDECAR_PORT=" + CONFIG.port,
    "SIDECAR_TOKEN=" + CONFIG.authToken,
    "PROVISION_XLM_AMOUNT=" + CONFIG.provisionXlm,
    "STARTER_MINT_RUPIAH=" + CONFIG.starterMintRupiah,
    "",
  ];
  writeFileSync(ENV_PATH, lines.join("\n"));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
