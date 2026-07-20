import { NextResponse } from "next/server";

import { authenticatedApi, BigHeadApiError } from "@/lib/server-api-client";
import { getWorkspaceRequestContext } from "@/lib/workspace-request-context";

function failure(error: unknown) {
  const status = error instanceof BigHeadApiError ? error.status : 500;
  return NextResponse.json({ detail: error instanceof Error ? error.message : "Operacao nao concluida." }, { status });
}

export async function PATCH(request: Request, context: { params: Promise<{ teamId: string }> }) {
  const organizationId = (await getWorkspaceRequestContext()).tenantId ?? "";
  const { teamId } = await context.params;
  if (!organizationId) return NextResponse.json({ detail: "Nenhuma organizacao ativa." }, { status: 400 });
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  try {
    return NextResponse.json(await authenticatedApi<unknown>(`/v1/teams/${encodeURIComponent(teamId)}`, {
      method: "PATCH",
      organizationId,
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body ?? {})
    }));
  } catch (error) {
    return failure(error);
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ teamId: string }> }) {
  const organizationId = (await getWorkspaceRequestContext()).tenantId ?? "";
  const { teamId } = await context.params;
  if (!organizationId) return NextResponse.json({ detail: "Nenhuma organizacao ativa." }, { status: 400 });
  try {
    return NextResponse.json(await authenticatedApi<unknown>(`/v1/teams/${encodeURIComponent(teamId)}`, {
      method: "DELETE",
      organizationId
    }));
  } catch (error) {
    return failure(error);
  }
}
