import { NextResponse } from "next/server";

import { authenticatedApi, BigHeadApiError } from "@/lib/server-api-client";
import { getWorkspaceRequestContext } from "@/lib/workspace-request-context";

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

function failure(error: unknown) {
  const status = error instanceof BigHeadApiError ? error.status : 500;
  return NextResponse.json({ detail: error instanceof Error ? error.message : "Operacao nao concluida." }, { status });
}

export async function GET() {
  const organizationId = (await getWorkspaceRequestContext()).tenantId ?? "";
  if (!organizationId) return NextResponse.json({ detail: "Nenhuma organizacao ativa." }, { status: 400 });
  try {
    return NextResponse.json(await authenticatedApi<unknown>("/v1/projects", { organizationId }), { headers: { "cache-control": "no-store" } });
  } catch (error) {
    return failure(error);
  }
}

export async function POST(request: Request) {
  if (!trustedOrigin(request)) return NextResponse.json({ detail: "Origem nao autorizada." }, { status: 403 });
  const organizationId = (await getWorkspaceRequestContext()).tenantId ?? "";
  if (!organizationId) return NextResponse.json({ detail: "Nenhuma organizacao ativa." }, { status: 400 });
  const key = request.headers.get("idempotency-key")?.trim() ?? "";
  if (!key || key.length > 200) return NextResponse.json({ detail: "Chave de envio invalida." }, { status: 422 });
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const slug = typeof body?.slug === "string" ? body.slug.trim() : "";
  if (!name || !slug) return NextResponse.json({ detail: "Nome e slug sao obrigatorios." }, { status: 422 });
  try {
    const result = await authenticatedApi<unknown>("/v1/projects", {
      method: "POST",
      organizationId,
      headers: { "content-type": "application/json", "Idempotency-Key": key },
      body: JSON.stringify({
        name,
        slug,
        businessType: typeof body?.businessType === "string" ? body.businessType : "custom",
        templateKey: typeof body?.templateKey === "string" ? body.templateKey : "custom_base",
        domain: typeof body?.domain === "string" ? body.domain.trim() || null : null,
        language: typeof body?.language === "string" ? body.language.trim() || "pt" : "pt",
        description: typeof body?.description === "string" ? body.description.trim() || null : null
      })
    });
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return failure(error);
  }
}
