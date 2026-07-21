import { WorkspaceAccessState } from "@/components/shell/workspace-access-state";
import type { ScreenDefinition } from "@/lib/screen-catalog";
import { getServerWorkspaceData } from "@/lib/server-workspace-service";
import { getWorkspaceRequestContext } from "@/lib/workspace-request-context";
import { ConversationsWorkspace } from "./conversations-workspace";
import { CommercialWorkspace } from "./commercial-workspace";
import { ApprovalsWorkspace } from "./approvals-workspace";
import { AgentsWorkspace } from "./agents-workspace";
import { GlobalSearch } from "./global-search";
import { HomeDashboard } from "./home-dashboard";
import { NotificationsCenter } from "./notifications-center";
import { CompactRouteScreens } from "./compact-route-screens";
import { ScreenExperience } from "./screen-experience";
import { TasksWorkspace } from "./tasks-workspace";

type ScreenTemplateProps = {
  screen: ScreenDefinition;
  searchParams?: Record<string, string | string[] | undefined>;
};

export async function ScreenTemplate({ screen, searchParams = {} }: ScreenTemplateProps) {
  const route = screen.slug.join("/");
  const excludedRoutes = new Set(["governanca/portal-externo", "automacao/skill-teste", "conhecimento/busca-semantica"]);
  const compactRoutes = new Set([
    "acesso/recuperacao",
    "acesso/onboarding",
    "acesso/convite",
    "acesso/organizacoes",
    "operacao/perfil",
    "colaboracao/membros",
    "colaboracao/arquivos",
    "tarefas/execucao",
    "tarefas/falhas",
    "tarefas/sla",
    "conhecimento/biblioteca",
    "conhecimento/ingestao",
    "conhecimento/memoria",
    "governanca/scorecards",
    "governanca/politicas",
    "automacao/skills",
    "automacao/modelos",
    "automacao/prompts",
    "automacao/workflows",
    "automacao/biblioteca",
    "automacao/workflow-editor",
    "automacao/workflow-versoes",
    "automacao/playbooks",
    "administracao/organizacao",
    "administracao/membros",
    "administracao/integracoes",
    "administracao/privacidade-auditoria",
    "administracao/projetos",
    "administracao/projetos/criar",
    "administracao/times",
    "administracao/times/criar",
    "comercial/contas-contatos",
    "comercial/campanhas",
    "comercial/conteudo",
    "comercial/publicacoes",
    "aprendizado/experimentos",
    "aprendizado/experimento-detalhe",
    "aprendizado/dashboard-executivo",
    "aprendizado/analytics-sla",
    "aprendizado/analytics-agentes",
    "aprendizado/custos",
    "aprendizado/funil"
  ]);
  if (excludedRoutes.has(route)) return null;
  if (compactRoutes.has(route)) {
    const context = await getWorkspaceRequestContext();
    const snapshot = await getServerWorkspaceData(context);
    return <CompactRouteScreens screen={screen} searchParams={searchParams} snapshot={snapshot} />;
  }
  if (route === "operacao/busca-global") return <GlobalSearch />;
  if (route === "colaboracao/salas") {
    return <ConversationsWorkspace mode="list" />;
  }
  if (route === "tarefas/inbox") return <TasksWorkspace mode="inbox" />;
  if (route === "tarefas/criar") {
    const context = await getWorkspaceRequestContext();
    const snapshot = await getServerWorkspaceData(context);
    return <TasksWorkspace mode="create" snapshot={snapshot} />;
  }
  if (route === "comercial/leads") return <CommercialWorkspace mode="leads" />;
  if (route === "comercial/leads/criar") return <CommercialWorkspace mode="create" />;
  if (route === "comercial/lead-detalhe") return <CommercialWorkspace mode="detail" />;
  if (route === "comercial/pipeline") return <CommercialWorkspace mode="pipeline" />;
  if (route === "governanca/aprovacoes") return <ApprovalsWorkspace mode="inbox" />;
  if (route === "governanca/aprovacao-detalhe") return <ApprovalsWorkspace mode="inbox" />;
  if (route === "automacao/agentes") return <AgentsWorkspace mode="catalog" />;
  if (route === "automacao/agente-config") return <AgentsWorkspace mode="detail" />;

  const context = await getWorkspaceRequestContext();
  const snapshot = await getServerWorkspaceData(context);
  if (route === "operacao/home") {
    return <HomeDashboard snapshot={snapshot} />;
  }
  if (route === "operacao/notificacoes") {
    const organizationId = snapshot.currentOrganizationId ?? context.tenantId;
    if (!organizationId) return <WorkspaceAccessState kind="tenant-empty" />;
    const requestedFilter = Array.isArray(searchParams.filter) ? searchParams.filter[0] : searchParams.filter;
    return (
      <NotificationsCenter
        organizationId={organizationId}
        filter={requestedFilter === "unread" ? "unread" : "all"}
      />
    );
  }
  return <ScreenExperience screen={screen} snapshot={snapshot} />;
}
