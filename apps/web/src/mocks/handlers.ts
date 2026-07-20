import { http, HttpResponse } from "msw";

import { getWorkspaceSnapshot } from "@/lib/mock-workspace";
import { canonicalScreenRuleContracts, type ScreenRuleOperation } from "@/lib/screen-rule-contracts";

export const handlers = [
  http.post("/api/screen-rules", async ({ request }) => {
    const command = await request.json() as { code?: unknown; operation?: unknown; payload?: unknown };
    const contract = typeof command.operation === "string" && command.operation in canonicalScreenRuleContracts
      ? canonicalScreenRuleContracts[command.operation as ScreenRuleOperation]
      : null;
    if (!contract || contract.code !== command.code || !command.payload || typeof command.payload !== "object" || Array.isArray(command.payload)) {
      return HttpResponse.json({ message: "Operacao invalida." }, { status: 400 });
    }
    return HttpResponse.json({ message: "Operacao aceita pela fronteira mock." });
  }),
  http.get("/api/mock/workspace", () => HttpResponse.json(getWorkspaceSnapshot())),
  http.get("/api/mock/portal/:token", ({ params }) =>
    HttpResponse.json({
      token: params.token,
      state:
        params.token === "expired"
          ? "expired"
          : params.token === "used"
            ? "used"
            : params.token === "revoked"
              ? "revoked"
              : "valid"
    })
  )
];
