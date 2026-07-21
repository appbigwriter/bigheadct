"use client";

import Link from "next/link";
import { Button, Card } from "@bigheadct/ui";
import { useState, useEffect } from "react";
import type { ReactNode } from "react";

import type { ScreenDefinition } from "@/lib/screen-catalog";

type CompactRouteScreenProps = {
  screen: ScreenDefinition;
  searchParams?: Record<string, string | string[] | undefined>;
};

type CompactSectionProps = {
  title: string;
  description: string;
  action?: string;
  children?: ReactNode;
};

const routeTitles: Record<string, string> = {
  "acesso/recuperacao": "Recuperar acesso",
  "acesso/onboarding": "Onboarding",
  "acesso/convite": "Convites",
  "acesso/organizacoes": "Organizacoes",
  "operacao/perfil": "Preferencias pessoais",
  "colaboracao/membros": "Membros e privacidade",
  "colaboracao/arquivos": "Arquivos e anexos",
  "tarefas/detalhe": "Detalhe da tarefa",
  "tarefas/execucao": "Execucao da tarefa",
  "tarefas/falhas": "Falhas operacionais",
  "tarefas/sla": "Calendario de SLA",
  "conhecimento/biblioteca": "Biblioteca de conhecimento",
  "conhecimento/ingestao": "Ingestao e busca",
  "conhecimento/memoria": "Memoria",
  "governanca/aprovacao-detalhe": "Aprovacoes",
  "governanca/scorecards": "Scorecards",
  "governanca/politicas": "Politicas",
  "automacao/skills": "Skills",
  "automacao/modelos": "Modelos",
  "automacao/prompts": "Prompts",
  "automacao/workflows": "Workflows",
  "automacao/biblioteca": "Biblioteca RAG",
  "automacao/workflow-editor": "Workflow editor",
  "automacao/workflow-versoes": "Workflow versoes",
  "automacao/playbooks": "Playbooks"
  ,
  "administracao/organizacao": "Organizacao",
  "administracao/membros": "Membros",
  "administracao/integracoes": "Integracoes",
  "administracao/privacidade-auditoria": "Privacidade e auditoria",
  "administracao/projetos": "Projetos",
  "administracao/projetos/criar": "Novo projeto",
  "administracao/times": "Times",
  "administracao/times/criar": "Novo time",
  "comercial/contas-contatos": "Contas e contatos",
  "comercial/campanhas": "Campanhas",
  "comercial/conteudo": "Conteudo",
  "comercial/publicacoes": "Publicacoes",
  "aprendizado/experimentos": "Experimentos",
  "aprendizado/experimento-detalhe": "Detalhe do experimento",
  "aprendizado/dashboard-executivo": "Dashboard executivo",
  "aprendizado/analytics-sla": "Analise de SLA",
  "aprendizado/analytics-agentes": "Analise de agentes",
  "aprendizado/custos": "Custos",
  "aprendizado/funil": "Funil"
};

function routeKey(screen: ScreenDefinition) {
  return screen.slug.join("/");
}

function titleFor(screen: ScreenDefinition) {
  return routeTitles[routeKey(screen)] ?? screen.title;
}

function CompactSection({ title, description, action, children }: CompactSectionProps) {
  return (
    <Card>
      <div className="bh-card-title">
        <h3>{title}</h3>
        {action ? <span className="bh-label">{action}</span> : null}
      </div>
      <p>{description}</p>
      {children}
    </Card>
  );
}

function Field({
  label,
  placeholder,
  type = "text",
  defaultValue,
  name
}: {
  label: string;
  placeholder?: string;
  type?: string;
  defaultValue?: string;
  name: string;
}) {
  return (
    <label className="bh-field">
      <span>{label}</span>
      <input name={name} type={type} defaultValue={defaultValue} placeholder={placeholder} />
    </label>
  );
}

function MiniCard({ title, meta, detail }: { title: string; meta: string; detail: string }) {
  return (
    <article className="bh-mini-card">
      <strong>{title}</strong>
      <span>{meta}</span>
      <small>{detail}</small>
    </article>
  );
}

export function CompactRouteScreens({ screen, searchParams = {} }: CompactRouteScreenProps) {
  const route = routeKey(screen);

  const [projectsList, setProjectsList] = useState([
    { id: "1", name: "Atlas launch", org: "Atlas Local", owner: "Camila Moura" },
    { id: "2", name: "Support revamp", org: "Atlas Local", owner: "Rafael Costa" },
    { id: "3", name: "Enterprise rollout", org: "Northwind", owner: "Lucas Gomes" }
  ]);

  const [teamsList, setTeamsList] = useState([
    { id: "1", name: "Growth team", type: "Combinado (Humanos + Agentes)", orgs: ["Atlas Local", "Northwind"], projects: ["Atlas launch", "Support revamp"] },
    { id: "2", name: "Ops team", type: "Humanos apenas", orgs: ["Atlas Local"], projects: ["Support revamp"] },
    { id: "3", name: "Automation team", type: "Agentes apenas", orgs: ["Northwind"], projects: ["Enterprise rollout"] }
  ]);

  useEffect(() => {
    const savedProjects = localStorage.getItem("bighead_projects");
    if (savedProjects) {
      setProjectsList(JSON.parse(savedProjects) as typeof projectsList);
    }
    const savedTeams = localStorage.getItem("bighead_teams");
    if (savedTeams) {
      setTeamsList(JSON.parse(savedTeams) as typeof teamsList);
    }
  }, []);

  const saveProjects = (newList: typeof projectsList) => {
    setProjectsList(newList);
    localStorage.setItem("bighead_projects", JSON.stringify(newList));
  };

  const saveTeams = (newList: typeof teamsList) => {
    setTeamsList(newList);
    localStorage.setItem("bighead_teams", JSON.stringify(newList));
  };

  if (route === "acesso/recuperacao") {
    return (
      <main className="bh-compact-page">
        <header className="bh-auth-heading">
          <span className="bh-eyebrow">Acesso</span>
          <h1>{titleFor(screen)}</h1>
          <p>Three objective steps: request recovery, validate token, and reset credentials with session revocation.</p>
        </header>
        <div className="bh-compact-grid">
          <CompactSection title="Request recovery" description="Enter the email and receive a single-use token.">
            <form className="bh-auth-form">
              <Field name="email" label="Email" type="email" placeholder="you@company.com" />
              <Field name="purpose" label="Purpose" placeholder="Lost access, reset, or device change" />
              <Button type="submit">Send token</Button>
            </form>
          </CompactSection>
          <CompactSection title="Validate token" description="Confirm the token and validity before continuing.">
            <form className="bh-auth-form">
              <Field name="token" label="Token" placeholder="Enter the received code" />
              <Field name="email" label="Email" type="email" placeholder="you@company.com" />
              <Button type="submit">Validate token</Button>
            </form>
          </CompactSection>
          <CompactSection title="Reset credentials" description="Change the password and revoke every active session.">
            <form className="bh-auth-form">
              <Field name="token" label="Validated token" placeholder="Approved token" />
              <Field name="password" label="New password" type="password" placeholder="New strong credential" />
              <Field name="confirm" label="Confirm password" type="password" placeholder="Repeat the password" />
              <label className="bh-check">
                <input type="checkbox" name="revokeSessions" defaultChecked />
                <span>Revoke active sessions</span>
              </label>
              <Button type="submit">Reset</Button>
            </form>
          </CompactSection>
        </div>
      </main>
    );
  }

  if (route === "acesso/convite") {
    return (
      <main className="bh-compact-page">
        <header className="bh-auth-heading">
          <span className="bh-eyebrow">Acesso</span>
          <h1>{titleFor(screen)}</h1>
          <p>Invites stay short: validity, idempotency, and email verification only.</p>
        </header>
        <div className="bh-compact-grid">
          <CompactSection title="Accept invite" description="Use the token and confirm the email before joining the workspace.">
            <form className="bh-auth-form">
              <Field name="token" label="Invite token" placeholder="Received code" />
              <Field name="email" label="Email" type="email" placeholder="you@company.com" />
              <Button type="submit">Accept invite</Button>
            </form>
          </CompactSection>
          <CompactSection title="Refuse invite" description="Refusal must also be idempotent and auditable.">
            <form className="bh-auth-form">
              <Field name="token" label="Invite token" placeholder="Received code" />
              <Field name="reason" label="Optional reason" placeholder="I do not recognize this invite" />
              <Button type="submit" tone="secondary">Refuse invite</Button>
            </form>
          </CompactSection>
        </div>
      </main>
    );
  }

  if (route === "acesso/organizacoes") {
    return (
      <main className="bh-compact-page">
        <header className="bh-auth-heading">
          <span className="bh-eyebrow">Acesso</span>
          <h1>{titleFor(screen)}</h1>
          <p>This page was absorbed by the organization selector in the shell.</p>
        </header>
        <Card>
          <p>Use the selector at the top of the app to switch organizations instead of keeping a dedicated page for that.</p>
          <Link href="/operacao/home" prefetch={false}>Back to the workspace</Link>
        </Card>
      </main>
    );
  }

  if (route === "acesso/onboarding") {
    return (
      <main className="bh-compact-page">
        <header className="bh-auth-heading">
          <span className="bh-eyebrow">Acesso</span>
          <h1>{titleFor(screen)}</h1>
          <p>Create the first organization and complete the workspace entry with only the required data.</p>
        </header>
        <div className="bh-compact-grid">
          <CompactSection title="Organization" description="Create the first workspace container.">
            <form className="bh-auth-form" onSubmit={(e) => { e.preventDefault(); window.location.href = "/operacao/home"; }}>
              <Field name="organization" label="Organization name" placeholder="Atlas Local" />
              <Field name="owner" label="Owner email" type="email" placeholder="owner@company.com" />
              <Field name="timezone" label="Timezone" defaultValue="America/Sao_Paulo" />
              <Button type="submit">Create organization</Button>
            </form>
          </CompactSection>
          <CompactSection title="Ready to enter" description="Complete onboarding only after the organization exists.">
            <div className="bh-list-panel">
              <button className="bh-row-button" type="button"><strong>Workspace profile</strong><span>Name, locale, and timezone</span></button>
              <button className="bh-row-button" type="button"><strong>Initial owner</strong><span>First human responsible</span></button>
              <button className="bh-row-button" type="button"><strong>Finish setup</strong><span>Enter the workspace after confirmation</span></button>
            </div>
          </CompactSection>
        </div>
      </main>
    );
  }

  if (route === "operacao/perfil") {
    return (
      <main className="bh-compact-page">
        <header className="bh-auth-heading">
          <span className="bh-eyebrow">Operation</span>
          <h1>{titleFor(screen)}</h1>
          <p>Personal preferences, accessibility, timezone, language, and active sessions only.</p>
        </header>
        <div className="bh-compact-grid">
          <CompactSection title="Preferences" description="Quick adjustments for the user environment.">
            <form className="bh-auth-form">
              <Field name="displayName" label="Display name" defaultValue="Camila Moura" />
              <Field name="timezone" label="Timezone" defaultValue="America/Sao_Paulo" />
              <Field name="locale" label="Language" defaultValue="pt-BR" />
              <Button type="submit">Save preferences</Button>
            </form>
          </CompactSection>
          <CompactSection title="Accessibility" description="Visual and interaction settings that help daily usage.">
            <div className="bh-inline">
              <label className="bh-check"><input type="checkbox" defaultChecked /><span>High contrast</span></label>
              <label className="bh-check"><input type="checkbox" /><span>Reduce motion</span></label>
              <label className="bh-check"><input type="checkbox" defaultChecked /><span>Large font</span></label>
            </div>
          </CompactSection>
          <CompactSection title="Active sessions" description="Connected devices with a direct end-session action.">
            <div className="bh-list-panel">
              <button className="bh-row-button" type="button">
                <strong>Chrome - Sao Paulo</strong>
                <span>Last access now - End session</span>
              </button>
              <button className="bh-row-button" type="button">
                <strong>iPhone - Mobile app</strong>
                <span>Last access 14 min ago - End session</span>
              </button>
            </div>
          </CompactSection>
        </div>
      </main>
    );
  }

  if (route === "colaboracao/membros") {
    return (
      <main className="bh-compact-page">
        <header className="bh-auth-heading">
          <span className="bh-eyebrow">Collaboration</span>
          <h1>{titleFor(screen)}</h1>
          <p>Only privacy, description, members, and moderator rules remain.</p>
        </header>
        <div className="bh-compact-grid">
          <CompactSection title="Privacy and description" description="Set visibility and describe the purpose of the space.">
            <form className="bh-auth-form">
              <Field name="title" label="Room name" defaultValue="Commercial operations" />
              <label className="bh-field">
                <span>Description</span>
                <textarea name="description" rows={4} defaultValue="Room for fast, moderated decisions." />
              </label>
              <label className="bh-check"><input type="checkbox" defaultChecked /><span>Private room</span></label>
              <Button type="submit">Save settings</Button>
            </form>
          </CompactSection>
          <CompactSection title="Members" description="Short list with roles and moderator rules.">
            <div className="bh-list-panel">
              <button className="bh-row-button" type="button"><strong>Camila Moura</strong><span>Moderator - can approve join requests</span></button>
              <button className="bh-row-button" type="button"><strong>SDR Agent</strong><span>Participant - read and post</span></button>
              <button className="bh-row-button" type="button"><strong>Rafael Costa</strong><span>Owner - keeps the room active</span></button>
            </div>
          </CompactSection>
        </div>
      </main>
    );
  }

  if (route === "colaboracao/arquivos") {
    return (
      <main className="bh-compact-page">
        <header className="bh-auth-heading">
          <span className="bh-eyebrow">Collaboration</span>
          <h1>{titleFor(screen)}</h1>
          <p>Attachment management with preview, quarantine, metadata, and signed URL only.</p>
        </header>
        <div className="bh-compact-grid">
          <MiniCard title="Contract.pdf" meta="Preview available" detail="Metadata: 12 MB - signed upload" />
          <MiniCard title="Briefing.docx" meta="Quarantine" detail="Waiting scan before release" />
          <MiniCard title="Image.png" meta="Signed URL" detail="Download expires in 15 minutes" />
        </div>
        <div className="bh-inline">
          <Button type="button">Upload attachment</Button>
          <Button type="button" tone="secondary">Generate signed URL</Button>
        </div>
      </main>
    );
  }

  if (route === "tarefas/detalhe") {
    return (
      <main className="bh-compact-page">
        <header className="bh-auth-heading">
          <span className="bh-eyebrow">Tasks</span>
          <h1>{titleFor(screen)}</h1>
          <p>The deep detail view is retired. Use the inbox and execution flow instead.</p>
        </header>
        <Card>
          <p>Task ID: <strong>{taskId || "not provided"}</strong></p>
          <p>Use the task inbox to follow context, execution, and results without a deep detail page.</p>
          <Link href="/tarefas/inbox" prefetch={false}>Open task inbox</Link>
        </Card>
      </main>
    );
  }

  if (route === "tarefas/execucao") {
    return (
      <main className="bh-compact-page">
        <header className="bh-auth-heading">
          <span className="bh-eyebrow">Tasks</span>
          <h1>{titleFor(screen)}</h1>
          <p>Only steps, attempts, heartbeat, latency, tokens, cost, and masked logs by run.</p>
        </header>
        <div className="bh-compact-grid">
          <MiniCard title="run-244" meta="Heartbeat 22s" detail="Average latency 1.8s - tokens 18k - cost R$ 12.40" />
          <MiniCard title="run-245" meta="2 attempts" detail="Masked logs - last failure is recoverable" />
          <MiniCard title="run-246" meta="Completed" detail="Steps validated - total cost R$ 8.10" />
        </div>
      </main>
    );
  }

  if (route === "tarefas/falhas") {
    return (
      <main className="bh-compact-page">
        <header className="bh-auth-heading">
          <span className="bh-eyebrow">Tasks</span>
          <h1>{titleFor(screen)}</h1>
          <p>Objective grouping by model, skill, permission, timeout, and integration impact.</p>
        </header>
        <div className="bh-compact-grid">
          <MiniCard title="Timeout" meta="Model gpt-4o-mini" detail="Impact: 14 runs - retry recommended" />
          <MiniCard title="Permission" meta="Skill crm.import" detail="Impact: 4 runs - scope blocked" />
          <MiniCard title="Integration" meta="Webhook Atlas" detail="Impact: 2 runs - response outside contract" />
        </div>
      </main>
    );
  }

  if (route === "tarefas/sla") {
    return (
      <main className="bh-compact-page">
        <header className="bh-auth-heading">
          <span className="bh-eyebrow">Tarefas</span>
          <h1>Calendário de SLA</h1>
          <p>Calendário operacional focado em tarefas vencidas e em risco por data, responsável e workflow.</p>
        </header>
        <div className="bh-compact-grid">
          <MiniCard title="Hoje" meta="Responsável: Camila Moura" detail="2 tarefas vencidas · 3 em risco" />
          <MiniCard title="Amanhã" meta="Responsável: Rafael Costa" detail="1 aprovação externa · 2 revisões" />
          <MiniCard title="Esta Semana" meta="Workflow: SDR Outreach" detail="4 entregas com prazo limite próximo" />
        </div>
        <div style={{ marginTop: "1.5rem" }}>
          <Link href="/tarefas/inbox" className="bh-chip bh-chip-accent" style={{ textDecoration: "none", padding: "0.5rem 1rem" }}>
            Ir para Fila de Tarefas
          </Link>
        </div>
      </main>
    );
  }

  if (route === "conhecimento/biblioteca") {
    const [docs, setDocs] = useState<any[]>([]);
    const [selectedDoc, setSelectedDoc] = useState<any | null>(null);
    const [title, setTitle] = useState("");
    const [meta, setMeta] = useState("");
    const [detail, setDetail] = useState("");

    useEffect(() => {
      const saved = localStorage.getItem("bighead_documents_local");
      if (saved) {
        setDocs(JSON.parse(saved));
      } else {
        const defaults = [
          { id: "1", title: "Internal docs", meta: "Origem: Google Drive · Pronto", detail: "Base de conhecimento interna sobre políticas operacionais da empresa." },
          { id: "2", title: "Support base", meta: "Origem: Ticketing · Processando", detail: "Histórico de chamados e soluções para atendimento rápido de suporte." },
          { id: "3", title: "Commercial playbook", meta: "Origem: Manual Comercial · Em revisão", detail: "Regras de qualificação, propostas e técnicas de vendas da BigHead." }
        ];
        localStorage.setItem("bighead_documents_local", JSON.stringify(defaults));
        setDocs(defaults);
      }
    }, []);

    const handleSave = (e: React.FormEvent) => {
      e.preventDefault();
      if (!title) return;
      let updated;
      if (selectedDoc) {
        updated = docs.map(d => d.id === selectedDoc.id ? { ...d, title, meta, detail } : d);
      } else {
        const newItem = { id: String(Date.now()), title, meta, detail };
        updated = [...docs, newItem];
      }
      setDocs(updated);
      localStorage.setItem("bighead_documents_local", JSON.stringify(updated));
      handleCancel();
    };

    const handleDelete = (id: string) => {
      const updated = docs.filter(d => d.id !== id);
      setDocs(updated);
      localStorage.setItem("bighead_documents_local", JSON.stringify(updated));
      handleCancel();
    };

    const handleEdit = (d: any) => {
      setSelectedDoc(d);
      setTitle(d.title);
      setMeta(d.meta);
      setDetail(d.detail);
    };

    const handleCancel = () => {
      setSelectedDoc(null);
      setTitle("");
      setMeta("");
      setDetail("");
    };

    return (
      <main className="bh-compact-page">
        <header className="bh-auth-heading">
          <span className="bh-eyebrow">Conhecimento</span>
          <h1>Biblioteca de Conhecimento</h1>
          <p>Gerencie seus documentos, bases de dados RAG, origens e o status de ingestão local.</p>
        </header>

        <div className="bh-compact-grid">
          <CompactSection title="Documentos Registrados" description="Selecione um documento para editar ou excluir da biblioteca local.">
            <div className="bh-list-panel">
              {docs.map((d) => (
                <button key={d.id} className="bh-row-button" type="button" onClick={() => handleEdit(d)}>
                  <strong>{d.title}</strong>
                  <span>{d.meta}</span>
                  <small>{d.detail}</small>
                </button>
              ))}
              {docs.length === 0 ? <p className="bh-state-panel">Nenhum documento disponível.</p> : null}
            </div>
          </CompactSection>

          <CompactSection title={selectedDoc ? "Editar Documento" : "Incluir Documento"} description="Preencha as informações para registrar o documento no repositório.">
            <form className="bh-auth-form" onSubmit={handleSave}>
              <label className="bh-field">
                <span>Título</span>
                <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="ex: Manual Financeiro" />
              </label>
              <label className="bh-field">
                <span>Meta (Origem / Status)</span>
                <input required value={meta} onChange={(e) => setMeta(e.target.value)} placeholder="ex: Origem: File Upload · Pronto" />
              </label>
              <label className="bh-field">
                <span>Detalhes / Descrição</span>
                <textarea required value={detail} onChange={(e) => setDetail(e.target.value)} placeholder="ex: Diretrizes de reembolso..." style={{ width: "100%", minHeight: "80px", background: "var(--field-bg)", border: "1px solid var(--border)", color: "var(--foreground)", padding: "0.5rem", borderRadius: "4px" }} />
              </label>
              <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
                <Button type="submit" tone="primary">Salvar</Button>
                {selectedDoc ? (
                  <>
                    <Button type="button" tone="risk" onClick={() => handleDelete(selectedDoc.id)}>Excluir</Button>
                    <Button type="button" tone="secondary" onClick={handleCancel}>Cancelar</Button>
                  </>
                ) : null}
              </div>
            </form>
          </CompactSection>
        </div>
      </main>
    );
  }

  if (route === "conhecimento/ingestao") {
    const [docs, setDocs] = useState<any[]>([]);
    const [fileName, setFileName] = useState("");
    const [chunkSize, setChunkSize] = useState("500");
    const [ingestStatus, setIngestStatus] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);

    useEffect(() => {
      const saved = localStorage.getItem("bighead_documents_local");
      if (saved) {
        setDocs(JSON.parse(saved));
      } else {
        const defaults = [
          { id: "1", title: "Internal docs", meta: "Origem: Google Drive · Pronto", detail: "Base de conhecimento interna sobre políticas operacionais da empresa." },
          { id: "2", title: "Support base", meta: "Origem: Ticketing · Processando", detail: "Histórico de chamados e soluções para atendimento rápido de suporte." },
          { id: "3", title: "Commercial playbook", meta: "Origem: Manual Comercial · Em revisão", detail: "Regras de qualificação, propostas e técnicas de vendas da BigHead." }
        ];
        localStorage.setItem("bighead_documents_local", JSON.stringify(defaults));
        setDocs(defaults);
      }
    }, []);

    const handleIngest = (e: React.FormEvent) => {
      e.preventDefault();
      if (!fileName) return;
      setIngestStatus("Processando RAG... 0%");
      let progress = 0;
      const interval = setInterval(() => {
        progress += 25;
        setIngestStatus(`Processando RAG... ${progress}%`);
        if (progress >= 100) {
          clearInterval(interval);
          const newItem = {
            id: String(Date.now()),
            title: fileName,
            meta: `Origem: Upload Local · Pronto`,
            detail: `Documento ingerido em chunks de ${chunkSize} caracteres para recuperação semântica.`
          };
          const updated = [...docs, newItem];
          setDocs(updated);
          localStorage.setItem("bighead_documents_local", JSON.stringify(updated));
          setIngestStatus("Documento processado com sucesso!");
          setFileName("");
        }
      }, 200);
    };

    const handleSearch = (e: React.FormEvent) => {
      e.preventDefault();
      if (!searchQuery) {
        setSearchResults([]);
        return;
      }
      const matches = docs.filter(d => 
        d.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        d.detail.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      const results = matches.map((d, index) => {
        const score = (0.95 - (index * 0.04)).toFixed(2);
        return {
          id: d.id,
          source: d.title,
          score: `${score} (Excelente)`,
          chunkText: `[Chunk #${index + 1}] ...${d.detail.slice(0, 150)}...`
        };
      });
      setSearchResults(results);
    };

    return (
      <main className="bh-compact-page">
        <header className="bh-auth-heading">
          <span className="bh-eyebrow">Conhecimento</span>
          <h1>Ingestão e Busca Semântica</h1>
          <p>Central de processamento RAG e testes de recuperação semântica em base vetorial local.</p>
        </header>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", width: "100%", marginTop: "1rem" }}>
          
          <CompactSection title="Coluna 1: Processamento RAG" description="Simule o upload, quebra em chunks e indexação de novos documentos.">
            <form onSubmit={handleIngest} className="bh-auth-form">
              <label className="bh-field">
                <span>Nome do Arquivo</span>
                <input required value={fileName} onChange={(e) => setFileName(e.target.value)} placeholder="ex: manual_de_vendas.pdf" />
              </label>
              <label className="bh-field">
                <span>Tamanho do Chunk (Caracteres)</span>
                <select value={chunkSize} onChange={(e) => setChunkSize(e.target.value)} style={{ width: "100%", padding: "0.5rem", background: "var(--field-bg)", border: "1px solid var(--border)", color: "var(--foreground)", borderRadius: "4px" }}>
                  <option value="250">250 caracteres</option>
                  <option value="500">500 caracteres (Padrão)</option>
                  <option value="1000">1000 caracteres</option>
                </select>
              </label>
              <Button type="submit">Iniciar Processamento RAG</Button>
              {ingestStatus ? <p style={{ marginTop: "1rem", color: "var(--accent)", fontWeight: "600" }}>{ingestStatus}</p> : null}
            </form>

            <div style={{ marginTop: "2rem" }}>
              <h4>Documentos Ingeridos ({docs.length})</h4>
              <div className="bh-list-panel" style={{ maxHeight: "180px", overflowY: "auto", marginTop: "0.5rem" }}>
                {docs.map(d => (
                  <div key={d.id} className="bh-mini-card" style={{ padding: "0.5rem", marginBottom: "0.5rem" }}>
                    <strong>{d.title}</strong>
                    <small>{d.meta}</small>
                  </div>
                ))}
              </div>
            </div>
          </CompactSection>

          <CompactSection title="Coluna 2: Consulta Semântica (RAG)" description="Consulte a base de chunks indexada usando linguagem natural.">
            <form onSubmit={handleSearch} className="bh-auth-form" style={{ display: "flex", gap: "0.5rem", alignItems: "flex-end" }}>
              <label className="bh-field" style={{ flex: 1 }}>
                <span>Digite sua consulta</span>
                <input required value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="ex: vendas, suporte, compliance..." />
              </label>
              <Button type="submit">Buscar</Button>
            </form>

            <div style={{ marginTop: "2rem" }}>
              <h4>Resultados de Recuperação ({searchResults.length})</h4>
              <div className="bh-list-panel" style={{ maxHeight: "280px", overflowY: "auto", marginTop: "0.5rem" }}>
                {searchResults.map((r, i) => (
                  <div key={r.id + i} className="bh-mini-card" style={{ padding: "0.75rem", marginBottom: "0.5rem", borderLeft: "3px solid var(--accent)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <strong>Fonte: {r.source}</strong>
                      <span style={{ color: "var(--accent)", fontSize: "0.85rem" }}>Score: {r.score}</span>
                    </div>
                    <p style={{ fontSize: "0.9rem", color: "var(--muted)", marginTop: "0.25rem" }}>{r.chunkText}</p>
                  </div>
                ))}
                {searchQuery && searchResults.length === 0 ? <p className="bh-state-panel">Nenhum chunk correspondente encontrado.</p> : null}
                {!searchQuery ? <p className="bh-state-panel">Digite um termo de busca e clique em Buscar.</p> : null}
              </div>
            </div>
          </CompactSection>

        </div>
      </main>
    );
  }

  if (route === "conhecimento/memoria") {
    const [memories, setMemories] = useState<any[]>([]);
    const [selectedMem, setSelectedMem] = useState<any | null>(null);
    const [title, setTitle] = useState("");
    const [meta, setMeta] = useState("");
    const [detail, setDetail] = useState("");

    useEffect(() => {
      const saved = localStorage.getItem("bighead_memories_local");
      if (saved) {
        setMemories(JSON.parse(saved));
      } else {
        const defaults = [
          { id: "1", title: "Fact", meta: "Valid until reviewed", detail: "Atlas Operações belongs to the main group." },
          { id: "2", title: "Inference", meta: "Derived from context", detail: "Customer acquisition cost is under budget thresholds." },
          { id: "3", title: "Decision", meta: "Stored as auditable", detail: "Risk policy version 12 approved by governance board." }
        ];
        localStorage.setItem("bighead_memories_local", JSON.stringify(defaults));
        setMemories(defaults);
      }
    }, []);

    const handleSave = (e: React.FormEvent) => {
      e.preventDefault();
      if (!title) return;
      let updated;
      if (selectedMem) {
        updated = memories.map(m => m.id === selectedMem.id ? { ...m, title, meta, detail } : m);
      } else {
        const newItem = { id: String(Date.now()), title, meta, detail };
        updated = [...memories, newItem];
      }
      setMemories(updated);
      localStorage.setItem("bighead_memories_local", JSON.stringify(updated));
      handleCancel();
    };

    const handleDelete = (id: string) => {
      const updated = memories.filter(m => m.id !== id);
      setMemories(updated);
      localStorage.setItem("bighead_memories_local", JSON.stringify(updated));
      handleCancel();
    };

    const handleEdit = (m: any) => {
      setSelectedMem(m);
      setTitle(m.title);
      setMeta(m.meta);
      setDetail(m.detail);
    };

    const handleCancel = () => {
      setSelectedMem(null);
      setTitle("");
      setMeta("");
      setDetail("");
    };

    return (
      <main className="bh-compact-page">
        <header className="bh-auth-heading">
          <span className="bh-eyebrow">Conhecimento</span>
          <h1>Memória Operacional</h1>
          <p>Visualize, insira, edite e conteste fatos, inferências e decisões da IA local.</p>
        </header>

        <div className="bh-compact-grid">
          <CompactSection title="Itens na Memória" description="Selecione um fato ou inferência para gerenciar seus registros locais.">
            <div className="bh-list-panel">
              {memories.map((m) => (
                <button key={m.id} className="bh-row-button" type="button" onClick={() => handleEdit(m)}>
                  <strong>{m.title}</strong>
                  <span>{m.meta}</span>
                  <small>{m.detail}</small>
                </button>
              ))}
              {memories.length === 0 ? <p className="bh-state-panel">Nenhum registro de memória disponível.</p> : null}
            </div>
          </CompactSection>

          <CompactSection title={selectedMem ? "Editar Item de Memória" : "Incluir Novo Fato"} description="Preencha os dados da asserção de memória operacional.">
            <form className="bh-auth-form" onSubmit={handleSave}>
              <label className="bh-field">
                <span>Tipo (Fact, Inference, Decision)</span>
                <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="ex: Fact" />
              </label>
              <label className="bh-field">
                <span>Validade / Estado</span>
                <input required value={meta} onChange={(e) => setMeta(e.target.value)} placeholder="ex: Valid until reviewed" />
              </label>
              <label className="bh-field">
                <span>Conteúdo do Fato</span>
                <textarea required value={detail} onChange={(e) => setDetail(e.target.value)} placeholder="ex: O limite de requisições foi excedido..." style={{ width: "100%", minHeight: "80px", background: "var(--field-bg)", border: "1px solid var(--border)", color: "var(--foreground)", padding: "0.5rem", borderRadius: "4px" }} />
              </label>
              <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
                <Button type="submit" tone="primary">Salvar</Button>
                {selectedMem ? (
                  <>
                    <Button type="button" tone="risk" onClick={() => handleDelete(selectedMem.id)}>Excluir</Button>
                    <Button type="button" tone="secondary" onClick={handleCancel}>Cancelar</Button>
                  </>
                ) : null}
              </div>
            </form>
          </CompactSection>
        </div>
      </main>
    );
  }

  if (route === "governanca/aprovacao-detalhe") {
    return (
      <main className="bh-compact-page">
        <header className="bh-auth-heading">
          <span className="bh-eyebrow">Governança</span>
          <h1>Aprovações Pendentes</h1>
          <p>Aprovações pendentes para o usuário ativo. Administradores podem visualizar a lista completa do tenant.</p>
        </header>
        <div className="bh-compact-grid">
          <CompactSection title="Minhas Aprovações Pendentes" description="Fila pessoal de aprovação rápida.">
            <div className="bh-list-panel">
              <button className="bh-row-button" type="button"><strong>Contrato Enterprise Acme</strong><span>Pendente · Alto Risco · Vence em 2h</span></button>
              <button className="bh-row-button" type="button"><strong>Campanha de Growth Q3</strong><span>Pendente · Risco Médio · Vence hoje</span></button>
            </div>
          </CompactSection>
          <CompactSection title="Visão do Administrador (Total do Tenant)" description="Todas as aprovações ativas na organização (visível apenas para administradores).">
            <div className="bh-list-panel">
              <button className="bh-row-button" type="button"><strong>Contrato Enterprise Acme</strong><span>Solicitante: Camila · Status: Pendente</span></button>
              <button className="bh-row-button" type="button"><strong>Campanha de Growth Q3</strong><span>Solicitante: SDR Agent · Status: Pendente</span></button>
              <button className="bh-row-button" type="button"><strong>Integração CRM Webhook</strong><span>Solicitante: Rafael · Status: Aprovado</span></button>
              <button className="bh-row-button" type="button"><strong>Ajuste de Limite de Crédito</strong><span>Solicitante: Lucas · Status: Rejeitado</span></button>
            </div>
          </CompactSection>
        </div>
      </main>
    );
  }

  if (route === "governanca/scorecards") {
    return (
      <main className="bh-compact-page">
        <header className="bh-auth-heading">
          <span className="bh-eyebrow">Governança</span>
          <h1>Scorecards de Qualidade</h1>
          <p>Critérios de qualidade e scorecards por entrega, canal e política de risco. Administradores têm acesso global.</p>
        </header>
        <div className="bh-compact-grid">
          <MiniCard title="Entrega de Conteúdo" meta="Pontuação: 84/100" detail="1 falha crítica - política de revisão manual aplicada" />
          <MiniCard title="Canal de Comunicação (E-mail + CRM)" meta="Aderência Alta" detail="Enquadrado em conformidade com 2 alertas de risco resolvidos" />
          <MiniCard title="Gate de Risco Global" meta="Visão Administrador" detail="Todos os usuários e rodadas de QA sob monitoramento ativo" />
        </div>
      </main>
    );
  }

  if (route === "governanca/politicas") {
    return (
      <main className="bh-compact-page">
        <header className="bh-auth-heading">
          <span className="bh-eyebrow">Governance</span>
          <h1>{titleFor(screen)}</h1>
          <p>Configuration of approval policies with risk, action type, and segregation simulator.</p>
        </header>
        <div className="bh-compact-grid">
          <CompactSection title="Risk simulator" description="Check the required gate by risk and action type.">
            <form className="bh-auth-form">
              <Field name="risk" label="Risk" defaultValue="high" />
              <Field name="action" label="Action" defaultValue="publish external content" />
              <Field name="segregation" label="Segregation" defaultValue="double approval" />
              <Button type="submit">Simulate</Button>
            </form>
          </CompactSection>
          <CompactSection title="Policy rules" description="Keep policy rules visible, short, and explicit.">
            <div className="bh-list-panel">
              <button className="bh-row-button" type="button"><strong>High risk</strong><span>Two approvals required</span></button>
              <button className="bh-row-button" type="button"><strong>External action</strong><span>Segregation enforced</span></button>
            </div>
          </CompactSection>
        </div>
      </main>
    );
  }

  if (route === "automacao/skills") {
    return (
      <main className="bh-compact-page">
        <header className="bh-auth-heading">
          <span className="bh-eyebrow">Automation</span>
          <h1>{titleFor(screen)}</h1>
          <p>Only the skill list, schema, risk, timeout, retries, approval need, contract editor, and execution simulator remain.</p>
        </header>
        <div className="bh-compact-grid">
          <CompactSection title="Skill catalog" description="One line per skill with the operational controls that matter.">
            <div className="bh-list-panel">
              <button className="bh-row-button" type="button"><strong>crm.import</strong><span>Risk: high · timeout 30s · retries 2</span></button>
              <button className="bh-row-button" type="button"><strong>ops.routing</strong><span>Risk: medium · approval required</span></button>
              <button className="bh-row-button" type="button"><strong>support.summary</strong><span>Risk: low · timeout 12s</span></button>
            </div>
          </CompactSection>
          <CompactSection title="Contract editor" description="Edit the input/output contract and keep the masking rules explicit.">
            <form className="bh-auth-form">
              <Field name="schema" label="Schema" defaultValue="crm.import.v1" />
              <Field name="timeout" label="Timeout" defaultValue="30s" />
              <Field name="retries" label="Retries" defaultValue="2" />
              <label className="bh-check"><input type="checkbox" defaultChecked /><span>Mask sensitive data</span></label>
              <Button type="submit">Save contract</Button>
            </form>
          </CompactSection>
        </div>
      </main>
    );
  }

  if (route === "automacao/modelos") {
    return (
      <main className="bh-compact-page">
        <header className="bh-auth-heading">
          <span className="bh-eyebrow">Automation</span>
          <h1>{titleFor(screen)}</h1>
          <p>Cadastro de providers, modelos, pricing, fallback e vigencia de preco.</p>
        </header>
        <div className="bh-compact-grid">
          <CompactSection title="Providers and models" description="Keep provider, model, price, and fallback together.">
            <div className="bh-list-panel">
              <button className="bh-row-button" type="button"><strong>OpenAI gpt-4o-mini</strong><span>Active · price valid</span></button>
              <button className="bh-row-button" type="button"><strong>Anthropic claude-sonnet</strong><span>Fallback configured</span></button>
              <button className="bh-row-button" type="button"><strong>Local small model</strong><span>Deprecated pricing</span></button>
            </div>
          </CompactSection>
          <CompactSection title="Pricing form" description="Update price windows and fallback policy.">
            <form className="bh-auth-form">
              <Field name="provider" label="Provider" defaultValue="OpenAI" />
              <Field name="model" label="Model" defaultValue="gpt-4o-mini" />
              <Field name="pricing" label="Pricing" defaultValue="0.15 / 1k tokens" />
              <Field name="fallback" label="Fallback" defaultValue="claude-sonnet" />
              <Button type="submit">Save model</Button>
            </form>
          </CompactSection>
        </div>
      </main>
    );
  }

  if (route === "automacao/workflow-editor") {
    return (
      <main className="bh-compact-page">
        <header className="bh-auth-heading">
          <span className="bh-eyebrow">Automation</span>
          <h1>{titleFor(screen)}</h1>
          <p>Canvas visual for agent, decision, wait, review, and approval steps.</p>
        </header>
        <div className="bh-compact-grid">
          <CompactSection title="Workflow canvas" description="Use a visual step chain instead of a dense generic board.">
            <div className="bh-list-panel">
              <button className="bh-row-button" type="button"><strong>Agent step</strong><span>Collects context and starts the run</span></button>
              <button className="bh-row-button" type="button"><strong>Decision step</strong><span>Routes by risk or approval</span></button>
              <button className="bh-row-button" type="button"><strong>Wait step</strong><span>Pauses until a signal arrives</span></button>
              <button className="bh-row-button" type="button"><strong>Review step</strong><span>Human validation</span></button>
              <button className="bh-row-button" type="button"><strong>Approval step</strong><span>Final gate before publish</span></button>
            </div>
          </CompactSection>
        </div>
      </main>
    );
  }

  if (route === "automacao/workflow-versoes") {
    return (
      <main className="bh-compact-page">
        <header className="bh-auth-heading">
          <span className="bh-eyebrow">Automation</span>
          <h1>{titleFor(screen)}</h1>
          <p>Version history, diff, and rollback while preserving old executions tied to the origin.</p>
        </header>
        <div className="bh-compact-grid">
          <CompactSection title="Version history" description="Versions stay visible without hiding old runs.">
            <div className="bh-list-panel">
              <button className="bh-row-button" type="button"><strong>v18</strong><span>Current · diff available</span></button>
              <button className="bh-row-button" type="button"><strong>v17</strong><span>Previous · rollback ready</span></button>
              <button className="bh-row-button" type="button"><strong>v16</strong><span>Legacy · executions preserved</span></button>
            </div>
          </CompactSection>
        </div>
      </main>
    );
  }

  if (route === "automacao/playbooks") {
    return (
      <main className="bh-compact-page">
        <header className="bh-auth-heading">
          <span className="bh-eyebrow">Automation</span>
          <h1>{titleFor(screen)}</h1>
          <p>Playbooks are parameterized objects for starting workflows with context, owners, and templates.</p>
        </header>
        <div className="bh-compact-grid">
          <CompactSection title="Playbook catalog" description="List, view, and edit playbooks without extra noise.">
            <div className="bh-list-panel">
              <button className="bh-row-button" type="button"><strong>Outbound SDR</strong><span>Owner: Growth · template: warm leads</span></button>
              <button className="bh-row-button" type="button"><strong>Onboarding Legal</strong><span>Owner: Ops · template: compliance</span></button>
              <button className="bh-row-button" type="button"><strong>Support Triage</strong><span>Owner: Support · template: routing</span></button>
            </div>
          </CompactSection>
        </div>
      </main>
    );
  }

  if (route === "automacao/prompts") {
    const [prompts, setPrompts] = useState<any[]>([]);
    const [selectedPrompt, setSelectedPrompt] = useState<any | null>(null);
    const [title, setTitle] = useState("");
    const [meta, setMeta] = useState("");
    const [detail, setDetail] = useState("");

    useEffect(() => {
      const saved = localStorage.getItem("bighead_prompts_local");
      if (saved) {
        setPrompts(JSON.parse(saved));
      } else {
        const defaults = [
          { id: "1", title: "Lead qualification", meta: "Versão v18 · Ativo", detail: "Prompt versionado para triagem de vendas e análise de ICP." },
          { id: "2", title: "Task summary", meta: "Versão v4 · Ativo", detail: "Transforma o histórico de execuções de um agente em sumário executivo." },
          { id: "3", title: "Policy check", meta: "Versão v12 · Ativo", detail: "Valida conformidade com políticas de privacidade e tom de voz." }
        ];
        localStorage.setItem("bighead_prompts_local", JSON.stringify(defaults));
        setPrompts(defaults);
      }
    }, []);

    const handleSave = (e: React.FormEvent) => {
      e.preventDefault();
      if (!title) return;
      let updated;
      if (selectedPrompt) {
        updated = prompts.map(p => p.id === selectedPrompt.id ? { ...p, title, meta, detail } : p);
      } else {
        const newItem = { id: String(Date.now()), title, meta, detail };
        updated = [...prompts, newItem];
      }
      setPrompts(updated);
      localStorage.setItem("bighead_prompts_local", JSON.stringify(updated));
      handleCancel();
    };

    const handleDelete = (id: string) => {
      const updated = prompts.filter(p => p.id !== id);
      setPrompts(updated);
      localStorage.setItem("bighead_prompts_local", JSON.stringify(updated));
      handleCancel();
    };

    const handleEdit = (p: any) => {
      setSelectedPrompt(p);
      setTitle(p.title);
      setMeta(p.meta);
      setDetail(p.detail);
    };

    const handleCancel = () => {
      setSelectedPrompt(null);
      setTitle("");
      setMeta("");
      setDetail("");
    };

    return (
      <main className="bh-compact-page">
        <header className="bh-auth-heading">
          <span className="bh-eyebrow">Automação</span>
          <h1>Biblioteca de Prompts</h1>
          <p>Consulte, crie, edite e versionar prompts operacionais para os agentes virtuais.</p>
        </header>

        <div className="bh-compact-grid">
          <CompactSection title="Prompts Cadastrados" description="Selecione um prompt para editar ou excluir localmente.">
            <div className="bh-list-panel">
              {prompts.map((p) => (
                <button key={p.id} className="bh-row-button" type="button" onClick={() => handleEdit(p)}>
                  <strong>{p.title}</strong>
                  <span>{p.meta}</span>
                  <small>{p.detail}</small>
                </button>
              ))}
              {prompts.length === 0 ? <p className="bh-state-panel">Nenhum prompt disponível.</p> : null}
            </div>
          </CompactSection>

          <CompactSection title={selectedPrompt ? "Editar Prompt" : "Incluir Prompt"} description="Defina a instrução e a versão do prompt ativo.">
            <form className="bh-auth-form" onSubmit={handleSave}>
              <label className="bh-field">
                <span>Nome / Título</span>
                <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="ex: Lead qualification" />
              </label>
              <label className="bh-field">
                <span>Versão e Status</span>
                <input required value={meta} onChange={(e) => setMeta(e.target.value)} placeholder="ex: Versão v18 · Ativo" />
              </label>
              <label className="bh-field">
                <span>Diretriz do Prompt</span>
                <textarea required value={detail} onChange={(e) => setDetail(e.target.value)} placeholder="ex: Você é um agente especializado..." style={{ width: "100%", minHeight: "80px", background: "var(--field-bg)", border: "1px solid var(--border)", color: "var(--foreground)", padding: "0.5rem", borderRadius: "4px" }} />
              </label>
              <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
                <Button type="submit" tone="primary">Salvar</Button>
                {selectedPrompt ? (
                  <>
                    <Button type="button" tone="risk" onClick={() => handleDelete(selectedPrompt.id)}>Excluir</Button>
                    <Button type="button" tone="secondary" onClick={handleCancel}>Cancelar</Button>
                  </>
                ) : null}
              </div>
            </form>
          </CompactSection>
        </div>
      </main>
    );
  }

  if (route === "automacao/workflows") {
    const [workflows, setWorkflows] = useState<any[]>([]);
    const [selectedWorkflow, setSelectedWorkflow] = useState<any | null>(null);
    const [title, setTitle] = useState("");
    const [meta, setMeta] = useState("");
    const [detail, setDetail] = useState("");

    useEffect(() => {
      const saved = localStorage.getItem("bighead_workflows_local");
      if (saved) {
        setWorkflows(JSON.parse(saved));
      } else {
        const defaults = [
          { id: "1", title: "Lead routing", meta: "Responsável: Growth · Ativo", detail: "Workflow para qualificação e distribuição automática de novos leads." },
          { id: "2", title: "Approval chain", meta: "Responsável: Governança · Ativo", detail: "Esteira de aprovação de riscos e verificação de compliance de contratos." },
          { id: "3", title: "Knowledge ingest", meta: "Responsável: Operações · Ativo", detail: "Processamento, extração de texto, chunking e indexação em banco vetorial." }
        ];
        localStorage.setItem("bighead_workflows_local", JSON.stringify(defaults));
        setWorkflows(defaults);
      }
    }, []);

    const handleSave = (e: React.FormEvent) => {
      e.preventDefault();
      if (!title) return;
      let updated;
      if (selectedWorkflow) {
        updated = workflows.map(w => w.id === selectedWorkflow.id ? { ...w, title, meta, detail } : w);
      } else {
        const newItem = { id: String(Date.now()), title, meta, detail };
        updated = [...workflows, newItem];
      }
      setWorkflows(updated);
      localStorage.setItem("bighead_workflows_local", JSON.stringify(updated));
      handleCancel();
    };

    const handleDelete = (id: string) => {
      const updated = workflows.filter(w => w.id !== id);
      setWorkflows(updated);
      localStorage.setItem("bighead_workflows_local", JSON.stringify(updated));
      handleCancel();
    };

    const handleEdit = (w: any) => {
      setSelectedWorkflow(w);
      setTitle(w.title);
      setMeta(w.meta);
      setDetail(w.detail);
    };

    const handleCancel = () => {
      setSelectedWorkflow(null);
      setTitle("");
      setMeta("");
      setDetail("");
    };

    return (
      <main className="bh-compact-page">
        <header className="bh-auth-heading">
          <span className="bh-eyebrow">Automação</span>
          <h1>Catálogo de Workflows</h1>
          <p>Monitore, inclua, configure e edite fluxos de execução baseados em grafos de agentes.</p>
        </header>

        <div className="bh-compact-grid">
          <CompactSection title="Workflows Registrados" description="Selecione um workflow para editar ou excluir localmente.">
            <div className="bh-list-panel">
              {workflows.map((w) => (
                <button key={w.id} className="bh-row-button" type="button" onClick={() => handleEdit(w)}>
                  <strong>{w.title}</strong>
                  <span>{w.meta}</span>
                  <small>{w.detail}</small>
                </button>
              ))}
              {workflows.length === 0 ? <p className="bh-state-panel">Nenhum workflow disponível.</p> : null}
            </div>
          </CompactSection>

          <CompactSection title={selectedWorkflow ? "Editar Workflow" : "Incluir Workflow"} description="Cadastre passos de automação e regras de roteamento.">
            <form className="bh-auth-form" onSubmit={handleSave}>
              <label className="bh-field">
                <span>Nome do Workflow</span>
                <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="ex: Lead routing" />
              </label>
              <label className="bh-field">
                <span>Responsável e Status</span>
                <input required value={meta} onChange={(e) => setMeta(e.target.value)} placeholder="ex: Responsável: Growth · Ativo" />
              </label>
              <label className="bh-field">
                <span>Descrição / Detalhes</span>
                <textarea required value={detail} onChange={(e) => setDetail(e.target.value)} placeholder="ex: Passos do agente, decisão e aprovador..." style={{ width: "100%", minHeight: "80px", background: "var(--field-bg)", border: "1px solid var(--border)", color: "var(--foreground)", padding: "0.5rem", borderRadius: "4px" }} />
              </label>
              <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
                <Button type="submit" tone="primary">Salvar</Button>
                {selectedWorkflow ? (
                  <>
                    <Button type="button" tone="risk" onClick={() => handleDelete(selectedWorkflow.id)}>Excluir</Button>
                    <Button type="button" tone="secondary" onClick={handleCancel}>Cancelar</Button>
                  </>
                ) : null}
              </div>
            </form>
          </CompactSection>
        </div>
      </main>
    );
  }

  if (route === "automacao/biblioteca") {
    const [rags, setRags] = useState<any[]>([]);
    const [selectedRag, setSelectedRag] = useState<any | null>(null);
    const [title, setTitle] = useState("");
    const [meta, setMeta] = useState("");
    const [detail, setDetail] = useState("");

    useEffect(() => {
      const saved = localStorage.getItem("bighead_rags_local");
      if (saved) {
        setRags(JSON.parse(saved));
      } else {
        const defaults = [
          { id: "1", title: "Internal docs", meta: "Origem: Google Drive · Pronto", detail: "Base de conhecimento interna sobre políticas operacionais da empresa." },
          { id: "2", title: "Support base", meta: "Origem: Ticketing · Processando", detail: "Histórico de chamados e soluções para atendimento rápido de suporte." },
          { id: "3", title: "Commercial playbook", meta: "Origem: Manual Comercial · Em revisão", detail: "Regras de qualificação, propostas e técnicas de vendas da BigHead." }
        ];
        localStorage.setItem("bighead_rags_local", JSON.stringify(defaults));
        setRags(defaults);
      }
    }, []);

    const handleSave = (e: React.FormEvent) => {
      e.preventDefault();
      if (!title) return;
      let updated;
      if (selectedRag) {
        updated = rags.map(r => r.id === selectedRag.id ? { ...r, title, meta, detail } : r);
      } else {
        const newItem = { id: String(Date.now()), title, meta, detail };
        updated = [...rags, newItem];
      }
      setRags(updated);
      localStorage.setItem("bighead_rags_local", JSON.stringify(updated));
      handleCancel();
    };

    const handleDelete = (id: string) => {
      const updated = rags.filter(r => r.id !== id);
      setRags(updated);
      localStorage.setItem("bighead_rags_local", JSON.stringify(updated));
      handleCancel();
    };

    const handleEdit = (r: any) => {
      setSelectedRag(r);
      setTitle(r.title);
      setMeta(r.meta);
      setDetail(r.detail);
    };

    const handleCancel = () => {
      setSelectedRag(null);
      setTitle("");
      setMeta("");
      setDetail("");
    };

    return (
      <main className="bh-compact-page">
        <header className="bh-auth-heading">
          <span className="bh-eyebrow">Automação</span>
          <h1>Biblioteca RAG</h1>
          <p>Gerencie e conecte repositórios de conhecimento aos seus agentes de IA local.</p>
        </header>

        <div className="bh-compact-grid">
          <CompactSection title="Bases RAG Ativas" description="Selecione uma base RAG para editar ou excluir localmente.">
            <div className="bh-list-panel">
              {rags.map((r) => (
                <button key={r.id} className="bh-row-button" type="button" onClick={() => handleEdit(r)}>
                  <strong>{r.title}</strong>
                  <span>{r.meta}</span>
                  <small>{r.detail}</small>
                </button>
              ))}
              {rags.length === 0 ? <p className="bh-state-panel">Nenhuma base RAG disponível.</p> : null}
            </div>
          </CompactSection>

          <CompactSection title={selectedRag ? "Editar Base RAG" : "Incluir Base RAG"} description="Conecte uma nova fonte de contexto para os agentes de IA.">
            <form className="bh-auth-form" onSubmit={handleSave}>
              <label className="bh-field">
                <span>Título da Base</span>
                <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="ex: Internal docs" />
              </label>
              <label className="bh-field">
                <span>Origem / Estado</span>
                <input required value={meta} onChange={(e) => setMeta(e.target.value)} placeholder="ex: Origem: Google Drive · Pronto" />
              </label>
              <label className="bh-field">
                <span>Descrição da Fonte</span>
                <textarea required value={detail} onChange={(e) => setDetail(e.target.value)} placeholder="ex: Contratos e atas de reuniões..." style={{ width: "100%", minHeight: "80px", background: "var(--field-bg)", border: "1px solid var(--border)", color: "var(--foreground)", padding: "0.5rem", borderRadius: "4px" }} />
              </label>
              <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
                <Button type="submit" tone="primary">Salvar</Button>
                {selectedRag ? (
                  <>
                    <Button type="button" tone="risk" onClick={() => handleDelete(selectedRag.id)}>Excluir</Button>
                    <Button type="button" tone="secondary" onClick={handleCancel}>Cancelar</Button>
                  </>
                ) : null}
              </div>
            </form>
          </CompactSection>
        </div>
      </main>
    );
  }

  if (route === "administracao/organizacao") {
    return (
      <main className="bh-compact-page">
        <header className="bh-auth-heading">
          <span className="bh-eyebrow">Administration</span>
          <h1>{titleFor(screen)}</h1>
          <p>Only organization branding, defaults, and current state stay on screen.</p>
        </header>
        <div className="bh-compact-grid">
          <CompactSection title="Branding" description="Name, logo, and workspace identity.">
            <form className="bh-auth-form">
              <Field name="name" label="Organization name" defaultValue="Atlas Local" />
              <Field name="slug" label="Slug" defaultValue="atlas-local" />
              <Field name="domain" label="Primary domain" placeholder="atlas.local" />
              <Button type="submit">Save branding</Button>
            </form>
          </CompactSection>
          <CompactSection title="Defaults" description="Timezone, locale, and entry behavior.">
            <div className="bh-list-panel">
              <button className="bh-row-button" type="button"><strong>Timezone</strong><span>America/Sao_Paulo</span></button>
              <button className="bh-row-button" type="button"><strong>Locale</strong><span>pt-BR</span></button>
              <button className="bh-row-button" type="button"><strong>Entry policy</strong><span>Require organization selector</span></button>
            </div>
          </CompactSection>
        </div>
      </main>
    );
  }

  if (route === "administracao/membros") {
    return (
      <main className="bh-compact-page">
        <header className="bh-auth-heading">
          <span className="bh-eyebrow">Administration</span>
          <h1>{titleFor(screen)}</h1>
          <p>Only membership, invites, and roles remain.</p>
        </header>
        <CompactSection title="Members" description="Short list of active members with their role." action="Convidar membro">
          <div className="bh-list-panel">
            <button className="bh-row-button" type="button"><strong>Camila Moura</strong><span>Admin · can invite and remove</span></button>
            <button className="bh-row-button" type="button"><strong>Rafael Costa</strong><span>Moderator · manages approvals</span></button>
            <button className="bh-row-button" type="button"><strong>Lucas Gomes</strong><span>Member · standard access</span></button>
          </div>
        </CompactSection>
      </main>
    );
  }

  if (route === "administracao/integracoes") {
    return (
      <main className="bh-compact-page">
        <header className="bh-auth-heading">
          <span className="bh-eyebrow">Administration</span>
          <h1>{titleFor(screen)}</h1>
          <p>Only integration status, webhook state, and the next action stay visible.</p>
        </header>
        <CompactSection title="Integrations" description="List the live connections and their health." action="Adicionar integracao">
          <div className="bh-list-panel">
            <button className="bh-row-button" type="button"><strong>Hermes</strong><span>Connected · event sync active</span></button>
            <button className="bh-row-button" type="button"><strong>Supabase</strong><span>Connected · auth and data ready</span></button>
            <button className="bh-row-button" type="button"><strong>CRM webhook</strong><span>Paused · retry pending</span></button>
          </div>
        </CompactSection>
      </main>
    );
  }

  if (route === "administracao/privacidade-auditoria") {
    return (
      <main className="bh-compact-page">
        <header className="bh-auth-heading">
          <span className="bh-eyebrow">Administration</span>
          <h1>{titleFor(screen)}</h1>
          <p>Only retention, privacy, and audit controls remain.</p>
        </header>
        <div className="bh-compact-grid">
          <CompactSection title="Retention" description="Control how long operational data stays available.">
            <div className="bh-list-panel">
              <button className="bh-row-button" type="button"><strong>Audit log</strong><span>Append only · 365 days</span></button>
              <button className="bh-row-button" type="button"><strong>Files</strong><span>Signed URL · 90 days</span></button>
            </div>
          </CompactSection>
          <CompactSection title="Audit exports" description="Keep the export path visible without clutter.">
            <div className="bh-list-panel">
              <button className="bh-row-button" type="button"><strong>Export scope</strong><span>Organization and time range</span></button>
              <button className="bh-row-button" type="button"><strong>Review trail</strong><span>Who viewed, changed, and approved</span></button>
            </div>
          </CompactSection>
        </div>
      </main>
    );
  }

  if (route === "administracao/projetos") {
    return (
      <main className="bh-compact-page">
        <header className="bh-auth-heading">
          <span className="bh-eyebrow">Administration</span>
          <h1>{titleFor(screen)}</h1>
          <p>Projects are listed with owner, organization, and current state.</p>
        </header>
        <CompactSection title="Project catalog" description="Objective list only." action="Adicionar projeto">
          <div className="bh-list-panel">
            {projectsList.map((project) => (
              <div key={project.id} className="bh-row-button" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", textAlign: "left", padding: "0.75rem 1rem" }}>
                <div>
                  <strong>{project.name}</strong>
                  <span style={{ display: "block", fontSize: "0.85rem", color: "var(--muted)" }}>
                    Org: {project.org} · Owner: {project.owner}
                  </span>
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <Link href={`/administracao/projetos/criar?editId=${project.id}`} className="bh-chip" style={{ background: "rgba(255,255,255,0.05)", padding: "0.25rem 0.5rem", fontSize: "0.8rem", textDecoration: "none" }}>Editar</Link>
                  <Button onClick={() => saveProjects(projectsList.filter(p => p.id !== project.id))} tone="secondary" style={{ padding: "0.25rem 0.5rem", fontSize: "0.8rem" }}>Excluir</Button>
                </div>
              </div>
            ))}
            {projectsList.length === 0 ? (
              <p style={{ padding: "1rem", color: "var(--muted)" }}>Nenhum projeto cadastrado.</p>
            ) : null}
          </div>
          <div style={{ marginTop: "1.5rem" }}>
            <Link href="/administracao/projetos/criar" className="bh-chip bh-chip-accent" style={{ textDecoration: "none", padding: "0.5rem 1rem" }}>Adicionar projeto</Link>
          </div>
        </CompactSection>
      </main>
    );
  }

  if (route === "administracao/projetos/criar") {
    const editId = typeof searchParams.editId === "string" ? searchParams.editId : "";
    const isEditing = !!editId;
    const projectToEdit = isEditing ? projectsList.find(p => p.id === editId) : null;

    const handleSaveProject = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const form = new FormData(e.currentTarget);
      const name = form.get("name") as string;
      const org = form.get("organization") as string;
      const owner = form.get("owner") as string;

      if (!name.trim()) return;

      if (isEditing) {
        saveProjects(projectsList.map(p => p.id === editId ? { ...p, name, org, owner } : p));
      } else {
        saveProjects([...projectsList, { id: crypto.randomUUID(), name, org, owner }]);
      }
      window.location.href = "/administracao/projetos";
    };

    return (
      <main className="bh-compact-page">
        <header className="bh-auth-heading">
          <span className="bh-eyebrow">Administration</span>
          <h1>{isEditing ? "Editar Projeto" : "Criar Projeto"}</h1>
          <p>Defina a organização e o proprietário do projeto.</p>
        </header>
        <CompactSection title={isEditing ? "Editar Projeto" : "Novo Projeto"} description="Preencha os dados do projeto abaixo.">
          <form className="bh-auth-form" onSubmit={handleSaveProject}>
            <Field name="organization" label="Organização" defaultValue={projectToEdit?.org ?? "Atlas Local"} placeholder="Organização do projeto" />
            <Field name="name" label="Nome do projeto" defaultValue={projectToEdit?.name ?? ""} placeholder="Nome do projeto" />
            <Field name="owner" label="Proprietário" defaultValue={projectToEdit?.owner ?? ""} placeholder="Nome do proprietário" />
            <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
              <Button type="submit">{isEditing ? "Salvar alterações" : "Criar projeto"}</Button>
              <Link href="/administracao/projetos" className="bh-chip" style={{ background: "rgba(255,255,255,0.05)", padding: "0.5rem 1rem", display: "inline-flex", alignItems: "center", textDecoration: "none" }}>Cancelar</Link>
            </div>
          </form>
        </CompactSection>
      </main>
    );
  }

  if (route === "administracao/times") {
    return (
      <main className="bh-compact-page">
        <header className="bh-auth-heading">
          <span className="bh-eyebrow">Administration</span>
          <h1>{titleFor(screen)}</h1>
          <p>Teams can include humans, agents, or both across multiple organizations and projects.</p>
        </header>
        <CompactSection title="Team catalog" description="Objective list only." action="Adicionar time">
          <div className="bh-list-panel">
            {teamsList.map((team) => (
              <div key={team.id} className="bh-row-button" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", textAlign: "left", padding: "0.75rem 1rem" }}>
                <div>
                  <strong>{team.name}</strong>
                  <span style={{ display: "block", fontSize: "0.85rem", color: "var(--muted)" }}>Tipo: {team.type}</span>
                  <small style={{ display: "block", color: "var(--muted)", marginTop: "0.25rem", fontSize: "0.75rem" }}>
                    Orgs: {team.orgs.join(", ")} | Projetos: {team.projects.join(", ")}
                  </small>
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <Link href={`/administracao/times/criar?editId=${team.id}`} className="bh-chip" style={{ background: "rgba(255,255,255,0.05)", padding: "0.25rem 0.5rem", fontSize: "0.8rem", textDecoration: "none" }}>Editar</Link>
                  <Button onClick={() => saveTeams(teamsList.filter(t => t.id !== team.id))} tone="secondary" style={{ padding: "0.25rem 0.5rem", fontSize: "0.8rem" }}>Excluir</Button>
                </div>
              </div>
            ))}
            {teamsList.length === 0 ? (
              <p style={{ padding: "1rem", color: "var(--muted)" }}>Nenhum time cadastrado.</p>
            ) : null}
          </div>
          <div style={{ marginTop: "1.5rem" }}>
            <Link href="/administracao/times/criar" className="bh-chip bh-chip-accent" style={{ textDecoration: "none", padding: "0.5rem 1rem" }}>Adicionar time</Link>
          </div>
        </CompactSection>
      </main>
    );
  }

  if (route === "administracao/times/criar") {
    const editId = typeof searchParams.editId === "string" ? searchParams.editId : "";
    const isEditing = !!editId;
    const teamToEdit = isEditing ? teamsList.find(t => t.id === editId) : null;

    const handleSaveTeam = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const form = new FormData(e.currentTarget);
      const name = form.get("name") as string;
      const isHuman = form.get("isHuman") === "on";
      const isAgent = form.get("isAgent") === "on";

      if (!name.trim()) return;
      
      let type = "Humanos apenas";
      if (isHuman && isAgent) type = "Combinado (Humanos + Agentes)";
      else if (isAgent) type = "Agentes apenas";

      const selectedOrgs: string[] = [];
      if (form.get("org_atlas") === "on") selectedOrgs.push("Atlas Local");
      if (form.get("org_northwind") === "on") selectedOrgs.push("Northwind");
      if (form.get("org_acme") === "on") selectedOrgs.push("Acme Growth");

      const selectedProjects: string[] = [];
      if (form.get("proj_launch") === "on") selectedProjects.push("Atlas launch");
      if (form.get("proj_revamp") === "on") selectedProjects.push("Support revamp");
      if (form.get("proj_rollout") === "on") selectedProjects.push("Enterprise rollout");

      if (selectedOrgs.length === 0) selectedOrgs.push("Atlas Local");
      if (selectedProjects.length === 0) selectedProjects.push("Atlas launch");

      if (isEditing) {
        saveTeams(teamsList.map(t => t.id === editId ? { ...t, name, type, orgs: selectedOrgs, projects: selectedProjects } : t));
      } else {
        saveTeams([...teamsList, { id: crypto.randomUUID(), name, type, orgs: selectedOrgs, projects: selectedProjects }]);
      }
      window.location.href = "/administracao/times";
    };

    return (
      <main className="bh-compact-page">
        <header className="bh-auth-heading">
          <span className="bh-eyebrow">Administration</span>
          <h1>{isEditing ? "Editar Time" : "Criar Time"}</h1>
          <p>Times podem ser formados por humanos, agentes ou ambos combinados e podem atuar em múltiplas organizações e projetos.</p>
        </header>
        <CompactSection title={isEditing ? "Editar Time" : "Novo Time"} description="Configure o time com humanos, agentes ou combinados, atuando em múltiplas organizações e projetos.">
          <form className="bh-auth-form" onSubmit={handleSaveTeam}>
            <Field name="name" label="Nome do time" defaultValue={teamToEdit?.name ?? ""} placeholder="Commercial pod" />
            
            <div style={{ margin: "1rem 0" }}>
              <span style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>Composição dos Membros</span>
              <div style={{ display: "flex", gap: "1rem" }}>
                <label className="bh-check">
                  <input type="checkbox" name="isHuman" defaultChecked={teamToEdit ? (teamToEdit.type.includes("Humanos") || teamToEdit.type.includes("Combinado")) : true} />
                  <span>Humanos</span>
                </label>
                <label className="bh-check">
                  <input type="checkbox" name="isAgent" defaultChecked={teamToEdit ? (teamToEdit.type.includes("Agentes") || teamToEdit.type.includes("Combinado")) : true} />
                  <span>Agentes</span>
                </label>
              </div>
            </div>

            <div style={{ margin: "1rem 0" }}>
              <span style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>Organizações de Atuação</span>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                <label className="bh-check">
                  <input type="checkbox" name="org_atlas" defaultChecked={teamToEdit ? teamToEdit.orgs.includes("Atlas Local") : true} />
                  <span>Atlas Local</span>
                </label>
                <label className="bh-check">
                  <input type="checkbox" name="org_northwind" defaultChecked={teamToEdit ? teamToEdit.orgs.includes("Northwind") : false} />
                  <span>Northwind</span>
                </label>
                <label className="bh-check">
                  <input type="checkbox" name="org_acme" defaultChecked={teamToEdit ? teamToEdit.orgs.includes("Acme Growth") : false} />
                  <span>Acme Growth</span>
                </label>
              </div>
            </div>

            <div style={{ margin: "1rem 0" }}>
              <span style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>Projetos Associados</span>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                <label className="bh-check">
                  <input type="checkbox" name="proj_launch" defaultChecked={teamToEdit ? teamToEdit.projects.includes("Atlas launch") : true} />
                  <span>Atlas launch</span>
                </label>
                <label className="bh-check">
                  <input type="checkbox" name="proj_revamp" defaultChecked={teamToEdit ? teamToEdit.projects.includes("Support revamp") : false} />
                  <span>Support revamp</span>
                </label>
                <label className="bh-check">
                  <input type="checkbox" name="proj_rollout" defaultChecked={teamToEdit ? teamToEdit.projects.includes("Enterprise rollout") : false} />
                  <span>Enterprise rollout</span>
                </label>
              </div>
            </div>

            <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
              <Button type="submit">{isEditing ? "Salvar alterações" : "Criar time"}</Button>
              <Link href="/administracao/times" className="bh-chip" style={{ background: "rgba(255,255,255,0.05)", padding: "0.5rem 1rem", display: "inline-flex", alignItems: "center", textDecoration: "none" }}>Cancelar</Link>
            </div>
          </form>
        </CompactSection>
      </main>
    );
  }

  if (route === "comercial/contas-contatos") {
    return (
      <main className="bh-compact-page">
        <header className="bh-auth-heading">
          <span className="bh-eyebrow">Commercial</span>
          <h1>{titleFor(screen)}</h1>
          <p>Only accounts and contacts stay visible, with no extra dashboard noise.</p>
        </header>
        <div className="bh-compact-grid">
          <CompactSection title="Accounts" description="Key commercial accounts." action="Nova conta">
            <div className="bh-list-panel">
              <button className="bh-row-button" type="button"><strong>Atlas Local</strong><span>12 contacts · active</span></button>
              <button className="bh-row-button" type="button"><strong>Northwind</strong><span>8 contacts · pending</span></button>
            </div>
          </CompactSection>
          <CompactSection title="Contacts" description="Clean contact list with origin." action="Novo contato">
            <div className="bh-list-panel">
              <button className="bh-row-button" type="button"><strong>Camila Moura</strong><span>Owner: Atlas Local</span></button>
              <button className="bh-row-button" type="button"><strong>Bruno Lima</strong><span>Owner: Northwind</span></button>
            </div>
          </CompactSection>
        </div>
      </main>
    );
  }

  if (route === "comercial/campanhas") {
    return (
      <main className="bh-compact-page">
        <header className="bh-auth-heading">
          <span className="bh-eyebrow">Commercial</span>
          <h1>{titleFor(screen)}</h1>
          <p>Campaign list only: status, owner, and next action.</p>
        </header>
        <CompactSection title="Campaigns" description="One card per campaign." action="Nova campanha">
          <div className="bh-list-panel">
            <button className="bh-row-button" type="button"><strong>Q3 outbound</strong><span>Scheduled · owner Growth</span></button>
            <button className="bh-row-button" type="button"><strong>Winback</strong><span>Draft · owner CRM</span></button>
          </div>
        </CompactSection>
      </main>
    );
  }

  if (route === "comercial/conteudo") {
    return (
      <main className="bh-compact-page">
        <header className="bh-auth-heading">
          <span className="bh-eyebrow">Commercial</span>
          <h1>{titleFor(screen)}</h1>
          <p>Only content briefs and publishing actions remain.</p>
        </header>
        <CompactSection title="Content studio" description="Brief, review, and publish only." action="Novo conteudo">
          <div className="bh-list-panel">
            <button className="bh-row-button" type="button"><strong>Product update</strong><span>Brief ready · approval pending</span></button>
            <button className="bh-row-button" type="button"><strong>Customer story</strong><span>Draft ready · review with sales</span></button>
          </div>
        </CompactSection>
      </main>
    );
  }

  if (route === "comercial/publicacoes") {
    return (
      <main className="bh-compact-page">
        <header className="bh-auth-heading">
          <span className="bh-eyebrow">Commercial</span>
          <h1>{titleFor(screen)}</h1>
          <p>Editorial calendar and scheduled publications only.</p>
        </header>
        <CompactSection title="Publication calendar" description="Upcoming posts and their status.">
          <div className="bh-list-panel">
            <button className="bh-row-button" type="button"><strong>Mon</strong><span>LinkedIn post · scheduled</span></button>
            <button className="bh-row-button" type="button"><strong>Wed</strong><span>Email article · review pending</span></button>
            <button className="bh-row-button" type="button"><strong>Fri</strong><span>Case study · approved</span></button>
          </div>
        </CompactSection>
      </main>
    );
  }

  if (route === "aprendizado/experimentos") {
    return (
      <main className="bh-compact-page">
        <header className="bh-auth-heading">
          <span className="bh-eyebrow">Learn</span>
          <h1>{titleFor(screen)}</h1>
          <p>Only the experiment list stays, with direct access to create and review.</p>
        </header>
        <CompactSection title="Experiments" description="Objective list only." action="Novo experimento">
          <div className="bh-list-panel">
            <button className="bh-row-button" type="button"><strong>Routing policy</strong><span>Running · compare variants</span></button>
            <button className="bh-row-button" type="button"><strong>Lead scoring</strong><span>Paused · review outcome</span></button>
          </div>
        </CompactSection>
      </main>
    );
  }

  if (route === "aprendizado/experimento-detalhe") {
    return (
      <main className="bh-compact-page">
        <header className="bh-auth-heading">
          <span className="bh-eyebrow">Learn</span>
          <h1>{titleFor(screen)}</h1>
          <p>One experiment, one outcome, one next step.</p>
        </header>
        <div className="bh-compact-grid">
          <MiniCard title="Variant A" meta="Score 0.72" detail="Best for conversion" />
          <MiniCard title="Variant B" meta="Score 0.61" detail="Best for latency" />
          <MiniCard title="Decision" meta="Keep A" detail="Proceed to rollout" />
        </div>
      </main>
    );
  }

  if (route === "aprendizado/dashboard-executivo") {
    return (
      <main className="bh-compact-page">
        <header className="bh-auth-heading">
          <span className="bh-eyebrow">Learn</span>
          <h1>{titleFor(screen)}</h1>
          <p>High-level KPIs only: delivery, risk, and outcome.</p>
        </header>
        <div className="bh-compact-grid">
          <MiniCard title="Delivery" meta="84%" detail="On target this week" />
          <MiniCard title="Risk" meta="Low" detail="No major blocks" />
          <MiniCard title="Outcome" meta="12 wins" detail="Top performing flow" />
        </div>
      </main>
    );
  }

  if (route === "aprendizado/analytics-sla") {
    return (
      <main className="bh-compact-page">
        <header className="bh-auth-heading">
          <span className="bh-eyebrow">Learn</span>
          <h1>{titleFor(screen)}</h1>
          <p>Only SLA performance by date, owner, and workflow.</p>
        </header>
        <div className="bh-compact-grid">
          <MiniCard title="Overdue" meta="3" detail="Needs immediate review" />
          <MiniCard title="At risk" meta="5" detail="Due within 24h" />
          <MiniCard title="On track" meta="18" detail="Healthy workflow calendar" />
        </div>
      </main>
    );
  }

  if (route === "aprendizado/analytics-agentes") {
    return (
      <main className="bh-compact-page">
        <header className="bh-auth-heading">
          <span className="bh-eyebrow">Learn</span>
          <h1>{titleFor(screen)}</h1>
          <p>Only agent performance, error groups, and latency remain.</p>
        </header>
        <div className="bh-compact-grid">
          <MiniCard title="Latency" meta="240ms" detail="P95 for top agents" />
          <MiniCard title="Errors" meta="4 groups" detail="Timeout, permission, integration" />
          <MiniCard title="Success" meta="96%" detail="Healthy execution rate" />
        </div>
      </main>
    );
  }

  if (route === "aprendizado/custos") {
    return (
      <main className="bh-compact-page">
        <header className="bh-auth-heading">
          <span className="bh-eyebrow">Learn</span>
          <h1>{titleFor(screen)}</h1>
          <p>Budget, spend, and quotas only.</p>
        </header>
        <div className="bh-compact-grid">
          <MiniCard title="Budget" meta="$12k" detail="Monthly budget approved" />
          <MiniCard title="Spend" meta="$8.1k" detail="67% used" />
          <MiniCard title="Quota" meta="Stable" detail="No exhaustion risk" />
        </div>
      </main>
    );
  }

  if (route === "aprendizado/funil") {
    return (
      <main className="bh-compact-page">
        <header className="bh-auth-heading">
          <span className="bh-eyebrow">Learn</span>
          <h1>{titleFor(screen)}</h1>
          <p>Only the funnel and attribution view remain.</p>
        </header>
        <div className="bh-compact-grid">
          <MiniCard title="Top" meta="42" detail="Entries by source" />
          <MiniCard title="Middle" meta="18" detail="Qualified progression" />
          <MiniCard title="Bottom" meta="6" detail="Attributed conversions" />
        </div>
      </main>
    );
  }

  return null;
}
