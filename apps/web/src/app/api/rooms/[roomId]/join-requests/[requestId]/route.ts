import { NextResponse } from "next/server";

import { authenticatedApi, BigHeadApiError } from "@/lib/server-api-client";
import { getWorkspaceRequestContext } from "@/lib/workspace-request-context";

export async function PATCH(request: Request, context: { params: Promise<{ roomId: string; requestId: string }> }) {
  const organizationId = (await getWorkspaceRequestContext()).tenantId ?? "";
  const { roomId, requestId } = await context.params;
  if (!organizationId || !roomId || !requestId) return NextResponse.json({ detail: "Tenant ativo, sala e pedido sao obrigatorios." }, { status: 400 });
  const incoming = await request.json().catch(() => null) as { status?: unknown } | null;
  const statusValue = typeof incoming?.status === "string" ? incoming.status : "";
  if (!["approved", "rejected"].includes(statusValue)) {
    return NextResponse.json({ detail: "Informe uma decisao valida." }, { status: 422 });
  }
  try {
    const result = await authenticatedApi<unknown>(`/v1/rooms/${encodeURIComponent(roomId)}/join-requests/${encodeURIComponent(requestId)}`, {
      method: "PATCH",
      organizationId,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status: statusValue })
    });
    return NextResponse.json(result, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    const status = error instanceof BigHeadApiError ? error.status : 500;
    return NextResponse.json({ detail: error instanceof Error ? error.message : "Falha ao revisar pedido." }, { status });
  }
}
