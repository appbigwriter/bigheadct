"use client";

import { useState, type FormEvent } from "react";

import { Button, Card } from "@bigheadct/ui";
import type { ScreenCode } from "@/lib/screen-catalog";
import type { ScreenRuleCode, ScreenRuleCommand, ScreenRuleOperation } from "@/lib/screen-rule-contracts";

export type { ScreenRuleCommand } from "@/lib/screen-rule-contracts";

export type ScreenRuleBoundary = (command: ScreenRuleCommand) => Promise<{ ok: boolean; message?: string }>;

export type ScreenRule = {
  title: string;
  label: string;
  inputType?: "text" | "email" | "number" | "date";
  invalidValue: string;
  safeValue: string;
  operation: ScreenRuleOperation;
  action: string;
  effect: string;
  validate: (value: string) => string | null;
  payload: (value: string) => Record<string, string | number | boolean>;
};

const uuid = (value: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
const dateRange = (value: string) => {
  const [from, to] = value.split("|");
  const validDate = (date: string | undefined) => {
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
    const parsed = new Date(`${date}T00:00:00Z`);
    return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === date;
  };
  return validDate(from) && validDate(to) && from! <= to! ? null : "Informe um periodo valido no formato inicio|fim.";
};

export const screenRuleDefinitions = {
  T02: { title: "Recuperacao sem enumeracao", label: "Email corporativo", inputType: "email", invalidValue: "email-invalido", safeValue: "camila@acme.ai", operation: "auth.recovery.request", action: "Enviar link seguro", effect: "Link opaco solicitado com resposta anonima.", validate: (v) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.trim()) ? null : "Informe um email valido.", payload: (v) => ({ normalizedEmail: v.trim().toLowerCase() }) },
  T03: { title: "Convite vinculado a identidade", label: "Token e emails (token|autenticado|convidado)", invalidValue: "expired|ana@acme.ai|bia@acme.ai", safeValue: "invite-live|ana@acme.ai|ana@acme.ai", operation: "invitations.accept", action: "Aceitar convite", effect: "Membership criada uma unica vez.", validate: (v) => { const [token, auth, invited] = v.split("|"); return token?.startsWith("invite-") && token !== "invite-expired" && auth === invited ? null : "Token vigente e emails correspondentes sao obrigatorios."; }, payload: (v) => { const [token, email] = v.split("|"); return { token: token!, authenticatedEmail: email! }; } },
  T09: { title: "Perfil e preferencias", label: "Escopo do perfil", invalidValue: "externo", safeValue: "usuario-atual", operation: "preferences.read", action: "Carregar preferencias", effect: "Perfil e preferencias do usuario atual carregados.", validate: (v) => v === "usuario-atual" ? null : "Use o usuario autenticado para consultar preferencias.", payload: () => ({ currentUser: true }) },
  T12: { title: "Membros e moderacao da sala", label: "ID da sala", invalidValue: "sala-invalida", safeValue: "11111111-1111-4111-8111-111111111111", operation: "rooms.members.list", action: "Carregar membros", effect: "Membros e moderadores autorizados carregados.", validate: (v) => uuid(v) ? null : "Informe o UUID da sala.", payload: (v) => ({ roomId: v }) },
  T18: { title: "Fila de falhas", label: "Limite de falhas", inputType: "number", invalidValue: "0", safeValue: "25", operation: "failures.list", action: "Carregar falhas", effect: "Fila de falhas retryable carregada.", validate: (v) => Number.isInteger(Number(v)) && Number(v) >= 1 && Number(v) <= 100 ? null : "Informe um limite entre 1 e 100.", payload: (v) => ({ limit: Number(v) }) },
  T19: { title: "Calendario e SLA", label: "Periodo (AAAA-MM-DD|AAAA-MM-DD)", invalidValue: "2027-08-20|2027-08-01", safeValue: "2027-08-01|2027-08-20", operation: "tasks.calendar.read", action: "Carregar calendario", effect: "Calendario e SLAs do periodo carregados.", validate: dateRange, payload: (v) => ({ from: v.split("|")[0]!, to: v.split("|")[1]! }) },
  T22: { title: "Scorecard com evidencia", label: "ID da aprovacao", invalidValue: "approval-invalida", safeValue: "22222222-2222-4222-8222-222222222222", operation: "approvals.scorecard.read", action: "Carregar scorecard", effect: "Scorecard, politica e evidencias carregados.", validate: (v) => uuid(v) ? null : "Informe o UUID da aprovacao.", payload: (v) => ({ approvalId: v }) },
  T24: { title: "Portal externo isolado", label: "Token opaco", invalidValue: "expired", safeValue: "portal_4f9e_scope_item", operation: "portal.item.read", action: "Abrir item externo", effect: "Item autorizado carregado sem shell interno.", validate: (v) => /^portal_[a-z0-9]+_scope_item$/.test(v) ? null : "Token vigente com escopo do item e obrigatorio.", payload: (v) => ({ token: v, includeInternalShell: false }) },
  T25: { title: "Catalogo de agentes", label: "Escopo do catalogo", invalidValue: "externo", safeValue: "tenant-ativo", operation: "agents.list", action: "Carregar agentes", effect: "Agentes autorizados do tenant carregados.", validate: (v) => v === "tenant-ativo" ? null : "Use o tenant ativo para consultar agentes.", payload: () => ({ tenantScoped: true }) },
  T26: { title: "Configuracao do agente", label: "ID do agente", invalidValue: "agent-invalido", safeValue: "33333333-3333-4333-8333-333333333333", operation: "agents.detail.read", action: "Carregar configuracao", effect: "Configuracao e versoes do agente carregadas.", validate: (v) => uuid(v) ? null : "Informe o UUID do agente.", payload: (v) => ({ agentId: v }) },
  T31: { title: "Workflows do tenant", label: "Escopo do workflow", invalidValue: "tenant-externo", safeValue: "tenant-ativo", operation: "workflows.list", action: "Carregar workflows", effect: "Workflows autorizados do tenant carregados.", validate: (v) => v === "tenant-ativo" ? null : "Use o tenant ativo para consultar workflows.", payload: () => ({ tenantScoped: true }) },
  T34: { title: "Instanciar playbook", label: "ID do playbook", invalidValue: "playbook-invalido", safeValue: "44444444-4444-4444-8444-444444444444", operation: "playbooks.instantiate", action: "Instanciar playbook", effect: "Playbook instanciado com contexto auditavel.", validate: (v) => uuid(v) ? null : "Informe o UUID do playbook.", payload: (v) => ({ playbookId: v }) },
  T35: { title: "Fontes autorizadas", label: "Escopo de acesso", invalidValue: "unresolved", safeValue: "tenant:member:active", operation: "knowledge.documents.list", action: "Listar fontes ativas", effect: "Somente fontes autorizadas exibidas com freshness.", validate: (v) => v === "tenant:member:active" ? null : "Resolva a politica de acesso antes da consulta.", payload: () => ({ activeOnly: true }) },
  T36: { title: "Documento para ingestao", label: "ID do artefato|classificacao", invalidValue: "|unknown", safeValue: "66666666-6666-4666-8666-666666666666|medium", operation: "knowledge.documents.create", action: "Iniciar ingestao", effect: "Documento enviado para ingestao idempotente.", validate: (v) => { const [fileRef, classification] = v.split("|"); return uuid(fileRef ?? "") && /^(low|medium|high|critical)$/.test(classification ?? "") ? null : "UUID do artefato e classificacao valida sao obrigatorios."; }, payload: (v) => ({ fileRef: v.split("|")[0]!, classification: v.split("|")[1]! }) },
  T37: { title: "Memoria operacional", label: "Status da memoria", invalidValue: "unknown", safeValue: "active", operation: "memory.items.list", action: "Carregar memorias", effect: "Memorias governadas do tenant carregadas.", validate: (v) => /^(active|contested|expired)$/.test(v) ? null : "Selecione um status de memoria valido.", payload: (v) => ({ status: v }) },
  T39: { title: "Importacao CRM consentida", label: "Fonte|base legal", invalidValue: "|", safeValue: "crm-corporativo|legitimo interesse documentado", operation: "crm.imports.create", action: "Iniciar importacao", effect: "Importacao CRM criada com consentimento e idempotencia.", validate: (v) => /^[^|]+\|.{8,}$/.test(v) ? null : "Fonte e base legal sao obrigatorias.", payload: (v) => ({ source: v.split("|")[0]!, consentBasis: v.split("|")[1]! }) },
  T41: { title: "Detalhe do lead", label: "ID do lead", invalidValue: "lead-invalido", safeValue: "55555555-5555-4555-8555-555555555555", operation: "crm.leads.detail", action: "Carregar lead", effect: "Lead, sinais e timeline autorizados carregados.", validate: (v) => uuid(v) ? null : "Informe o UUID do lead.", payload: (v) => ({ leadId: v }) },
  T43: { title: "Campanhas", label: "Status|canal", invalidValue: "unknown|fax", safeValue: "active|email", operation: "content.campaigns.list", action: "Carregar campanhas", effect: "Campanhas do canal e status selecionados carregadas.", validate: (v) => /^(draft|active|paused|completed)\|(email|web|linkedin)$/.test(v) ? null : "Status e canal validos sao obrigatorios.", payload: (v) => ({ status: v.split("|")[0]!, channel: v.split("|")[1]! }) },
  T46: { title: "Experimentos", label: "Escopo dos experimentos", invalidValue: "externo", safeValue: "tenant-ativo", operation: "experiments.list", action: "Carregar experimentos", effect: "Experimentos autorizados do tenant carregados.", validate: (v) => v === "tenant-ativo" ? null : "Use o tenant ativo para consultar experimentos.", payload: () => ({ tenantScoped: true }) },
  T49: { title: "Operacoes e SLA", label: "Periodo (AAAA-MM-DD|AAAA-MM-DD)", invalidValue: "2026-07-31|2026-07-01", safeValue: "2026-07-01|2026-07-31", operation: "analytics.operations.read", action: "Carregar operacoes", effect: "Indicadores operacionais e SLA carregados.", validate: dateRange, payload: (v) => ({ from: v.split("|")[0]!, to: v.split("|")[1]! }) },
  T50: { title: "Performance de agentes", label: "Provider", invalidValue: "", safeValue: "openai", operation: "analytics.agents.read", action: "Carregar performance", effect: "Performance de agentes e modelos carregada.", validate: (v) => /^[a-z0-9_-]{2,40}$/.test(v) ? null : "Informe um provider valido.", payload: (v) => ({ provider: v }) },
  T51: { title: "Custos e quotas", label: "Periodo (AAAA-MM-DD|AAAA-MM-DD)", invalidValue: "2026-07-31|2026-07-01", safeValue: "2026-07-01|2026-07-31", operation: "analytics.costs.read", action: "Carregar custos", effect: "Custos, budgets e quotas do periodo carregados.", validate: dateRange, payload: (v) => ({ from: v.split("|")[0]!, to: v.split("|")[1]! }) },
  T52: { title: "Funil e atribuicao", label: "Modelo de atribuicao", invalidValue: "unknown", safeValue: "last_touch", operation: "analytics.funnel.read", action: "Carregar funil", effect: "Funil e atribuicao calculados para o tenant.", validate: (v) => /^(first_touch|last_touch|linear)$/.test(v) ? null : "Selecione um modelo de atribuicao valido.", payload: (v) => ({ attributionModel: v }) },
  T53: { title: "Politica do tenant com concorrencia", label: "Atualizado em|dominio", invalidValue: "stale|invalid", safeValue: "2026-07-18T12:00:00Z|acme.ai", operation: "organizations.patch", action: "Salvar politica", effect: "Politica versionada e registrada na auditoria.", validate: (v) => { const [updatedAt, domain] = v.split("|"); return !Number.isNaN(Date.parse(updatedAt ?? "")) && /^[a-z0-9.-]+\.[a-z]{2,}$/.test(domain ?? "") ? null : "Timestamp atual e dominio valido sao obrigatorios."; }, payload: (v) => ({ expectedUpdatedAt: v.split("|")[0]!, domain: v.split("|")[1]! }) }
} satisfies Partial<Record<ScreenCode, ScreenRule>>;

type DefinedScreenRuleCode = keyof typeof screenRuleDefinitions;
const _allDefinitionsHaveCanonicalContracts: Record<ScreenRuleCode, ScreenRule> = screenRuleDefinitions;
void _allDefinitionsHaveCanonicalContracts;
export const screenRuleCodes = new Set<ScreenCode>(Object.keys(screenRuleDefinitions) as ScreenCode[]);

export const screenRuleHttpBoundary: ScreenRuleBoundary = async (command) => {
  const response = await fetch("/api/screen-rules", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(command)
  });
  const result = await response.json() as { message?: string };
  return result.message ? { ok: response.ok, message: result.message } : { ok: response.ok };
};

function requireScreenRule(code: ScreenCode): ScreenRule {
  const rule = screenRuleDefinitions[code as DefinedScreenRuleCode] as ScreenRule | undefined;
  if (!rule) throw new Error(`Regra especifica ausente para ${code}.`);
  return rule;
}

export function ScreenRuleExperience({ code, boundary = screenRuleHttpBoundary }: { code: ScreenCode; boundary?: ScreenRuleBoundary }) {
  const rule = requireScreenRule(code);
  const [value, setValue] = useState(rule.invalidValue);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationError = rule.validate(value);
    if (validationError) { setFeedback(validationError); return; }
    setPending(true); setFeedback(null);
    try {
      const result = await boundary({ code: code as ScreenRuleCode, operation: rule.operation, payload: rule.payload(value) });
      setFeedback(result.ok ? rule.effect : result.message ?? "A operacao foi rejeitada pelo servico.");
    } catch {
      setFeedback("Falha de transporte; os dados informados foram preservados.");
    } finally { setPending(false); }
  }

  return <div className="bh-columns" data-testid={`screen-rule-${code}`}>
    <Card>
      <div className="bh-card-title"><h3>{rule.title}</h3><span className="bh-label">regra critica {code}</span></div>
      <div className="bh-inline" aria-label="Resumo da regra">
        <span className="bh-badge"><strong>{rule.operation}</strong></span>
        <span className="bh-badge"><strong>{rule.action}</strong></span>
        <span className="bh-badge"><strong>{rule.inputType ?? "text"}</strong> entrada</span>
      </div>
      <form noValidate onSubmit={(event) => void submit(event)}>
        <label className="bh-field"><span>{rule.label}</span><input aria-label={rule.label} type={rule.inputType ?? "text"} value={value} onChange={(event) => { setValue(event.target.value); setFeedback(null); }} /></label>
        <Button disabled={pending} type="submit">{pending ? "Processando operacao" : rule.action}</Button>
      </form>
      <div aria-live="polite" className="bh-state-panel" role="status"><strong>{pending ? "Validando no servico" : feedback ? "Resultado" : "Preencha os dados da operacao"}</strong><p>{feedback ?? "A validacao ocorre antes de enviar qualquer payload."}</p></div>
    </Card>
    <Card><div className="bh-card-title"><h3>Contrato da operacao</h3><span className="bh-label">boundary injetavel</span></div><p><code>{rule.operation}</code></p><p>{rule.effect}</p></Card>
  </div>;
}
