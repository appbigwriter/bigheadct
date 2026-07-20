import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type * as NextNavigation from "next/navigation";
import { http, HttpResponse } from "msw";

import { server } from "@/mocks/server";

vi.mock("@/app/actions/critical-mutations", () => ({
  createMessage: vi.fn().mockResolvedValue({ ok: true, status: 201, message: "Mensagem entregue e reconciliada." }),
  createRoom: vi.fn().mockResolvedValue({ ok: true, status: 201, message: "Sala criada." }),
  createTask: vi.fn().mockResolvedValue({ ok: true, status: 201, message: "Tarefa criada." }),
  decideApproval: vi.fn().mockResolvedValue({ ok: true, status: 200, message: "Decisao registrada." }),
  initiateArtifact: vi.fn().mockResolvedValue({ ok: true, status: 201, message: "Upload iniciado.", data: { artifactId: "a", uploadUrl: "https://storage.test", requiredHeaders: {} } }),
  replaceTaskDependencies: vi.fn().mockResolvedValue({ ok: true, status: 200, message: "Dependencias atualizadas." }),
  confirmArtifact: vi.fn().mockResolvedValue({ ok: true, status: 202, message: "Upload confirmado." }),
  createContentAsset: vi.fn().mockResolvedValue({ ok: true, status: 201, message: "Conteudo criado." }),
  scheduleExperiment: vi.fn().mockResolvedValue({ ok: true, status: 200, message: "Janela configurada." }),
  switchTenant: vi.fn().mockResolvedValue({ ok: true, status: 200, message: "Tenant alterado." }),
  decidePortal: vi.fn().mockResolvedValue({ ok: true, status: 200, message: "Resposta registrada." })
}));
vi.mock("@/lib/transition-task-client", () => ({
  transitionTask: vi.fn().mockResolvedValue({ ok: false, status: 409, message: "O registro mudou." })
}));
vi.mock("next/navigation", async () => ({
  ...(await vi.importActual<typeof NextNavigation>("next/navigation")),
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn(), replace: vi.fn(), prefetch: vi.fn(), back: vi.fn(), forward: vi.fn() })
}));

import { createMessage, decideApproval, replaceTaskDependencies, scheduleExperiment } from "@/app/actions/critical-mutations";
import { transitionTask } from "@/lib/transition-task-client";

import { getDefaultScreen, screens } from "@/lib/screen-catalog";
import { getWorkspaceSnapshot } from "@/lib/mock-workspace";
import { ScreenExperience } from "./screen-experience";
import { screenRuleDefinitions, type ScreenRule } from "./screen-rule-experiences";

const playbookCodes = [
  "T02", "T03", "T09", "T12", "T18", "T19", "T22",
  "T25", "T26", "T34", "T35", "T36", "T37",
  "T39", "T41", "T43", "T46", "T49", "T50", "T51", "T52", "T53"
] as const;

const compactCollectionButtons: Record<string, string> = {
  T30: "Incluir prompt",
  T31: "Incluir workflow",
  T57: "Incluir novo lead",
  T58: "Adicionar projeto",
  T59: "Criar projeto",
  T60: "Adicionar time",
  T61: "Criar time",
  T62: "Incluir rag"
};

const compactCollectionTitles: Record<string, string> = {
  T30: "Prompts",
  T31: "Workflows",
  T57: "Novo lead",
  T58: "Projetos",
  T59: "Novo projeto",
  T60: "Times",
  T61: "Novo time",
  T62: "RAGs"
};

describe("ScreenExperience", () => {
  it("renders the default workspace screen with interactive controls", () => {
    render(<ScreenExperience screen={getDefaultScreen()} snapshot={getWorkspaceSnapshot()} />);
    expect(screen.getByRole("heading", { name: /Home operacional/i })).toBeTruthy();
    expect(screen.getAllByRole("button", { name: /SLA em risco/i }).length).toBeGreaterThan(0);
  });

  beforeEach(() => {
    server.use(
      http.get("*/api/prompts", () =>
        HttpResponse.json({
          items: [
            {
              id: "prompt-1",
              agent_id: "agent-1",
              agent_name: "Lead qualification",
              version: 3,
              system_prompt: "Qualifique o lead e destaque risco e proxima acao.",
              published_at: "2026-07-20T10:00:00Z",
              created_at: "2026-07-20T09:00:00Z"
            }
          ]
        })
      ),
      http.get("*/api/agents/agent-1", () =>
        HttpResponse.json({
          agent: {
            id: "agent-1",
            name: "Lead qualification",
            slug: "lead-qualification",
            description: "Prompt operacional",
            riskLevel: "medium",
            isEnabled: true
          },
          versions: [
            {
              id: "version-3",
              version: 3,
              modelId: "model-1",
              systemPrompt: "Qualifique o lead e destaque risco e proxima acao.",
              configuration: {},
              skillIds: ["skill-1"],
              publishedAt: "2026-07-20T10:00:00Z",
              createdAt: "2026-07-20T09:00:00Z"
            }
          ]
        })
      )
    );
  });

  it.each(screens)("covers $code acceptance rules, states and contracts", (definition) => {
    render(<ScreenExperience screen={definition} snapshot={getWorkspaceSnapshot()} />);

    const expectedTitle = compactCollectionTitles[definition.code] ?? definition.title;
    expect(screen.getAllByText(expectedTitle).length).toBeGreaterThan(0);
    const expectedButton = compactCollectionButtons[definition.code];
    if (expectedButton) {
      expect(screen.getByRole("link", { name: "Ver componentes" })).toHaveAttribute("href", "/catalogo");
      expect(screen.getByRole("button", { name: expectedButton })).toBeTruthy();
      return;
    }
    for (const endpoint of definition.endpoints) {
      expect(screen.getAllByText(endpoint).length).toBeGreaterThan(0);
    }
    for (const state of definition.states) {
      expect(screen.getAllByRole("button", { name: state }).length).toBeGreaterThan(0);
    }

    const rule = screen.getByRole("checkbox", { name: definition.checklist[0]! });
    fireEvent.click(rule);
    expect(rule).toHaveProperty("checked", true);
  });

  it("renders the functional prompt workspace with create and edit actions", async () => {
    render(<ScreenExperience screen={screens.find((item) => item.code === "T30")!} snapshot={getWorkspaceSnapshot()} />);

    expect(await screen.findByRole("heading", { name: "Prompts" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Incluir prompt" })).toBeTruthy();
    expect(await screen.findByRole("button", { name: /Lead qualification/ })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Incluir prompt" }));
    expect(await screen.findByRole("button", { name: "Criar prompt" })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: /Lead qualification/ }));
    expect(await screen.findByRole("button", { name: "Salvar nova versão" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Arquivar agente" })).toBeTruthy();
  });

  it.each(playbookCodes)("renders and locally validates the screen-specific critical rule for %s", (code) => {
    const definition = screens.find((item) => item.code === code)!;
    const rule = screenRuleDefinitions[code] as ScreenRule;
    render(<ScreenExperience screen={definition} snapshot={getWorkspaceSnapshot()} />);

    const experience = screen.getByTestId(`screen-rule-${code}`);
    expect(within(experience).queryByText(/blocked|ready|applied/i)).toBeNull();
    expect(within(experience).getByLabelText(rule.label)).toHaveValue(rule.inputType === "number" ? Number(rule.invalidValue) : rule.invalidValue);
    fireEvent.click(within(experience).getByRole("button", { name: rule.action }));
    expect(within(experience).getByRole("status")).toHaveTextContent(rule.validate(rule.invalidValue)!);
  });

  it("binds governed search and analytics drilldown to the active workspace snapshot", () => {
    const snapshot = { ...getWorkspaceSnapshot(), currentOrganizationId: "tenant-live-42", analyticsDrilldowns: [{ card: "total" as const, dimension: "in_progress", value: 1, recordIds: ["44444444-4444-4444-8444-444444444444"], recordCount: 1, recordsTruncated: false, recordsEndpoint: "/v1/analytics/summary/records" as const, periodFrom: "2026-06-01T00:00:00Z", periodTo: "2026-07-01T00:00:00Z" }] };

    render(<ScreenExperience screen={screens.find((item) => item.code === "T48")!} snapshot={snapshot} />);
    fireEvent.click(screen.getByRole("button", { name: "Status in_progress (1)" }));
    expect(screen.getByText("44444444-4444-4444-8444-444444444444")).toBeTruthy();
  });

  it("excludes inaccessible private rooms from the room list and counters", () => {
    render(<ScreenExperience screen={screens.find((item) => item.code === "T10")!} snapshot={getWorkspaceSnapshot()} />);
    const rooms = screen.getByLabelText("Salas visiveis");
    expect(within(rooms).getByText("2 salas · 3 nao lidas")).toBeTruthy();
    expect(within(rooms).getByText("Diretoria")).toBeTruthy();
    expect(within(rooms).queryByText("M&A confidencial")).toBeNull();
  });

  it("appends the next task cursor without replacing the first page", () => {
    render(<ScreenExperience screen={screens.find((item) => item.code === "T14")!} snapshot={getWorkspaceSnapshot()} />);
    const table = document.querySelector(".bh-data-table")!;
    expect(table.querySelectorAll(".bh-data-row")).toHaveLength(2);
    fireEvent.click(screen.getByRole("button", { name: /Carregar proxima pagina/ }));
    expect(table.querySelectorAll(".bh-data-row")).toHaveLength(getWorkspaceSnapshot().taskMoments.length);
  });



  it("renders a backend dependency cycle as a dependencies field error", async () => {
    vi.mocked(replaceTaskDependencies).mockResolvedValueOnce({
      ok: false,
      status: 409,
      message: "Corrija as dependencias destacadas antes de salvar.",
      data: { fieldErrors: { dependencies: "Dependencia circular detectada." } }
    });
    render(<ScreenExperience screen={screens.find((item) => item.code === "T15")!} snapshot={getWorkspaceSnapshot()} />);
    fireEvent.change(screen.getByLabelText("Dependencias da tarefa existente"), { target: { value: "fixture-dependent-task" } });
    fireEvent.click(screen.getByRole("button", { name: "Salvar dependencias" }));
    await waitFor(() => expect(replaceTaskDependencies).toHaveBeenCalled());
    expect((await screen.findByRole("alert")).textContent).toContain("Dependencia circular detectada.");
  });

  it("submits an approval decision through the server mutation boundary", async () => {
    render(<ScreenExperience screen={screens.find((item) => item.code === "T21")!} snapshot={getWorkspaceSnapshot()} />);
    fireEvent.click(screen.getByRole("button", { name: "Registrar decisao" }));
    await waitFor(() => expect(decideApproval).toHaveBeenCalledOnce());
    await waitFor(() => expect(screen.getByTestId("mutation-feedback").textContent).toContain("Decisao registrada"));
  });

  it("configures and starts a draft experiment through the server mutation boundary", async () => {
    render(<ScreenExperience screen={screens.find((item) => item.code === "T47")!} snapshot={getWorkspaceSnapshot()} />);
    fireEvent.click(screen.getByRole("button", { name: "Configurar e iniciar" }));
    await waitFor(() => expect(scheduleExperiment).toHaveBeenCalledOnce());
    await waitFor(() => expect(screen.getByTestId("mutation-feedback").textContent).toContain("Janela configurada"));
  });

  it("requires preview before confirming a duplicate merge", () => {
    render(<ScreenExperience screen={screens.find((item) => item.code === "T40")!} snapshot={getWorkspaceSnapshot()} />);
    const confirm = screen.getByRole("button", { name: "Confirmar merge" });
    expect(confirm).toHaveProperty("disabled", true);
    fireEvent.click(screen.getByRole("button", { name: "Gerar preview" }));
    expect(confirm).toHaveProperty("disabled", false);
    fireEvent.click(confirm);
    expect(screen.getByRole("status").textContent).toMatch(/origem preservados/);
  });

  it("preserves dashboard filters in every drill-down link", () => {
    render(<ScreenExperience screen={screens.find((item) => item.code === "T06")!} snapshot={getWorkspaceSnapshot()} />);
    fireEvent.change(screen.getByLabelText("Periodo do dashboard"), { target: { value: "30d" } });
    fireEvent.change(screen.getByLabelText("Risco do dashboard"), { target: { value: "high" } });
    expect(screen.getByTestId("home-drilldown-0").getAttribute("href")).toContain("period=30d&risk=high");
  });

  it("moves keyboard focus from the command palette search to the first shortcut", () => {
    render(<ScreenExperience screen={screens.find((item) => item.code === "T07")!} snapshot={getWorkspaceSnapshot()} />);
    const search = screen.getByLabelText("Pesquisar no command palette");
    fireEvent.keyDown(search, { key: "ArrowDown" });
    expect(document.activeElement?.getAttribute("data-command-index")).toBe("0");
    expect(document.activeElement?.getAttribute("aria-keyshortcuts")).toBe("Alt+1");
    fireEvent.keyDown(window, { key: "1", altKey: true });
    expect(screen.getByText("Ultimo evento").parentElement?.textContent).toContain("Atalho executado:");
  });

  it("allows changing one owner and then disables removal of the last owner", () => {
    render(<ScreenExperience screen={screens.find((item) => item.code === "T54")!} snapshot={getWorkspaceSnapshot()} />);
    fireEvent.click(screen.getByRole("button", { name: "Rebaixar ou remover Camila Moura" }));
    const lastOwner = screen.getByRole("button", { name: "Rebaixar ou remover Rafael Costa" });
    expect(lastOwner).toHaveProperty("disabled", true);
    expect(within(lastOwner).getByText("Ultimo owner protegido")).toBeTruthy();
  });

  it("reveals a webhook secret once and cannot reveal it again", () => {
    window.sessionStorage.clear();
    const definition = screens.find((item) => item.code === "T55")!;
    const view = render(<ScreenExperience screen={definition} snapshot={getWorkspaceSnapshot()} />);
    fireEvent.click(screen.getByRole("button", { name: "Revelar secret" }));
    expect(screen.getByTestId("webhook-secret-value").textContent).toContain("whsec_");
    fireEvent.click(screen.getByRole("button", { name: "Ocultar definitivamente" }));
    expect(screen.getByTestId("webhook-secret-value").textContent).not.toContain("whsec_");
    expect(screen.getByRole("button", { name: "Secret ja consumido" })).toHaveProperty("disabled", true);
    view.unmount();
    render(<ScreenExperience screen={definition} snapshot={getWorkspaceSnapshot()} />);
    expect(screen.getByTestId("webhook-secret-value").textContent).not.toContain("whsec_");
    expect(screen.getByRole("button", { name: "Secret ja consumido" })).toHaveProperty("disabled", true);
  });

  it("shows LGPD scope, impact and status while audit events remain read-only", () => {
    render(<ScreenExperience screen={screens.find((item) => item.code === "T56")!} snapshot={getWorkspaceSnapshot()} />);
    const jobs = screen.getByLabelText("Jobs LGPD");
    expect(within(jobs).getAllByText(/^Escopo:/)).toHaveLength(2);
    expect(within(jobs).getAllByText(/^Impacto:/)).toHaveLength(2);
    expect(within(jobs).getAllByText(/^Status:/)).toHaveLength(2);
    const audit = screen.getByLabelText("Eventos de auditoria append-only");
    expect(within(audit).queryByRole("button")).toBeNull();
    expect(within(audit).queryByText(/editar|excluir/i)).toBeTruthy();
  });



  it("hides tenant data, counts and actions when permission is denied", () => {
    const definition = screens.find((item) => item.states.includes("permission_denied"))!;
    render(<ScreenExperience screen={definition} snapshot={getWorkspaceSnapshot()} />);
    fireEvent.click(screen.getAllByRole("button", { name: "permission_denied" })[0]!);
    const boundary = screen.getByTestId("permission-boundary");
    expect(within(boundary).getByText("Acesso nao autorizado")).toBeTruthy();
    expect(within(boundary).queryByText(definition.metrics[0]!.value)).toBeNull();
    expect(within(boundary).queryByText(definition.endpoints[0]!)).toBeNull();
    expect(within(boundary).queryByRole("button")).toBeNull();
  });
});
