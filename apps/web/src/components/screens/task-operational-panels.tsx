"use client";

import { useMemo, useState } from "react";

import { Button } from "@bigheadct/ui";

const LOG_PAGES = [
  ["run iniciou", "step coletou contexto"],
  ["step chamou provider", "run finalizou"]
];

const COST_PAGES = [
  ["OpenAI · R$ 1,20"],
  ["Storage · R$ 0,08"]
];

export function TaskOperationalPanels({ taskTitle }: { taskTitle: string }) {
  const [logPage, setLogPage] = useState(0);
  const [costPage, setCostPage] = useState(0);

  const summary = useMemo(
    () => ({
      logs: LOG_PAGES.length,
      costs: COST_PAGES.length
    }),
    []
  );

  return (
    <section aria-label="Detalhe operacional da tarefa">
      <div className="bh-state-panel" data-testid="task-detail-summary">
        <strong>{taskTitle}</strong>
        <p>
          Resumo, SLA e estado permanecem visiveis enquanto logs e custos avancam por pagina.
        </p>
      </div>

      <div className="bh-inline" aria-label="Resumo operacional da tarefa">
        <span className="bh-badge">
          <strong>{summary.logs}</strong> paginas de logs
        </span>
        <span className="bh-badge">
          <strong>{summary.costs}</strong> paginas de custos
        </span>
        <span className="bh-badge">
          <strong>{logPage + 1}</strong> log atual
        </span>
        <span className="bh-badge">
          <strong>{costPage + 1}</strong> custo atual
        </span>
      </div>

      <div className="bh-columns">
        <section aria-label="Logs paginados">
          <strong>Logs · pagina {logPage + 1}</strong>
          <ul>
            {LOG_PAGES[logPage]!.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <Button
            disabled={logPage === LOG_PAGES.length - 1}
            onClick={() => setLogPage((page) => Math.min(page + 1, LOG_PAGES.length - 1))}
            tone="secondary"
          >
            Proxima pagina de logs
          </Button>
        </section>

        <section aria-label="Custos paginados">
          <strong>Custos · pagina {costPage + 1}</strong>
          <ul>
            {COST_PAGES[costPage]!.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <Button
            disabled={costPage === COST_PAGES.length - 1}
            onClick={() => setCostPage((page) => Math.min(page + 1, COST_PAGES.length - 1))}
            tone="secondary"
          >
            Proxima pagina de custos
          </Button>
        </section>
      </div>
    </section>
  );
}
