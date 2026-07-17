import express, { type Request, type Response, type NextFunction } from "express";
import { Keypair } from "@stellar/stellar-sdk";
import { CONFIG } from "./config.js";
import { server as rpcServer } from "./soroban.js";
import {
  provision,
  mintYgidr,
  getYgidrBalance,
  type Role,
} from "./stellar.js";
import {
  createOrder,
  confirmDelivery,
  settleWithDiscount,
  parseBaseUnits,
} from "./escrow.js";

const app = express();
app.use(express.json());

// Shared-secret bearer guard for the internal backend-to-sidecar channel.
function auth(req: Request, res: Response, next: NextFunction): void {
  const header = req.header("authorization") ?? "";
  if (header !== "Bearer " + CONFIG.authToken) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }
  next();
}

function wrap(handler: (req: Request, res: Response) => Promise<void>) {
  return (req: Request, res: Response) => {
    handler(req, res).catch((err: unknown) => {
      const message = err instanceof Error ? err.message : String(err);
      res.status(500).json({ error: message });
    });
  };
}

app.get(
  "/health",
  wrap(async (_req, res) => {
    const health = await rpcServer.getHealth();
    const configured = Boolean(
      CONFIG.escrowContractId &&
      CONFIG.ygidrSacAddress &&
      CONFIG.adminSecret &&
      CONFIG.issuerSecret &&
      CONFIG.treasurySecret,
    );
    let admin = "0";
    if (CONFIG.ygidrIssuerPublic && CONFIG.adminSecret) {
      admin = await getYgidrBalance(Keypair.fromSecret(CONFIG.adminSecret).publicKey()).catch(() => "n/a");
    }
    res.json({
      status: configured && health.status === "healthy" ? "ready" : "not_ready",
      rpcStatus: health.status,
      configured,
      escrowContractId: CONFIG.escrowContractId || null,
      ygidrSacAddress: CONFIG.ygidrSacAddress || null,
      adminYgidrBalance: admin,
    });
  }),
);

app.post(
  "/provision",
  auth,
  wrap(async (req, res) => {
    const role = req.body?.role as Role;
    if (role !== "buyer" && role !== "farmer") {
      res.status(400).json({ error: "role must be buyer or farmer" });
      return;
    }
    res.json(await provision(role));
  }),
);

app.post(
  "/mint",
  auth,
  wrap(async (req, res) => {
    const { publicKey, rupiah } = req.body ?? {};
    if (!publicKey || rupiah == null) {
      res.status(400).json({ error: "publicKey and rupiah required" });
      return;
    }
    const hash = await mintYgidr(publicKey, String(rupiah));
    res.json({ hash });
  }),
);

app.post(
  "/sign",
  auth,
  wrap(async (req, res) => {
    const { secret, payload } = req.body ?? {};
    if (!secret || typeof payload !== "string") {
      res.status(400).json({ error: "secret and payload required" });
      return;
    }
    const signature = Keypair.fromSecret(secret).sign(Buffer.from(payload, "utf8"));
    res.json({ signature: signature.toString("base64") });
  }),
);

app.post(
  "/escrow/create",
  auth,
  wrap(async (req, res) => {
    const { orderId, buyerSecret, farmerPublicKey, amountBaseUnits } = req.body ?? {};
    if (!orderId || !buyerSecret || !farmerPublicKey || amountBaseUnits == null) {
      res.status(400).json({ error: "orderId, buyerSecret, farmerPublicKey, amountBaseUnits required" });
      return;
    }
    const result = await createOrder({
      orderId,
      buyerKeypair: Keypair.fromSecret(buyerSecret),
      farmerPublicKey,
      amountBaseUnits: parseBaseUnits(String(amountBaseUnits)),
    });
    res.json({ hash: result.hash });
  }),
);

app.post(
  "/escrow/confirm",
  auth,
  wrap(async (req, res) => {
    const { orderId } = req.body ?? {};
    if (!orderId) {
      res.status(400).json({ error: "orderId required" });
      return;
    }
    const result = await confirmDelivery({ orderId });
    res.json({ hash: result.hash });
  }),
);

app.post(
  "/escrow/settle",
  auth,
  wrap(async (req, res) => {
    const { orderId, discountBps } = req.body ?? {};
    if (!orderId || discountBps == null) {
      res.status(400).json({ error: "orderId and discountBps required" });
      return;
    }
    const result = await settleWithDiscount({ orderId, discountBps: Number(discountBps) });
    res.json({ hash: result.hash });
  }),
);

export const httpServer = app.listen(CONFIG.port, () => {
  console.log("settlement sidecar listening on :" + CONFIG.port);
});
