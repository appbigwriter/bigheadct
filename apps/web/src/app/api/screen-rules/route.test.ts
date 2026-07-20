import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  authenticatedApi: vi.fn(),
  publicApi: vi.fn(),
  getContext: vi.fn(),
  shouldUseMock: vi.fn()
}));

vi.mock("@/lib/server-api-client", () => ({
  authenticatedApi: mocks.authenticatedApi,
  publicApi: mocks.publicApi,
  BigHeadApiError: class BigHeadApiError extends Error { constructor(public status: number, message: string) { super(message); } }
}));
vi.mock("@/lib/workspace-request-context", () => ({ getWorkspaceRequestContext: mocks.getContext }));
vi.mock("@/lib/workspace-mode", () => ({ shouldUseMockWorkspace: mocks.shouldUseMock }));

import { POST } from "./route";

const request = (body: unknown) => new Request("http://localhost/api/screen-rules", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify(body)
});

describe("POST /api/screen-rules", () => {
  beforeEach(() => {
    mocks.authenticatedApi.mockReset().mockResolvedValue({ ok: true });
    mocks.publicApi.mockReset().mockResolvedValue({ accepted: true });
    mocks.getContext.mockReset().mockResolvedValue({ tenantId: "tenant-1" });
    mocks.shouldUseMock.mockReset().mockReturnValue(false);
  });

  it("dispatches T02 to the real public recovery endpoint", async () => {
    const response = await POST(request({ code: "T02", operation: "auth.recovery.request", payload: { normalizedEmail: "camila@acme.ai" } }));
    expect(response.status).toBe(200);
    expect(mocks.publicApi).toHaveBeenCalledWith("/v1/auth/recovery", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "camila@acme.ai" })
    });
    expect(mocks.authenticatedApi).not.toHaveBeenCalled();
    expect(mocks.getContext).not.toHaveBeenCalled();
  });

  it("dispatches an authenticated rule to its canonical tenant endpoint", async () => {
    const response = await POST(request({ code: "T53", operation: "organizations.patch", payload: { domain: "acme.ai", expectedUpdatedAt: "2026-07-18T12:00:00Z" } }));
    expect(response.status).toBe(200);
    expect(mocks.authenticatedApi).toHaveBeenCalledWith("/v1/organizations/tenant-1", expect.objectContaining({
      method: "PATCH",
      organizationId: "tenant-1",
      body: JSON.stringify({ domains: ["acme.ai"], expectedUpdatedAt: "2026-07-18T12:00:00Z" })
    }));
    expect(mocks.authenticatedApi.mock.calls[0]?.[0]).not.toBe("/v1/screen-rules");
  });

  it("rejects an authenticated operation without request-scoped tenant", async () => {
    mocks.getContext.mockResolvedValue({ tenantId: null });
    const response = await POST(request({ code: "T53", operation: "organizations.patch", payload: { domain: "acme.ai", expectedUpdatedAt: "2026-07-18T12:00:00Z", organizationId: "attacker-tenant" } }));
    expect(response.status).toBe(400);
    expect(mocks.authenticatedApi).not.toHaveBeenCalled();
  });

  it("propagates transport failure without reporting the screen effect as successful", async () => {
    mocks.publicApi.mockRejectedValue(new Error("provider unavailable"));
    const response = await POST(request({ code: "T02", operation: "auth.recovery.request", payload: { normalizedEmail: "camila@acme.ai" } }));
    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ message: "Operacao indisponivel." });
  });

  it("rejects unknown operations and code-operation mismatches", async () => {
    expect((await POST(request({ code: "T02", operation: "unknown", payload: {} }))).status).toBe(422);
    expect((await POST(request({ code: "T03", operation: "auth.recovery.request", payload: {} }))).status).toBe(422);
    expect(mocks.publicApi).not.toHaveBeenCalled();
    expect(mocks.authenticatedApi).not.toHaveBeenCalled();
  });

  it("keeps the same component boundary in mock mode", async () => {
    mocks.shouldUseMock.mockReturnValue(true);
    const response = await POST(request({ code: "T02", operation: "auth.recovery.request", payload: { normalizedEmail: "camila@acme.ai" } }));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ message: "Operacao aceita pela fronteira mock." });
    expect(mocks.publicApi).not.toHaveBeenCalled();
  });
});
