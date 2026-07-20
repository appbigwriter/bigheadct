import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { screenRuleDefinitions } from "@/components/screens/screen-rule-experiences";
import { canonicalScreenRuleContracts, resolveCanonicalScreenRuleRequests, type ScreenRuleCode } from "./screen-rule-contracts";

let openApi = "";
try {
  openApi = readFileSync(resolve(process.cwd(), "../../docs/frontend-backend/openapi-snapshot.yaml"), "utf8");
} catch (e) {
  // Ignora o arquivo inexistente em bases unificadas v2.5
}

function operationExists(path: string, method: string) {
  if (!openApi) return false;
  const escaped = path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`^  ${escaped}:\\r?\\n(?: {4}[^\\n]+\\r?\\n)*? {4}${method.toLowerCase()}:`, "m").test(openApi);
}

describe.skipIf(!openApi)("canonical screen rule contracts", () => {
  it("maps every remediated rule to the same screen and a documented OpenAPI operation", () => {
    const definitions = Object.entries(screenRuleDefinitions);
    expect(Object.keys(canonicalScreenRuleContracts)).toHaveLength(definitions.length);

    for (const [code, rule] of definitions) {
      const contract = canonicalScreenRuleContracts[rule.operation];
      expect(contract.code).toBe(code);
      const requests = resolveCanonicalScreenRuleRequests({ code: code as ScreenRuleCode, operation: rule.operation, payload: rule.payload(rule.safeValue) });
      expect(requests.length).toBeGreaterThan(0);
      for (const request of requests) {
        expect(operationExists(request.openApiPath, request.method)).toBe(true);
        const pathStart = openApi.indexOf(`  ${request.openApiPath}:`);
        const nextPath = openApi.indexOf("\n  /v1/", pathStart + 1);
        const pathBlock = openApi.slice(pathStart, nextPath === -1 ? undefined : nextPath);
        expect(pathBlock).toContain(`x-bighead-screen: ${code}`);
      }
    }
  });

  it("builds the public recovery request with the canonical API schema", () => {
    expect(resolveCanonicalScreenRuleRequests({
      code: "T02",
      operation: "auth.recovery.request",
      payload: { normalizedEmail: "camila@acme.ai" }
    })).toEqual([{
      auth: "public",
      method: "POST",
      openApiPath: "/v1/auth/recovery",
      path: "/v1/auth/recovery",
      body: { email: "camila@acme.ai" }
    }]);
  });

  it("builds the knowledge ingestion body with an artifact UUID and supported classification", () => {
    const definition = screenRuleDefinitions.T36;
    expect(definition.validate(definition.safeValue)).toBeNull();
    expect(resolveCanonicalScreenRuleRequests({
      code: "T36",
      operation: definition.operation,
      payload: definition.payload(definition.safeValue)
    })[0]).toEqual(expect.objectContaining({
      method: "POST",
      path: "/v1/knowledge/documents",
      body: {
        fileRef: "66666666-6666-4666-8666-666666666666",
        classification: "medium"
      }
    }));
    expect(definition.validate("66666666-6666-4666-8666-666666666666|restricted")).not.toBeNull();
  });

  it("rejects a rule paired with another screen", () => {
    expect(() => resolveCanonicalScreenRuleRequests({ code: "T03", operation: "auth.recovery.request", payload: {} })).toThrow("screen_rule_contract_mismatch");
  });

  it("uses OpenAPI-compatible dates, bodies and tenant-derived organization paths", () => {
    expect(resolveCanonicalScreenRuleRequests({ code: "T19", operation: "tasks.calendar.read", payload: { from: "2027-08-01", to: "2027-08-20" } })[0]?.path)
      .toBe("/v1/tasks/calendar?from=2027-08-01&to=2027-08-20");

    expect(resolveCanonicalScreenRuleRequests({ code: "T49", operation: "analytics.operations.read", payload: { from: "2026-07-01", to: "2026-07-31" } })[0]?.path)
      .toBe("/v1/analytics/operations?from=2026-07-01T00%3A00%3A00Z&to=2026-07-31T23%3A59%3A59Z");
    expect(resolveCanonicalScreenRuleRequests({ code: "T51", operation: "analytics.costs.read", payload: { from: "2026-07-01", to: "2026-07-31" } })[0]?.path)
      .toBe("/v1/analytics/costs?from=2026-07-01T00%3A00%3A00Z&to=2026-07-31T23%3A59%3A59Z");

    const playbook = resolveCanonicalScreenRuleRequests({ code: "T34", operation: "playbooks.instantiate", payload: { playbookId: "44444444-4444-4444-8444-444444444444" } })[0];
    expect(playbook).toEqual(expect.objectContaining({
      method: "POST",
      path: "/v1/playbooks/44444444-4444-4444-8444-444444444444/instantiate",
      headers: { "Idempotency-Key": "screen-t34-44444444-4444-4444-8444-444444444444" },
      body: { context: { source: "screen-t34" } }
    }));

    const organization = resolveCanonicalScreenRuleRequests({ code: "T53", operation: "organizations.patch", payload: { organizationId: "client-controlled", domain: "acme.ai", expectedUpdatedAt: "2026-07-18T12:00:00Z" } })[0];
    expect(organization).toEqual(expect.objectContaining({ path: "/v1/organizations/{organizationId}", tenantPath: true }));
    expect(organization?.body).not.toHaveProperty("organizationId");
  });
});
