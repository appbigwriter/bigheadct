import { NextResponse } from "next/server";

import { authenticatedApi, BigHeadApiError } from "@/lib/server-api-client";
import { getWorkspaceRequestContext } from "@/lib/workspace-request-context";

function failure(error: unknown) {
  const status = error instanceof BigHeadApiError ? error.status : 500;
  return NextResponse.json({ detail: error instanceof Error ? error.message : "Operacao nao concluida." }, { status });
}

export async function GET() {
  const organizationId = (await getWorkspaceRequestContext()).tenantId ?? "";
  if (!organizationId) return NextResponse.json({ detail: "Nenhuma organizacao ativa." }, { status: 400 });
  try {
    return NextResponse.json(await authenticatedApi<unknown>("/v1/prompts", { organizationId }), {
      headers: { "cache-control": "no-store" }
    });
  } catch (error) {
    return failure(error);
  }
}
