# YieldGrid Settlement Sidecar

## Railway deployment

Deploy this directory as a separate service in the same Railway project and
environment as the backend. Keep the sidecar private; the browser/frontend must
never call it directly.

1. Create a service named `settlement-sidecar` from the YieldGrid GitHub repo.
2. Set **Root Directory** to `/settlement-sidecar`.
3. Set **Railway Config File** to `/settlement-sidecar/railway.toml`.
4. Add the variables listed below. Set `PORT=8090` explicitly so the backend can
   reference the same port through Railway variables.
5. Deploy and confirm that `/health/live` passes in the deployment details.

Required service variables:

```dotenv
PORT=8090
HOST=::
SIDECAR_TOKEN=<strong-random-shared-token>
ISSUER_SECRET=<stellar-secret>
ADMIN_SECRET=<stellar-secret>
TREASURY_SECRET=<stellar-secret>
YGIDR_ISSUER_PUBLIC=<stellar-public-key>
YGIDR_SAC_ADDRESS=<deployed-sac-address>
ESCROW_CONTRACT_ID=<deployed-contract-id>
```

Network and provisioning variables can retain the testnet defaults from
`.env.example` for a demo deployment. Copy their actual values from the local
sidecar `.env` into Railway's Variables editor; never commit that file.

Configure these variables on the Railway backend service:

```dotenv
SIDECAR_ENABLED=true
SIDECAR_URL=http://${{settlement-sidecar.RAILWAY_PRIVATE_DOMAIN}}:${{settlement-sidecar.PORT}}
SIDECAR_TOKEN=${{settlement-sidecar.SIDECAR_TOKEN}}
SIDECAR_TIMEOUT=120s
```

Both services must be in the same Railway project and environment for the
private hostname to resolve. A public domain is not required for the sidecar.

After both deployments complete, the backend startup log should contain:

```text
Settlement sidecar configured: enabled=true
```

The authenticated sidecar endpoints must return `401` without the shared bearer
token. Use `/health` only for Stellar readiness diagnostics; Railway uses the
lightweight `/health/live` endpoint for deployment health.
