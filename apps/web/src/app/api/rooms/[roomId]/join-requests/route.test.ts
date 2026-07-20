import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/server-api-client", () => ({
  authenticatedApi: vi.fn(),
  BigHeadApiError: class BigHeadApiError extends Error { constructor(public status: number, message: string) { super(message); } }
}));
vi.mock("@/lib/workspace-request-context", () => ({ getWorkspaceRequestContext: vi.fn().mockResolvedValue({ tenantId: "tenant-cookie" }) }));

import { authenticatedApi } from "@/lib/server-api-client";
import { GET, POST } from "./route";

describe("room join requests BFF", () => {
  it("lists pending requests", async () => {
    vi.mocked(authenticatedApi).mockResolvedValue({ room: { id: "room-7" }, requests: [{ id: "request-1", status: "pending" }] });
    const response = await GET(new Request("http://web.test/api/rooms/room-7/join-requests"), { params: Promise.resolve({ roomId: "room-7" }) });
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ requests: [{ id: "request-1", status: "pending" }] });
  });

  it("creates a request", async () => {
    vi.mocked(authenticatedApi).mockResolvedValue({ room: { id: "room-7" }, requests: [{ id: "request-1", status: "pending" }] });
    const response = await POST(
      new Request("http://web.test/api/rooms/room-7/join-requests", {
        method: "POST",
        body: JSON.stringify({ note: "Preciso entrar." })
      }),
      { params: Promise.resolve({ roomId: "room-7" }) }
    );
    expect(response.status).toBe(201);
    expect(authenticatedApi).toHaveBeenCalledWith("/v1/rooms/room-7/join-requests", expect.objectContaining({
      method: "POST",
      organizationId: "tenant-cookie"
    }));
  });
});
