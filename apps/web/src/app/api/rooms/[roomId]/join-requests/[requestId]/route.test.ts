import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/server-api-client", () => ({
  authenticatedApi: vi.fn(),
  BigHeadApiError: class BigHeadApiError extends Error { constructor(public status: number, message: string) { super(message); } }
}));
vi.mock("@/lib/workspace-request-context", () => ({ getWorkspaceRequestContext: vi.fn().mockResolvedValue({ tenantId: "tenant-cookie" }) }));

import { authenticatedApi } from "@/lib/server-api-client";
import { PATCH } from "./route";

describe("room join request decision BFF", () => {
  it("forwards approvals", async () => {
    vi.mocked(authenticatedApi).mockResolvedValue({ room: { id: "room-7" }, members: [] });
    const response = await PATCH(
      new Request("http://web.test/api/rooms/room-7/join-requests/request-1", {
        method: "PATCH",
        body: JSON.stringify({ status: "approved" })
      }),
      { params: Promise.resolve({ roomId: "room-7", requestId: "request-1" }) }
    );
    expect(response.status).toBe(200);
    expect(authenticatedApi).toHaveBeenCalledWith("/v1/rooms/room-7/join-requests/request-1", expect.objectContaining({
      method: "PATCH",
      organizationId: "tenant-cookie"
    }));
  });
});
