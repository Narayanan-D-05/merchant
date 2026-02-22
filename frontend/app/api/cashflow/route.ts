/**
 * app/api/cashflow/route.ts
 *
 * Merchant frontend — server-side API bridge for the CashFlow402 SDK.
 *
 * The CashFlow402 SDK uses Node.js-native modules (http, https) and cannot
 * run in the browser. This Next.js API route acts as a secure server-side
 * proxy so the browser UI can trigger SDK actions without exposing keys.
 *
 * POST /api/cashflow
 *   { action: "createSubscription", depositSats, intervalBlocks? }
 *   { action: "callProtectedApi",   tokenCategory }
 *   { action: "getSubscriptionToken", tokenCategory }
 */

import { NextRequest, NextResponse } from "next/server";
import { CashFlow402Client } from "@narayanan-me/cashflow402";

const CASHFLOW_SERVER_URL = process.env.CASHFLOW_SERVER_URL ?? "http://localhost:3000";
// In a real app, the SUBSCRIBER_WIF would be stored securely per-user.
// For this demo, we use a single env var.
const SUBSCRIBER_WIF = process.env.SUBSCRIBER_WIF ?? "";

function getClient() {
    if (!SUBSCRIBER_WIF) {
        throw new Error(
            "SUBSCRIBER_WIF environment variable is not configured on the merchant server."
        );
    }
    return new CashFlow402Client({
        walletWif: SUBSCRIBER_WIF,
        network: "chipnet",
        serverUrl: CASHFLOW_SERVER_URL,
    });
}

export async function POST(req: NextRequest) {
    let body: Record<string, unknown>;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { action } = body;

    try {
        // ── Action: Create a new subscription ─────────────────────────────────────
        if (action === "createSubscription") {
            const depositSats = Number(body.depositSats ?? 8000);
            const intervalBlocks = body.intervalBlocks ? Number(body.intervalBlocks) : undefined;

            const client = getClient();
            const info = await client.createSubscription({
                depositSats,
                intervalBlocks,
                autoFund: true,
            });

            return NextResponse.json({
                success: true,
                subscription: info,
                message: `Subscription created. Contract: ${info.contractAddress}`,
            });
        }

        // ── Action: Call protected /api/subscription/data endpoint ────────────────
        if (action === "callProtectedApi") {
            const tokenCategory = String(body.tokenCategory ?? "");
            if (!tokenCategory) {
                return NextResponse.json({ error: "tokenCategory is required" }, { status: 400 });
            }

            const res = await fetch(`${CASHFLOW_SERVER_URL}/api/subscription/data`, {
                headers: { "X-Subscription-Token": tokenCategory },
            });

            const data = await res.json();
            return NextResponse.json({ success: res.ok, statusCode: res.status, data });
        }

        // ── Action: Get a subscription JWT from the CashFlow server ───────────────
        if (action === "getSubscriptionToken") {
            const tokenCategory = String(body.tokenCategory ?? "");
            if (!tokenCategory) {
                return NextResponse.json({ error: "tokenCategory is required" }, { status: 400 });
            }

            const client = getClient();
            const accessToken = await client.getSubscriptionToken(tokenCategory);
            return NextResponse.json({ success: true, accessToken });
        }

        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        console.error("[/api/cashflow] Error:", message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

// Health check
export async function GET() {
    return NextResponse.json({
        status: "ok",
        sdk: "@narayanan-me/cashflow402",
        cashflowServer: CASHFLOW_SERVER_URL,
        subscriberConfigured: Boolean(SUBSCRIBER_WIF),
    });
}
