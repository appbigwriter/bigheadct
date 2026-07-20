import Link from "next/link";
import {
  ArrowUpRight,
  CheckCircle2,
  CircleAlert,
  Clock3,
  ListTodo,
  MessageSquareMore,
  ShieldAlert
} from "lucide-react";

import type { WorkspaceOption, WorkspaceSnapshot } from "@/lib/mock-workspace";

import styles from "./home-dashboard.module.css";

const terminalTaskStates = new Set(["done", "completed", "canceled", "cancelled"]);
const riskOrder: Record<string, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3
};

const statusLabels: Record<string, string> = {
  new: "Nova",
  triaged: "Triada",
  in_progress: "Em andamento",
  blocked: "Bloqueada",
  ready_for_review: "Pronta para revisão",
  done: "Concluída",
  completed: "Concluída",
  canceled: "Cancelada",
  cancelled: "Cancelada",
  overdue: "Em atraso",
  critical: "Crítico",
  high: "Alto",
  medium: "Médio",
  low: "Baixo",
  pending: "Aguardando decisão",
  approved: "Aprovada",
  rejected: "Rejeitada"
};

function statusLabel(status?: string) {
  if (!status) return "Status não informado";
  return statusLabels[status] ?? status.replaceAll("_", " ");
}

function isPendingApproval(item: WorkspaceOption) {
  return !item.status || item.status === "pending";
}

function taskHref(item: WorkspaceOption) {
  const params = new URLSearchParams({ taskId: item.id });
  return `/tarefas/detalhe?${params.toString()}`;
}

function approvalHref(item: WorkspaceOption) {
  const params = new URLSearchParams({ approvalId: item.id });
  return `/governanca/aprovacao-detalhe?${params.toString()}`;
}

function dueTimestamp(item: WorkspaceOption) {
  const value = item.dueAt ?? item.slaAt;
  if (!value) return Number.POSITIVE_INFINITY;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : Number.POSITIVE_INFINITY;
}

function dueLabel(item: WorkspaceOption) {
  const timestamp = dueTimestamp(item);
  if (!Number.isFinite(timestamp)) return "Prazo indisponível";
  return `Prazo ${new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    timeZone: "UTC"
  }).format(timestamp)}`;
}

function ownerLabel(item: WorkspaceOption) {
  return item.assigneeId ? `ID do responsável: ${item.assigneeId}` : "Responsável indisponível";
}

function riskLabel(item: WorkspaceOption) {
  return item.riskLevel ? `Risco ${statusLabel(item.riskLevel)}` : "Risco indisponível";
}

export function HomeDashboard({ snapshot }: { snapshot: WorkspaceSnapshot }) {
  const activeTasks = snapshot.taskOptions.filter(
    (task) => !terminalTaskStates.has(task.status ?? "")
  );
  const pendingApprovals = snapshot.approvalOptions.filter(isPendingApproval);
  const blockedTasks = activeTasks.filter((task) => task.status === "blocked");
  const slaSignal = snapshot.analyticsDrilldowns.find((item) =>
    /overdue|sla|breach/i.test(item.dimension)
  );

  const priorities = [
    ...activeTasks.map((item) => ({
      id: `task-${item.id}`,
      kind: "Tarefa",
      title: item.name,
      status: statusLabel(item.status),
      href: taskHref(item),
      owner: ownerLabel(item),
      due: dueLabel(item),
      risk: riskLabel(item),
      nextAction: item.nextAction ? item.nextAction : "Definir próxima ação",
      riskRank: riskOrder[item.riskLevel ?? ""] ?? 4,
      dueRank: dueTimestamp(item)
    })),
    ...pendingApprovals.map((item) => ({
      id: `approval-${item.id}`,
      kind: "Aprovação",
      title: item.name,
      status: statusLabel(item.status),
      href: approvalHref(item),
      owner: ownerLabel(item),
      due: dueLabel(item),
      risk: riskLabel(item),
      nextAction: item.nextAction ? item.nextAction : "Escolher decisão",
      riskRank: riskOrder[item.riskLevel ?? ""] ?? 4,
      dueRank: dueTimestamp(item)
    }))
  ]
    .sort((left, right) => {
      if (left.riskRank !== right.riskRank) return left.riskRank - right.riskRank;
      const dueDifference = left.dueRank - right.dueRank;
      if (Number.isFinite(dueDifference) && dueDifference) return dueDifference;
      return left.id.localeCompare(right.id);
    })
    .slice(0, 6);

  const nextStep =
    priorities[0] ??
    (snapshot.adminMoments.length
      ? {
          id: "audit-0",
          kind: "Auditoria",
          title: snapshot.adminMoments[0]?.title ?? "Examinar atividade recente",
          status: "Revisão recomendada",
          href: "/operacao/home",
          owner: "Comece pela atividade recente",
          due: "Sem prazo",
          risk: "Contexto informativo",
          nextAction: snapshot.adminMoments[0]?.description ?? "Abrir atividade",
          riskRank: 4,
          dueRank: Number.POSITIVE_INFINITY
        }
      : null);

  return (
    <div className={styles.home} aria-labelledby="home-title">
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Painel operacional</p>
          <h2 id="home-title">O que precisa de atenção agora</h2>
          <p className={styles.intro}>
            Uma visão curta para você decidir o próximo passo sem navegar por
            painéis genéricos.
          </p>
        </div>
        <div className={styles.headerActions}>
          <Link className={styles.secondaryAction} href="/acesso/onboarding">
            Nova organização
          </Link>
          <Link className={styles.primaryAction} href="/tarefas/criar">
            Nova tarefa <ArrowUpRight aria-hidden="true" size={17} />
          </Link>
        </div>
      </header>

      <section className={styles.structurePanel} aria-label="Organizacao, projetos e times">
        <div className={styles.sectionHeading}>
          <div>
            <h3>Estrutura do Workspace</h3>
            <p>Visualização hierárquica e aninhada de Organização, Projetos e Times.</p>
          </div>
        </div>
        <div className={styles.structureCard} style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "100%" }}>
          <div className={styles.structureCardHeader} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: "0.75rem" }}>
            <strong>Organização: {snapshot.currentOrganization}</strong>
            <Link href="/acesso/onboarding" style={{ color: "var(--accent)" }}>Adicionar Nova</Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", paddingLeft: "0.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--muted)", fontWeight: "600" }}>Projetos ativos</span>
              <Link href="/administracao/projetos/criar" style={{ fontSize: "0.85rem", color: "var(--accent)" }}>adicionar projeto</Link>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {snapshot.projectOptions.slice(0, 3).map((project) => (
                <div key={project.id} style={{ padding: "1rem", border: "1px solid var(--border)", borderRadius: "6px", background: "rgba(255,255,255,0.01)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Link href="/administracao/projetos" style={{ fontWeight: "600", fontSize: "1rem" }}>
                      {project.name}
                    </Link>
                  </div>
                  
                  <div style={{ marginTop: "1rem", paddingLeft: "1rem", borderLeft: "2px dashed var(--border)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                      <span style={{ fontSize: "0.8rem", color: "var(--muted)", fontWeight: "500" }}>Times alocados</span>
                      <Link href="/administracao/times/criar" style={{ fontSize: "0.8rem", color: "var(--accent)" }}>adicionar time</Link>
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                      {snapshot.teamOptions.slice(0, 3).map((team) => (
                        <Link key={team.id} href="/administracao/times" style={{ fontSize: "0.8rem", padding: "0.25rem 0.5rem", borderRadius: "4px", border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)" }}>
                          {team.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className={styles.metrics} aria-label="Resumo operacional">
        <Metric
          icon={<ListTodo aria-hidden="true" />}
          label="Tarefas ativas nesta página"
          value={String(activeTasks.length)}
          href="/tarefas/inbox?view=active"
        />
        <Metric
          icon={<CheckCircle2 aria-hidden="true" />}
          label="Aprovações pendentes"
          value={String(pendingApprovals.length)}
          href="/governanca/aprovacoes?status=pending"
        />
        <Metric
          icon={<ShieldAlert aria-hidden="true" />}
          label="Tarefas bloqueadas"
          value={String(blockedTasks.length)}
          href="/tarefas/inbox?view=blocked"
          muted={blockedTasks.length === 0}
        />
        <Metric
          icon={<Clock3 aria-hidden="true" />}
          label="Sinal de SLA"
          value={slaSignal ? String(slaSignal.value) : "Sem leitura"}
          muted={!slaSignal}
        />
      </section>

      <div className={styles.workspaceGrid}>
        <section className={styles.prioritySection} aria-labelledby="priorities-title">
          <SectionHeading
            title="Próximo passo"
            description="A primeira ação útil que vale sua atenção."
            href={nextStep?.href ?? "/tarefas/inbox?view=active"}
            action={nextStep ? "Abrir agora" : "Ver tarefas"}
          />
          {nextStep ? (
            <Link className={styles.priorityRow} href={nextStep.href}>
              <span className={styles.priorityIndex}>01</span>
              <span className={styles.priorityContent}>
                <span className={styles.priorityKind}>{nextStep.kind}</span>
                <strong>{nextStep.title}</strong>
                <span className={styles.priorityMeta}>
                  <span>{nextStep.owner}</span>
                  <span>{nextStep.due}</span>
                  <span>{nextStep.risk}</span>
                  <span>Próxima ação: {nextStep.nextAction}</span>
                </span>
              </span>
              <span className={styles.priorityStatus}>{nextStep.status}</span>
              <ArrowUpRight aria-hidden="true" className={styles.rowArrow} size={18} />
            </Link>
          ) : (
            <EmptyState
              icon={<CheckCircle2 aria-hidden="true" />}
              title="Nenhuma prioridade aberta"
              description="Não há tarefas nem aprovações pendentes neste workspace."
            />
          )}

          <SectionHeading
            title="Fila prioritária"
            description="Itens restantes ordenados por risco e prazo."
            href="/tarefas/inbox?view=active"
            action="Abrir fila"
          />
          {priorities.length ? (
            <ol className={styles.priorityList} aria-label="Prioridades abertas">
              {priorities.map((item, index) => (
                <li key={item.id}>
                  <Link className={styles.priorityRow} href={item.href}>
                    <span className={styles.priorityIndex}>
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className={styles.priorityContent}>
                      <span className={styles.priorityKind}>{item.kind}</span>
                      <strong>{item.title}</strong>
                      <span className={styles.priorityMeta}>
                        <span>{item.owner}</span>
                        <span>{item.due}</span>
                        <span>{item.risk}</span>
                        <span>Próxima ação: {item.nextAction}</span>
                      </span>
                    </span>
                    <span className={styles.priorityStatus}>{item.status}</span>
                    <ArrowUpRight aria-hidden="true" className={styles.rowArrow} size={18} />
                  </Link>
                </li>
              ))}
            </ol>
          ) : null}
        </section>

        <aside className={styles.signalRail} aria-label="Contexto operacional">
          <section aria-labelledby="signal-title">
            <SectionHeading title="Sinal atual" />
            {slaSignal ? (
              <div className={styles.signalValue}>
                <strong>{slaSignal.value}</strong>
                <span>itens com {statusLabel(slaSignal.dimension)}</span>
              </div>
            ) : (
              <EmptyState
                compact
                icon={<Clock3 aria-hidden="true" />}
                title="Sem leitura de SLA"
                description="O resumo atual não fornece risco ou atraso de SLA."
              />
            )}
          </section>

          <section aria-labelledby="activity-title">
            <SectionHeading title="Atividade recente" />
            {snapshot.adminMoments.length ? (
              <ul className={styles.activityList}>
                {snapshot.adminMoments.slice(0, 4).map((item, index) => (
                  <li key={item.id ?? `${item.title}-${index}`}>
                    <span className={styles.activityMarker}>
                      <MessageSquareMore aria-hidden="true" size={15} />
                    </span>
                    <span>
                      <strong>{item.title}</strong>
                      <span>{item.description}</span>
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                compact
                icon={<CircleAlert aria-hidden="true" />}
                title="Atividade indisponível"
                description="Nenhum evento de auditoria foi retornado para este perfil."
              />
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}

function Metric({
  icon,
  label,
  value,
  href,
  muted = false
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
  muted?: boolean;
}) {
  const content = (
    <>
      <span className={styles.metricIcon}>{icon}</span>
      <span>
        <span className={styles.metricLabel}>{label}</span>
        <strong>{value}</strong>
      </span>
      {href ? <ArrowUpRight aria-hidden="true" size={16} /> : null}
    </>
  );
  const className = `${styles.metric} ${muted ? styles.metricMuted : ""} ${href ? "" : styles.metricStatic}`;
  return href ? (
    <Link className={className} href={href}>
      {content}
    </Link>
  ) : (
    <div className={className}>{content}</div>
  );
}

function SectionHeading({
  title,
  description,
  href,
  action
}: {
  title: string;
  description?: string;
  href?: string;
  action?: string;
}) {
  return (
    <div className={styles.sectionHeading}>
      <div>
        <h3 id={`${title.toLowerCase().replaceAll(" ", "-")}-title`}>{title}</h3>
        {description ? <p>{description}</p> : null}
      </div>
      {href && action ? (
        <Link href={href}>
          {action}
          <ArrowUpRight aria-hidden="true" size={15} />
        </Link>
      ) : null}
    </div>
  );
}

function EmptyState({
  icon,
  title,
  description,
  compact = false
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  compact?: boolean;
}) {
  return (
    <div className={`${styles.empty} ${compact ? styles.emptyCompact : ""}`}>
      <span>{icon}</span>
      <div>
        <strong>{title}</strong>
        <p>{description}</p>
      </div>
    </div>
  );
}
