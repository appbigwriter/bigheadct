import { NextResponse } from "next/server";

import { authenticatedApi, BigHeadApiError } from "@/lib/server-api-client";
import { getWorkspaceRequestContext } from "@/lib/workspace-request-context";

export async function GET(_request: Request, context: { params: Promise<{ roomId: string }> }) {
  const organizationId = (await getWorkspaceRequestContext()).tenantId ?? "";
  const { roomId } = await context.params;
  if (!organizationId || !roomId) return NextResponse.json({ detail: "Tenant ativo e sala sao obrigatorios." }, { status: 400 });
  try {
    const result = await authenticatedApi<unknown>(`/v1/rooms/${encodeURIComponent(roomId)}/join-requests`, { organizationId });
    return NextResponse.json(result, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    const status = error instanceof BigHeadApiError ? error.status : 500;
    return NextResponse.json({ detail: error instanceof Error ? error.message : "Falha ao carregar pedidos." }, { status });
  }
}

export async function POST(request: Request, context: { params: Promise<{ roomId: string }> }) {
  const organizationId = (await getWorkspaceRequestContext()).tenantId ?? "";
  const { roomId } = await context.params;
  if (!organizationId || !roomId) return NextResponse.json({ detail: "Tenant ativo e sala sao obrigatorios." }, { status: 400 });
  const incoming = await request.json().catch(() => null) as { note?: unknown } | null;
  const note = typeof incoming?.note === "string" ? incoming.note.trim() : "";
  try {
    const result = await authenticatedApi<unknown>(`/v1/rooms/${encodeURIComponent(roomId)}/join-requests`, {
      method: "POST",
      organizationId,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ note: note || null })
    });
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    const status = error instanceof BigHeadApiError ? error.status : 500;
    return NextResponse.json({ detail: error instanceof Error ? error.message : "Falha ao solicitar acesso." }, { status });
  }
}
