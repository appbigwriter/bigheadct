import { NextResponse } from "next/server";

import { authenticatedApi, BigHeadApiError } from "@/lib/server-api-client";
import { publicApi } from "@/lib/server-api-client";
import { canonicalScreenRuleContracts, resolveCanonicalScreenRuleRequests, type ScreenRuleCommand } from "@/lib/screen-rule-contracts";
import { getWorkspaceRequestContext } from "@/lib/workspace-request-context";
import { shouldUseMockWorkspace } from "@/lib/workspace-mode";

function commandFrom(value: unknown): ScreenRuleCommand | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const body = value as Record<string, unknown>;
  if (typeof body.code !== "string" || !/^T\d{2}$/.test(body.code)) return null;
  if (typeof body.operation !== "string" || !(body.operation in canonicalScreenRuleContracts)) return null;
  if (canonicalScreenRuleContracts[body.operation as keyof typeof canonicalScreenRuleContracts].code !== body.code) return null;
  if (!body.payload || typeof body.payload !== "object" || Array.isArray(body.payload)) return null;
  return body as unknown as ScreenRuleCommand;
}

async function executeCanonicalRequest(request: ReturnType<typeof resolveCanonicalScreenRuleRequests>[number], organizationId: string | null) {
  const init: RequestInit = { method: request.method };
  if (request.body) init.headers = { "content-type": "application/json", ...request.headers };
  else if (request.headers) init.headers = request.headers;
  if (request.body) init.body = JSON.stringify(request.body);
  if (request.auth === "public") return publicApi<unknown>(request.path, init);
  if (!organizationId) throw new BigHeadApiError(400, "Nenhuma organizacao ativa.");
  const path = request.tenantPath ? request.path.replace("{organizationId}", encodeURIComponent(organizationId)) : request.path;
  return authenticatedApi<unknown>(path, { ...init, organizationId });
}

export async function POST(request: Request) {
  const command = commandFrom(await request.json().catch(() => null));
  if (!command) return NextResponse.json({ message: "Comando invalido." }, { status: 422 });
  if (shouldUseMockWorkspace()) {
    return NextResponse.json({ message: "Operacao aceita pela fronteira mock." });
  }
  try {
    const requests = resolveCanonicalScreenRuleRequests(command);
    const needsTenant = requests.some((request) => request.auth === "authenticated");
    const organizationId = needsTenant ? (await getWorkspaceRequestContext()).tenantId ?? null : null;
    const results = [];
    for (const request of requests) results.push(await executeCanonicalRequest(request, organizationId));
    return NextResponse.json(results.length === 1 ? results[0] : { results });
  } catch (error) {
    const status = error instanceof BigHeadApiError ? error.status : 500;
    const message = error instanceof BigHeadApiError ? error.message : "Operacao indisponivel.";
    return NextResponse.json({ message }, { status });
  }
}
