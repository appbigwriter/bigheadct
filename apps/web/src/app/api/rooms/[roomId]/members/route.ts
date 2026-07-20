import { NextResponse } from "next/server";

import { authenticatedApi, BigHeadApiError } from "@/lib/server-api-client";
import { getWorkspaceRequestContext } from "@/lib/workspace-request-context";

export async function GET(_request: Request, context: { params: Promise<{ roomId: string }> }) {
  const organizationId = (await getWorkspaceRequestContext()).tenantId ?? "";
  const { roomId } = await context.params;
  if (!organizationId || !roomId) return NextResponse.json({ detail: "Tenant ativo e sala sao obrigatorios." }, { status: 400 });
  try {
    const result = await authenticatedApi<unknown>(`/v1/rooms/${encodeURIComponent(roomId)}/members`, { organizationId });
    return NextResponse.json(result, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    const status = error instanceof BigHeadApiError ? error.status : 500;
    return NextResponse.json({ detail: error instanceof Error ? error.message : "Falha ao carregar membros." }, { status });
  }
}

export async function POST(request: Request, context: { params: Promise<{ roomId: string }> }) {
  const organizationId = (await getWorkspaceRequestContext()).tenantId ?? "";
  const { roomId } = await context.params;
  if (!organizationId || !roomId) return NextResponse.json({ detail: "Tenant ativo e sala sao obrigatorios." }, { status: 400 });
  const incoming = await request.json().catch(() => null) as { email?: unknown } | null;
  const email = typeof incoming?.email === "string" ? incoming.email.trim() : "";
  if (!email) return NextResponse.json({ detail: "Informe um e-mail valido." }, { status: 422 });
  try {
    const result = await authenticatedApi<unknown>(`/v1/rooms/${encodeURIComponent(roomId)}/members`, {
      method: "POST",
      organizationId,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email })
    });
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    const status = error instanceof BigHeadApiError ? error.status : 500;
    return NextResponse.json({ detail: error instanceof Error ? error.message : "Falha ao convidar membro." }, { status });
  }
}
