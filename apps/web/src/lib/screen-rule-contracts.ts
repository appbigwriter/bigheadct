import type { ScreenCode } from "./screen-catalog";

export type ScreenRulePayload = Record<string, string | number | boolean>;

export type ScreenRuleCommand = {
  code: ScreenRuleCode;
  operation: ScreenRuleOperation;
  payload: ScreenRulePayload;
};

export type CanonicalScreenRuleRequest = {
  auth: "public" | "authenticated";
  method: "GET" | "POST" | "PATCH";
  openApiPath: string;
  path: string;
  tenantPath?: boolean;
  body?: Record<string, unknown>;
  headers?: Record<string, string>;
};

type ScreenRuleContract = {
  code: ScreenCode;
  requests: (payload: ScreenRulePayload) => CanonicalScreenRuleRequest[];
};

const text = (payload: ScreenRulePayload, key: string, fallback: string) => {
  const value = payload[key];
  return typeof value === "string" && value.length > 0 ? value : fallback;
};

const encoded = (payload: ScreenRulePayload, key: string, fallback: string) =>
  encodeURIComponent(text(payload, key, fallback));

const authenticatedGet = (openApiPath: string, path: string): CanonicalScreenRuleRequest => ({
  auth: "authenticated",
  method: "GET",
  openApiPath,
  path
});

export const canonicalScreenRuleContracts = {
  "auth.recovery.request": {
    code: "T02",
    requests: (payload) => [{
      auth: "public",
      method: "POST",
      openApiPath: "/v1/auth/recovery",
      path: "/v1/auth/recovery",
      body: { email: text(payload, "normalizedEmail", "") }
    }]
  },
  "invitations.accept": {
    code: "T03",
    requests: (payload) => [{
      auth: "public",
      method: "POST",
      openApiPath: "/v1/invitations/{token}/accept",
      path: `/v1/invitations/${encoded(payload, "token", "missing")}/accept`,
      body: { fullName: "Usuario convidado", accept: true }
    }]
  },
  "preferences.read": {
    code: "T09",
    requests: () => [authenticatedGet("/v1/preferences", "/v1/preferences")]
  },
  "rooms.members.list": {
    code: "T12",
    requests: (payload) => [authenticatedGet("/v1/rooms/{roomId}/members", `/v1/rooms/${encoded(payload, "roomId", "current")}/members`)]
  },
  "failures.list": {
    code: "T18",
    requests: (payload) => [authenticatedGet("/v1/failures", `/v1/failures?${new URLSearchParams({ limit: String(payload.limit) })}`)]
  },
  "tasks.calendar.read": {
    code: "T19",
    requests: (payload) => {
      const query = new URLSearchParams({ from: text(payload, "from", ""), to: text(payload, "to", "") });
      return [authenticatedGet("/v1/tasks/calendar", `/v1/tasks/calendar?${query}`)];
    }
  },
  "approvals.scorecard.read": {
    code: "T22",
    requests: (payload) => [authenticatedGet("/v1/approvals/{approvalId}/scorecard", `/v1/approvals/${encoded(payload, "approvalId", "missing")}/scorecard`)]
  },
  "portal.item.read": {
    code: "T24",
    requests: (payload) => [{ auth: "public", method: "GET", openApiPath: "/v1/portal/items/{token}", path: `/v1/portal/items/${encoded(payload, "token", "missing")}` }]
  },
  "agents.list": {
    code: "T25",
    requests: () => [authenticatedGet("/v1/agents", "/v1/agents")]
  },
  "agents.detail.read": {
    code: "T26",
    requests: (payload) => [authenticatedGet("/v1/agents/{agentId}", `/v1/agents/${encoded(payload, "agentId", "missing")}`)]
  },
  "workflows.list": {
    code: "T31",
    requests: () => [authenticatedGet("/v1/workflows", "/v1/workflows")]
  },
  "playbooks.instantiate": {
    code: "T34",
    requests: (payload) => [{ auth: "authenticated", method: "POST", openApiPath: "/v1/playbooks/{playbookId}/instantiate", path: `/v1/playbooks/${encoded(payload, "playbookId", "missing")}/instantiate`, headers: { "Idempotency-Key": `screen-t34-${text(payload, "playbookId", "missing")}` }, body: { context: { source: "screen-t34" } } }]
  },
  "knowledge.documents.list": {
    code: "T35",
    requests: () => [authenticatedGet("/v1/knowledge/documents", "/v1/knowledge/documents?limit=100")]
  },
  "knowledge.documents.create": {
    code: "T36",
    requests: (payload) => [{
      auth: "authenticated",
      method: "POST",
      openApiPath: "/v1/knowledge/documents",
      path: "/v1/knowledge/documents",
      headers: { "Idempotency-Key": `screen-t36-${text(payload, "fileRef", "missing")}` },
      body: { fileRef: text(payload, "fileRef", ""), classification: text(payload, "classification", "medium") }
    }]
  },
  "memory.items.list": {
    code: "T37",
    requests: (payload) => [authenticatedGet("/v1/memory/items", `/v1/memory/items?${new URLSearchParams({ status: text(payload, "status", "active"), limit: "100" })}`)]
  },
  "crm.imports.create": {
    code: "T39",
    requests: (payload) => [{
      auth: "authenticated",
      method: "POST",
      openApiPath: "/v1/crm/imports",
      path: "/v1/crm/imports",
      headers: { "Idempotency-Key": `screen-t39-${text(payload, "source", "unknown")}` },
      body: { source: text(payload, "source", ""), rows: [{ sourceRow: "screen-t39" }], consentBasis: text(payload, "consentBasis", "") }
    }]
  },
  "crm.leads.detail": {
    code: "T41",
    requests: (payload) => [authenticatedGet("/v1/crm/leads/{leadId}", `/v1/crm/leads/${encoded(payload, "leadId", "missing")}`)]
  },
  "content.campaigns.list": {
    code: "T43",
    requests: (payload) => [authenticatedGet("/v1/content/campaigns", `/v1/content/campaigns?${new URLSearchParams({ status: text(payload, "status", "active"), channel: text(payload, "channel", "email"), limit: "100" })}`)]
  },
  "experiments.list": {
    code: "T46",
    requests: () => [authenticatedGet("/v1/experiments", "/v1/experiments")]
  },
  "analytics.operations.read": {
    code: "T49",
    requests: (payload) => [authenticatedGet("/v1/analytics/operations", `/v1/analytics/operations?${new URLSearchParams({ from: `${text(payload, "from", "")}T00:00:00Z`, to: `${text(payload, "to", "")}T23:59:59Z` })}`)]
  },
  "analytics.agents.read": {
    code: "T50",
    requests: (payload) => [authenticatedGet("/v1/analytics/agents", `/v1/analytics/agents?${new URLSearchParams({ provider: text(payload, "provider", "") })}`)]
  },
  "analytics.costs.read": {
    code: "T51",
    requests: (payload) => [authenticatedGet("/v1/analytics/costs", `/v1/analytics/costs?${new URLSearchParams({ from: `${text(payload, "from", "")}T00:00:00Z`, to: `${text(payload, "to", "")}T23:59:59Z` })}`)]
  },
  "analytics.funnel.read": {
    code: "T52",
    requests: (payload) => [authenticatedGet("/v1/analytics/funnel", `/v1/analytics/funnel?${new URLSearchParams({ attributionModel: text(payload, "attributionModel", "last_touch") })}`)]
  },
  "organizations.patch": {
    code: "T53",
    requests: (payload) => [{
      auth: "authenticated",
      method: "PATCH",
      openApiPath: "/v1/organizations/{organizationId}",
      path: "/v1/organizations/{organizationId}",
      tenantPath: true,
      body: { domains: [text(payload, "domain", "example.invalid")], expectedUpdatedAt: text(payload, "expectedUpdatedAt", "") }
    }]
  }
} satisfies Record<string, ScreenRuleContract>;

export type ScreenRuleOperation = keyof typeof canonicalScreenRuleContracts;
export type ScreenRuleCode = (typeof canonicalScreenRuleContracts)[ScreenRuleOperation]["code"] & ScreenCode;

export function resolveCanonicalScreenRuleRequests(command: ScreenRuleCommand): CanonicalScreenRuleRequest[] {
  const contract = canonicalScreenRuleContracts[command.operation];
  if (contract.code !== command.code) throw new Error("screen_rule_contract_mismatch");
  const requests = contract.requests(command.payload);
  if (requests.length === 0) throw new Error("screen_rule_request_missing");
  return requests;
}
