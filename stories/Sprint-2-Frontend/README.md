# Sprint 2 - Frontend completo e contratos de backend

## Objetivo

Implementar toda a experiência visual T01-T56 sobre mocks contratuais, responsiva e acessível. Cada jornada deve produzir documentação suficiente para o backend substituir MSW sem alterar componentes.

## Stories e cobertura

| Story | Telas | Dominio |
|---|---|---|
| [BH-S2-01](BH-S2-01-Design-System-Shell.md) | componentes transversais | design system e shell |
| [BH-S2-02](BH-S2-02-Acesso-Organizacoes.md) | T01-T09 | identidade e produtividade |
| [BH-S2-03](BH-S2-03-Salas-Mensagens.md) | T10-T13 | colaboracao |
| [BH-S2-04](BH-S2-04-Tarefas-Execucoes.md) | T14-T19 | operacao |
| [BH-S2-05](BH-S2-05-Aprovacoes-Automacao.md) | T20-T34 | governanca e automacao |
| [BH-S2-06](BH-S2-06-Conhecimento-Comercial.md) | T35-T45 | conhecimento, CRM e conteudo |
| [BH-S2-07](BH-S2-07-Analytics-Administracao.md) | T46-T56 | experimentos, analytics e admin |
| [BH-S2-08](BH-S2-08-E2E-Acessibilidade-Documentacao.md) | T01-T56 | verificacao e handoff |

## Estado automatizado da Sprint

- [x] As 56 telas existem e usam exclusivamente contratos/mocks de `BH-S1-04`.
- [x] Desktop e mobile cobrem loading, vazio, erro, offline e sem permissao.
- [x] Storybook/catalogo documenta componentes e estados.
- [x] `docs/frontend-backend/` descreve dados, comandos, eventos e erros por jornada.
- [x] E2E e acessibilidade passam nas jornadas criticas.
- [ ] Navegacao manual completa por teclado nos quatro viewports possui aceite humano registrado.

## Evidencias verificadas

- Gates: lint, typecheck, testes raiz, build e guards aprovados.
- Testes web: 446 aprovados no estado atual; contratos 1 e UI 3 aprovados.
- E2E mock: 34/34 em desktop/mobile com Axe. E2E real sem MSW: 20/20 em
  desktop/mobile com Axe.
- Fronteira de dados: transporte assincrono compativel com HTTP, contexto de
  tenant isolado por request e BFF tipado para 24 telas, cobertos por testes. O
  BFF despacha somente operacoes do OpenAPI canonico e nao depende de endpoint
  generico inexistente.
- Revisao independente final: veredito `PASS` para codigo, contratos, gates e acessibilidade automatizada; a validacao manual de teclado permanece aberta.

Na retomada de 2026-07-18, as 24 regras antes sinteticas receberam consultas,
mutacoes e estados alinhados aos contratos reais; mutacoes aparecem somente nas
telas com POST/PATCH canonico. Lint, typecheck, testes, build, fixture guard,
E2E desktop/mobile e Axe passaram. Esses resultados nao substituem o aceite
humano de navegacao completa por teclado e leitor de tela.

O catalogo interno `/catalogo` usa `StatePanel` para os seis estados em desktop/mobile e
documenta variantes e acessibilidade de Button, Dialog e StatePanel. As provas semanticas
estao em `transverse-states.test.tsx` e `ui-catalog.test.ts`; revisao independente: `PASS`.
