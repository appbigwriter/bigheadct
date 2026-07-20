"use client";

import { Button, Card } from "@bigheadct/ui";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";

type PromptItem = {
  id: string;
  agentId: string;
  agentName: string;
  version: number;
  systemPrompt: string;
  publishedAt?: string | null;
  createdAt?: string | null;
};

type AgentDetail = {
  agent: {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    riskLevel: string;
    isEnabled: boolean;
  };
  versions: Array<{
    id: string;
    version: number;
    modelId?: string | null;
    systemPrompt: string;
    configuration?: Record<string, unknown>;
    skillIds?: string[];
    publishedAt?: string | null;
    createdAt?: string | null;
  }>;
};

type LoadState = "loading" | "ready" | "error";

class ResponseError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
  }
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function string(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function number(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function normalizePrompt(value: unknown): PromptItem {
  const item = record(value);
  return {
    id: string(item.id),
    agentId: string(item.agentId ?? item.agent_id),
    agentName: string(item.agentName ?? item.agent_name, "Agente sem nome"),
    version: number(item.version),
    systemPrompt: string(item.systemPrompt ?? item.system_prompt),
    publishedAt: string(item.publishedAt ?? item.published_at) || null,
    createdAt: string(item.createdAt ?? item.created_at) || null
  };
}

function normalizeAgentDetail(value: unknown): AgentDetail {
  const item = record(value);
  const agent = record(item.agent);
  return {
    agent: {
      id: string(agent.id),
      name: string(agent.name, "Agente sem nome"),
      slug: string(agent.slug),
      description: string(agent.description) || null,
      riskLevel: string(agent.riskLevel ?? agent.risk_level, "low"),
      isEnabled: typeof agent.isEnabled === "boolean" ? agent.isEnabled : true
    },
    versions: Array.isArray(item.versions)
      ? item.versions
          .filter((entry): entry is Record<string, unknown> => Boolean(entry) && typeof entry === "object")
          .map((entry) => ({
            id: string(entry.id),
            version: number(entry.version),
            modelId: string(entry.modelId ?? entry.model_id) || null,
            systemPrompt: string(entry.systemPrompt ?? entry.system_prompt),
            configuration: record(entry.configuration),
            skillIds: Array.isArray(entry.skillIds) ? entry.skillIds.filter((id): id is string => typeof id === "string") : [],
            publishedAt: string(entry.publishedAt ?? entry.published_at) || null,
            createdAt: string(entry.createdAt ?? entry.created_at) || null
          }))
      : []
  };
}

async function responseJson<T>(response: Response): Promise<T> {
  const body = (await response.json().catch(() => ({}))) as T & { detail?: unknown };
  if (!response.ok) {
    throw new ResponseError(response.status, typeof body.detail === "string" ? body.detail : "Operacao nao concluida.");
  }
  return body;
}

function excerpt(prompt: string) {
  return prompt.length > 120 ? `${prompt.slice(0, 120).trimEnd()}…` : prompt;
}

function compactId(value?: string | null) {
  return value ? `${value.slice(0, 8)}...` : "Sem id";
}

function riskLabel(value: string) {
  return ({ low: "Baixo", medium: "Médio", high: "Alto", critical: "Crítico" }[value] ?? value);
}

function parseIds(raw: FormDataEntryValue | null) {
  return typeof raw === "string" ? raw.split(",").map((item) => item.trim()).filter(Boolean) : [];
}

function latestVersion(detail: AgentDetail | null) {
  return (
    detail?.versions.reduce<AgentDetail["versions"][number] | null>(
      (latest, item) => (!latest || item.version > latest.version ? item : latest),
      null
    ) ?? null
  );
}

export function PromptsWorkspace() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedAgentIdFromUrl = searchParams?.get("agentId") ?? "";
  const [state, setState] = useState<LoadState>("loading");
  const [prompts, setPrompts] = useState<PromptItem[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState(selectedAgentIdFromUrl);
  const [detail, setDetail] = useState<AgentDetail | null>(null);
  const [creating, setCreating] = useState(false);
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState("");

  const currentVersion = latestVersion(detail);

  const loadPrompts = useCallback(async () => {
    setState("loading");
    setFeedback("");
    try {
      const page = await responseJson<{ items?: unknown[] }>(await fetch("/api/prompts", { cache: "no-store" }));
      const items = (page.items ?? []).map(normalizePrompt).filter((item) => item.id && item.agentId);
      setPrompts(items);
      const initialAgentId = selectedAgentIdFromUrl || items[0]?.agentId || "";
      setSelectedAgentId(initialAgentId);
      setState("ready");
      return initialAgentId;
    } catch (error) {
      setState("error");
      setFeedback(error instanceof Error ? error.message : "Prompts indisponiveis.");
      return "";
    }
  }, [selectedAgentIdFromUrl]);

  const loadDetail = useCallback(async (agentId: string) => {
    if (!agentId) return;
    try {
      const response = await responseJson<unknown>(await fetch(`/api/agents/${encodeURIComponent(agentId)}`, { cache: "no-store" }));
      setDetail(normalizeAgentDetail(response));
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Nao foi possivel carregar o prompt.");
    }
  }, []);

  useEffect(() => {
    void loadPrompts().then((agentId) => {
      if (agentId) void loadDetail(agentId);
    });
  }, [loadPrompts, loadDetail]);

  useEffect(() => {
    if (!selectedAgentId) return;
    void loadDetail(selectedAgentId);
    const current = searchParams?.get("agentId") ?? "";
    if (current !== selectedAgentId) {
      const query = new URLSearchParams(searchParams?.toString() ?? "");
      query.set("agentId", selectedAgentId);
      router.replace(`/automacao/prompts?${query.toString()}`, { scroll: false });
    }
  }, [loadDetail, router, searchParams, selectedAgentId]);

  const selectedPrompt = useMemo(
    () => prompts.find((prompt) => prompt.agentId === selectedAgentId) ?? null,
    [prompts, selectedAgentId]
  );

  async function createPrompt(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setFeedback("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await responseJson<unknown>(
        await fetch("/api/agents", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            name: form.get("name"),
            slug: form.get("slug"),
            description: form.get("description"),
            riskLevel: form.get("riskLevel"),
            prompt: form.get("prompt"),
            modelId: form.get("modelId"),
            limits: {},
            skillIds: parseIds(form.get("skillIds"))
          })
        })
      );
      const created = record(response);
      const agentId = string(record(created.agent ?? response).id);
      setCreating(false);
      await loadPrompts();
      if (agentId) {
        setSelectedAgentId(agentId);
        await loadDetail(agentId);
      }
      setFeedback("Prompt criado.");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Nao foi possivel criar o prompt.");
    } finally {
      setPending(false);
    }
  }

  async function updatePrompt(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!detail || !currentVersion) return;
    setPending(true);
    setFeedback("");
    const form = new FormData(event.currentTarget);
    try {
      await responseJson<unknown>(
        await fetch(`/api/agents/${encodeURIComponent(detail.agent.id)}`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            name: form.get("name"),
            description: form.get("description"),
            riskLevel: form.get("riskLevel"),
            isEnabled: form.get("isEnabled") === "on",
            prompt: form.get("prompt"),
            modelId: form.get("modelId"),
            limits: {},
            skillIds: parseIds(form.get("skillIds")),
            expectedVersion: currentVersion.version
          })
        })
      );
      setFeedback("Prompt salvo como nova versão.");
      await loadPrompts();
      await loadDetail(detail.agent.id);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Nao foi possivel salvar o prompt.");
    } finally {
      setPending(false);
    }
  }

  async function archivePrompt() {
    if (!detail || !currentVersion) return;
    setPending(true);
    setFeedback("");
    try {
      await responseJson<unknown>(
        await fetch(`/api/agents/${encodeURIComponent(detail.agent.id)}?expectedVersion=${currentVersion.version}`, {
          method: "DELETE"
        })
      );
      setFeedback("Agente arquivado.");
      setDetail(null);
      setSelectedAgentId("");
      await loadPrompts();
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Nao foi possivel arquivar o agente.");
    } finally {
      setPending(false);
    }
  }

  if (state === "loading") {
    return (
      <section className="bh-screen">
        <Card className="bh-screen-hero-card">
          <div className="bh-screen-heading">
            <div>
              <h2>Prompts</h2>
              <p>Carregando prompts reais...</p>
            </div>
            <div className="bh-screen-actions">
              <Link className="bh-chip" href="/catalogo" prefetch={false}>
                Ver componentes
              </Link>
              <Button disabled type="button">
                Incluir prompt
              </Button>
            </div>
          </div>
        </Card>
      </section>
    );
  }

  if (state === "error") {
    return (
      <section className="bh-screen">
        <Card className="bh-screen-hero-card">
          <div className="bh-screen-heading">
            <div>
              <h2>Prompts</h2>
              <p role="status">{feedback}</p>
            </div>
            <div className="bh-screen-actions">
              <Link className="bh-chip" href="/catalogo" prefetch={false}>
                Ver componentes
              </Link>
              <Button onClick={() => void loadPrompts()} type="button">
                Tentar novamente
              </Button>
            </div>
          </div>
        </Card>
      </section>
    );
  }

  const latest = latestVersion(detail);

  return (
    <section className="bh-screen">
      <div className="bh-screen-hero">
        <Card className="bh-screen-hero-card">
          <div className="bh-screen-heading">
            <div>
              <span className="bh-eyebrow">Automation</span>
              <h2>Prompts</h2>
              <p>Crie, edite e arquive prompts reais vinculados a agentes versionados.</p>
            </div>
            <div className="bh-screen-actions">
              <Link className="bh-chip" href="/catalogo" prefetch={false}>
                Ver componentes
              </Link>
              <Button onClick={() => setCreating((value) => !value)} type="button">
                {creating ? "Fechar criação" : "Incluir prompt"}
              </Button>
              <Link className="bh-chip" href="/automacao/agentes" prefetch={false}>
                Abrir agentes
              </Link>
            </div>
          </div>
        </Card>
      </div>

      {feedback ? (
        <p className="bh-state-panel" role="status">
          {feedback}
        </p>
      ) : null}

      <div className="bh-columns">
        <Card>
          <div className="bh-card-title">
            <h3>Catálogo de prompts</h3>
            <span className="bh-label">{prompts.length}</span>
          </div>
          <div className="bh-list-panel" aria-label="Catálogo de prompts">
            {prompts.map((prompt) => (
              <button
                className="bh-row-button"
                key={`${prompt.agentId}-${prompt.version}`}
                onClick={() => {
                  setSelectedAgentId(prompt.agentId);
                  void loadDetail(prompt.agentId);
                }}
                type="button"
              >
                <strong>{prompt.agentName}</strong>
                <span>{excerpt(prompt.systemPrompt)}</span>
                <small>
                  v{prompt.version} · {prompt.publishedAt ? "publicado" : "rascunho"} · {compactId(prompt.agentId)}
                </small>
              </button>
            ))}
            {prompts.length === 0 ? <p className="bh-state-panel">Nenhum prompt disponível.</p> : null}
          </div>
        </Card>

        <div className="bh-columns">
          {creating ? (
            <Card>
              <div className="bh-card-title">
                <h3>Novo prompt</h3>
                <span className="bh-label">usa /api/agents</span>
              </div>
              <form className="bh-auth-form" onSubmit={(event) => { void createPrompt(event); }}>
                <label className="bh-field">
                  <span>Nome</span>
                  <input name="name" required />
                </label>
                <label className="bh-field">
                  <span>Slug</span>
                  <input name="slug" pattern="[a-z0-9]+(?:-[a-z0-9]+)*" required />
                </label>
                <label className="bh-field">
                  <span>Risco</span>
                  <select defaultValue="low" name="riskLevel">
                    <option value="low">Baixo</option>
                    <option value="medium">Médio</option>
                    <option value="high">Alto</option>
                    <option value="critical">Crítico</option>
                  </select>
                </label>
                <label className="bh-field">
                  <span>Model UUID</span>
                  <input name="modelId" />
                </label>
                <label className="bh-field">
                  <span>Descrição</span>
                  <textarea name="description" />
                </label>
                <label className="bh-field">
                  <span>Prompt base</span>
                  <textarea name="prompt" required />
                </label>
                <label className="bh-field">
                  <span>Skills (UUIDs separados por vírgula)</span>
                  <textarea name="skillIds" />
                </label>
                <Button disabled={pending} type="submit">
                  {pending ? "Salvando..." : "Criar prompt"}
                </Button>
              </form>
            </Card>
          ) : null}

          <Card>
            <div className="bh-card-title">
              <h3>{selectedPrompt ? selectedPrompt.agentName : "Selecione um prompt"}</h3>
              <span className="bh-label">{latest ? `v${latest.version}` : "sem versão"}</span>
            </div>
            {detail && latest ? (
              <form className="bh-auth-form" onSubmit={(event) => { void updatePrompt(event); }}>
                <div className="bh-inline">
                  <span className="bh-badge">Slug: {detail.agent.slug}</span>
                  <span className="bh-badge">Risco: {riskLabel(detail.agent.riskLevel)}</span>
                  <span className="bh-badge">Ativo: {detail.agent.isEnabled ? "sim" : "não"}</span>
                </div>
                <label className="bh-field">
                  <span>Nome</span>
                  <input defaultValue={detail.agent.name} name="name" required />
                </label>
                <label className="bh-field">
                  <span>Descrição</span>
                  <textarea defaultValue={detail.agent.description ?? ""} name="description" />
                </label>
                <label className="bh-field">
                  <span>Risco</span>
                  <select defaultValue={detail.agent.riskLevel} name="riskLevel">
                    <option value="low">Baixo</option>
                    <option value="medium">Médio</option>
                    <option value="high">Alto</option>
                    <option value="critical">Crítico</option>
                  </select>
                </label>
                <label className="bh-field">
                  <span>Prompt</span>
                  <textarea defaultValue={latest.systemPrompt} name="prompt" required />
                </label>
                <label className="bh-field">
                  <span>Model UUID</span>
                  <input defaultValue={latest.modelId ?? ""} name="modelId" />
                </label>
                <label className="bh-field">
                  <span>Skills (UUIDs separados por vírgula)</span>
                  <textarea defaultValue={latest.skillIds?.join(", ") ?? ""} name="skillIds" />
                </label>
                <label className="bh-check">
                  <input defaultChecked={detail.agent.isEnabled} name="isEnabled" type="checkbox" />
                  <span>Agente habilitado</span>
                </label>
                <div className="bh-inline">
                  <Button disabled={pending} type="submit">
                    {pending ? "Salvando..." : "Salvar nova versão"}
                  </Button>
                  <Button disabled={pending} onClick={() => void archivePrompt()} tone="secondary" type="button">
                    Arquivar agente
                  </Button>
                </div>
              </form>
            ) : (
              <p className="bh-state-panel">Selecione um prompt na lista para editar a versão atual.</p>
            )}
          </Card>
        </div>
      </div>
    </section>
  );
}
