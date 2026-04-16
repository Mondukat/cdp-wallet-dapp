/**
 * Vercel Serverless Function — CDP Auth Proxy
 * File location: /api/cdp.ts  (in your Vite project root)
 *
 * Vercel env vars to set in dashboard:
 *   CDP_API_KEY_ID      = your key ID
 *   CDP_API_KEY_SECRET  = your PEM or base64 private key
 *
 * Frontend calls:
 *   POST /api/cdp        { method, path, body? }
 *   GET  /api/cdp?path=  /platform/v2/...
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { SignJWT, importPKCS8, importJWK } from "jose";
import { randomBytes } from "crypto";

const CDP_HOST = "api.cdp.coinbase.com";
const CDP_BASE = `https://${CDP_HOST}`;

// ── JWT builder ───────────────────────────────────────────────────────────────

function detectKeyType(secret: string): "EC" | "Ed25519" {
  const t = secret.trim();
  if (t.startsWith("-----BEGIN EC PRIVATE KEY-----")) return "EC";
  if (t.startsWith("-----BEGIN PRIVATE KEY-----")) return "EC";
  return "Ed25519";
}

async function importKey(secret: string, type: "EC" | "Ed25519") {
  if (type === "EC") {
    return importPKCS8(secret, "ES256");
  }
  const raw = Buffer.from(secret.trim(), "base64");
  return importJWK(
    { kty: "OKP", crv: "Ed25519", d: raw.toString("base64url"), x: "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" },
    "EdDSA"
  );
}

async function buildJwt(method: string, path: string): Promise<string> {
  const keyId = process.env.CDP_API_KEY_ID!;
  const secret = process.env.CDP_API_KEY_SECRET!;

  const type = detectKeyType(secret);
  const alg = type === "EC" ? "ES256" : "EdDSA";
  const key = await importKey(secret, type);

  const now = Math.floor(Date.now() / 1000);
  const nonce = randomBytes(16).toString("hex");

  return new SignJWT({
    sub: keyId,
    iss: "cdp",
    aud: ["cdp_service"],
    nbf: now,
    exp: now + 120,
    uri: `${method.toUpperCase()} ${CDP_HOST}${path}`,
  })
    .setProtectedHeader({ alg, kid: keyId, typ: "JWT", nonce })
    .sign(key);
}

// ── Handler ───────────────────────────────────────────────────────────────────

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS — allow your own Vercel domain
  res.setHeader("Access-Control-Allow-Origin", process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  if (!process.env.CDP_API_KEY_ID || !process.env.CDP_API_KEY_SECRET) {
    return res.status(500).json({ error: "CDP credentials not configured" });
  }

  // Resolve method + path from either GET querystring or POST body
  let method = "GET";
  let path: string | undefined;
  let body: unknown;

  if (req.method === "GET") {
    path = req.query.path as string;
  } else if (req.method === "POST") {
    method = (req.body?.method || "GET").toUpperCase();
    path = req.body?.path;
    body = req.body?.body;
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!path || !path.startsWith("/platform/")) {
    return res.status(400).json({ error: "path must start with /platform/" });
  }

  try {
    const token = await buildJwt(method, path);

    const upstream = await fetch(`${CDP_BASE}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await upstream.json();
    return res.status(upstream.status).json(data);
  } catch (err: any) {
    console.error("[cdp proxy]", err);
    return res.status(500).json({ error: err.message });
  }
}
