import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { getServerWorkspaceData, getWorkspaceRequestContext } = vi.hoisted(() => ({
  getServerWorkspaceData: vi.fn(),
  getWorkspaceRequestContext: vi.fn()
}));

vi.mock("@/lib/server-workspace-service", () => ({ getServerWorkspaceData }));
vi.mock("@/lib/workspace-request-context", () => ({ getWorkspaceRequestContext }));
vi.mock("./screen-experience", () => ({
  ScreenExperience: ({ screen }: { screen: { title: string } }) => <div>Screen experience: {screen.title}</div>
}));
vi.mock("./domain-workspace", () => ({
  DomainWorkspace: ({ screen }: { screen: { title: string } }) => <div>Product domain: {screen.title}</div>
}));
vi.mock("./notifications-center", () => ({
  NotificationsCenter: ({ filter }: { filter: string }) => <div>Product notifications: {filter}</div>
}));
vi.mock("./approvals-workspace", () => ({
  ApprovalsWorkspace: ({ mode }: { mode: string }) => <div>Product approvals: {mode}</div>
}));
vi.mock("./compact-route-screens", () => ({
  CompactRouteScreens: ({ screen }: { screen: { slug: string[]; title: string } }) => <div>Compact route: {screen.slug.join("/")} · {screen.title}</div>
}));
vi.mock("./conversations-workspace", () => ({
  ConversationsWorkspace: ({ mode }: { mode: string }) => <div>Product conversations: {mode}</div>
}));
vi.mock("./tasks-workspace", () => ({
  TasksWorkspace: ({ mode }: { mode: string }) => <div>Product tasks: {mode}</div>
}));
vi.mock("./commercial-workspace", () => ({
  CommercialWorkspace: ({ mode }: { mode: string }) => <div>Product commercial: {mode}</div>
}));
vi.mock("./agents-workspace", () => ({
  AgentsWorkspace: ({ mode }: { mode: string }) => <div>Product agents: {mode}</div>
}));

import { getWorkspaceSnapshot } from "@/lib/mock-workspace";
import { getDefaultScreen, screens } from "@/lib/screen-catalog";

import { ScreenTemplate } from "./screen-template";

const compactRoutes = [
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
  "governanca/politicas",
  "governanca/scorecards",
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
] as const;

describe("ScreenTemplate product routing", () => {
  beforeEach(() => {
    getWorkspaceRequestContext.mockReset().mockResolvedValue({ tenantId: "org-1" });
    getServerWorkspaceData.mockReset().mockResolvedValue(getWorkspaceSnapshot());
  });

  it("selects the product Home for /operacao/home", async () => {
    render(await ScreenTemplate({ screen: getDefaultScreen() }));

    expect(screen.getByRole("heading", { name: /O que precisa de atenção agora/ })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Nova organização" })).toBeTruthy();
  });

  it("selects product search without loading the workspace snapshot", async () => {
    const searchScreen = { ...getDefaultScreen(), slug: ["operacao", "busca-global"] };

    render(await ScreenTemplate({ screen: searchScreen }));

    expect(screen.getByRole("heading", { name: "Encontre trabalho e contexto" })).toBeTruthy();
    expect(getServerWorkspaceData).not.toHaveBeenCalled();
  });

  it("selects product notifications and keeps the URL filter", async () => {
    const notificationsScreen = { ...getDefaultScreen(), slug: ["operacao", "notificacoes"] };

    render(await ScreenTemplate({ screen: notificationsScreen, searchParams: { filter: "unread" } }));

    expect(screen.getByText("Product notifications: unread")).toBeTruthy();
  });

  it.each([
    [["colaboracao", "salas"], "list"]
  ] as const)("selects product conversations for %s", async (slug, mode) => {
    const conversationScreen = { ...getDefaultScreen(), slug: [...slug] };

    render(await ScreenTemplate({ screen: conversationScreen }));

    expect(screen.getByText(`Product conversations: ${mode}`)).toBeTruthy();
    expect(getServerWorkspaceData).not.toHaveBeenCalled();
  });

  it.each([
    [["tarefas", "inbox"], "inbox"],
    [["tarefas", "criar"], "create"]
  ] as const)("selects product tasks for %s", async (slug, mode) => {
    const taskScreen = { ...getDefaultScreen(), slug: [...slug] };

    render(await ScreenTemplate({ screen: taskScreen }));

    expect(screen.getByText(`Product tasks: ${mode}`)).toBeTruthy();
    if (mode === "create") {
      expect(getServerWorkspaceData).toHaveBeenCalled();
    } else {
      expect(getServerWorkspaceData).not.toHaveBeenCalled();
    }
  });

  it.each([
    [["comercial", "leads"], "leads"],
    [["comercial", "lead-detalhe"], "detail"],
    [["comercial", "pipeline"], "pipeline"]
  ] as const)("selects product commercial for %s", async (slug, mode) => {
    const commercialScreen = { ...getDefaultScreen(), slug: [...slug] };
    render(await ScreenTemplate({ screen: commercialScreen }));
    expect(screen.getByText(`Product commercial: ${mode}`)).toBeTruthy();
    expect(getServerWorkspaceData).not.toHaveBeenCalled();
  });

  it.each(compactRoutes)("selects compact route screens for %s", async (route) => {
    const compactScreen = { ...getDefaultScreen(), slug: route.split("/") as [string, string, ...string[]] };

    render(await ScreenTemplate({ screen: compactScreen }));

    expect(screen.getByText(`Compact route: ${route} · ${compactScreen.title}`)).toBeTruthy();
    expect(getServerWorkspaceData).not.toHaveBeenCalled();
  });

  it("treats excluded routes as unavailable", async () => {
    const portal = { ...getDefaultScreen(), title: "Portal externo", slug: ["governanca", "portal-externo"] };
    const skillTest = { ...getDefaultScreen(), title: "Skill teste", slug: ["automacao", "skill-teste"] };
    const semanticSearch = { ...getDefaultScreen(), title: "Busca semantica", slug: ["conhecimento", "busca-semantica"] };

    expect(await ScreenTemplate({ screen: portal })).toBeNull();
    expect(await ScreenTemplate({ screen: skillTest })).toBeNull();
    expect(await ScreenTemplate({ screen: semanticSearch })).toBeNull();
  });

  it("selects compact route for knowledge library", async () => {
    const fallbackScreen = { ...getDefaultScreen(), title: "Biblioteca de conhecimento", slug: ["conhecimento", "biblioteca"] };

    render(await ScreenTemplate({ screen: fallbackScreen }));

    expect(screen.getByText("Compact route: conhecimento/biblioteca · Biblioteca de conhecimento")).toBeTruthy();
    expect(getServerWorkspaceData).not.toHaveBeenCalled();
  });
});
