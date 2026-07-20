import { NextResponse } from "next/server";

import { authenticatedApi, BigHeadApiError } from "@/lib/server-api-client";
import { getWorkspaceRequestContext } from "@/lib/workspace-request-context";

function failure(error: unknown) {
  const status = error instanceof BigHeadApiError ? error.status : 500;
  return NextResponse.json({ detail: error instanceof Error ? error.message : "Nao foi possivel carregar os leads." }, { status });
}

function trustedOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  const allowed = new Set([new URL(request.url).origin]);
  const appUrl = process.env.APP_URL?.trim();
  if (appUrl) {
    try {
      allowed.add(new URL(appUrl).origin);
    } catch {
      /* never trust invalid configuration */
    }
  }
  return allowed.has(origin);
}

export async function GET(request: Request) {
  const organizationId = (await getWorkspaceRequestContext()).tenantId ?? "";
  if (!organizationId) return NextResponse.json({ detail: "Nenhuma organizacao ativa." }, { status: 400 });
  const input = new URL(request.url).searchParams;
  const query = new URLSearchParams({ limit: "100" });
  for (const name of ["stage", "ownerId"] as const) {
    const value = input.get(name)?.trim();
    if (value) query.set(name, value);
  }
  try {
    return NextResponse.json(await authenticatedApi<unknown>(`/v1/crm/leads?${query}`, { organizationId }), { headers: { "cache-control": "no-store" } });
  } catch (error) { return failure(error); }
}

export async function POST(request: Request) {
  if (!trustedOrigin(request)) return NextResponse.json({ detail: "Origem nao autorizada." }, { status: 403 });
  const organizationId = (await getWorkspaceRequestContext()).tenantId ?? "";
  if (!organizationId) return NextResponse.json({ detail: "Nenhuma organizacao ativa." }, { status: 400 });
  const key = request.headers.get("idempotency-key")?.trim() ?? "";
  if (!key || key.length > 200) return NextResponse.json({ detail: "Chave de envio invalida." }, { status: 422 });
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const accountName = typeof body?.accountName === "string" ? body.accountName.trim() : "";
  if (!accountName) return NextResponse.json({ detail: "Informe a conta do lead." }, { status: 422 });
  try {
    const result = await authenticatedApi<unknown>("/v1/crm/leads", {
      method: "POST",
      organizationId,
      headers: { "content-type": "application/json", "Idempotency-Key": key },
      body: JSON.stringify({
        accountName,
        contactName: typeof body?.contactName === "string" ? body.contactName.trim() || null : null,
        email: typeof body?.email === "string" ? body.email.trim() || null : null,
        phone: typeof body?.phone === "string" ? body.phone.trim() || null : null,
        source: typeof body?.source === "string" ? body.source.trim() || null : null,
        ownerUserId: typeof body?.ownerUserId === "string" ? body.ownerUserId.trim() || null : null,
        nextAction: typeof body?.nextAction === "string" ? body.nextAction.trim() || null : null,
        icpScore: typeof body?.icpScore === "number" ? body.icpScore : null,
        scoreFactors: body?.scoreFactors && typeof body.scoreFactors === "object" ? body.scoreFactors : {},
        scoreAlgorithmVersion: typeof body?.scoreAlgorithmVersion === "string" ? body.scoreAlgorithmVersion.trim() || null : null
      })
    });
    return NextResponse.json(result, { status: 201 });
  } catch (error) { return failure(error); }
}
