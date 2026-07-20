# BigHeadCT — Tasklist mestre

Data de referência: 19 de julho de 2026

Este arquivo é a visão geral da execução da BigHeadCT 2.5.

Ele serve para você acompanhar rapidamente:

- o que já foi fechado;
- o que está em andamento;
- o que ainda depende de implementação;
- onde consultar o detalhe de cada frente.

## Status atual

### Concluído

- [x] Telas compactas de automacao para prompts, workflows e biblioteca
- [x] CTAs de criacao para novo lead, projetos e times alinhados

- [x] Auditoria crítica do BigHead
- [x] Tasklist principal de unificação
- [x] PRD final do `env.local` do BigHeadCT
- [x] Tasklist específica do `env.local`
- [x] Tasklist de testes para outra LLM
- [x] Preparação inicial da árvore da `BigHeadCT`
- [x] Espelhamento do Control Tower como módulo interno
- [x] Normalização dos nomes de workspace para `@bigheadct/*`
- [x] Ajuste inicial de scripts e Dockerfiles de build
- [x] Consolidação da visão geral em `tasklist.md`
- [x] Renomeação do pacote do Control Tower espelhado para `@bigheadct/control-tower`
- [x] Normalização da stack de produção para identidade `bigheadct`
- [x] Renomeação do pacote do worker para `@bigheadct/worker`
- [x] Correção dos nomes corrompidos em scripts e compose de integração
- [x] Consolidação dos arquivos de ambiente para os nomes reais usados pelo código
- [x] Correção do guia legado de configuração para não contradizer o contrato atual
- [x] Mapa inicial dos módulos da BigHeadCT consolidado
- [x] Alinhamento do contrato Supabase no web com `SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_URL`
- [x] Redesign funcional da tela inicial do workspace BigHead
- [x] Redesign funcional da tela de tarefas com resumo, criação e detalhe mais claros
- [x] Redesign funcional da tela de aprovações com fila, impacto e decisão explícitos
- [x] Redesign funcional da tela comercial com leads, detalhe e pipeline mais claros
- [x] Redesign funcional da tela de colaboração com salas, conversa e contexto integrados
- [x] Redesign funcional da busca global com resumo e navegação mais claros
- [x] Redesign funcional da tela de automação com catálogo, detalhe e criação mais claros
- [x] Redesign funcional da caixa de notificações com resumo e acesso direto
- [x] Redesign funcional da tela de administração/domínio com resumo operacional e contexto explícito
- [x] Redesign funcional da experiência de tela com resumo operacional dos playbooks
- [x] Redesign funcional do painel operacional de tarefas com paginação e resumo explícito
- [x] Redesign funcional da experiência de regras com contrato e entrada explícitos
- [x] Redesign funcional do portal externo com escopo e decisão mais claros
- [x] Redesign funcional do catálogo transversal de estados com introdução clara
- [x] Redesign funcional da linha do tempo virtual com resumo de volume e janela visível
- [x] Correção do resumo da fila de tarefas para refletir status reais do contrato
- [x] Redesign funcional do catálogo de componentes com resumo de cobertura e navegação clara

### Em andamento

- [x] Implementação funcional da BigHeadCT 2.5
- [x] Unificação das bases de configuração e contratos

## Frentes detalhadas

### 1. Unificação do projeto

Detalhe em:

- [Tasklist principal de unificação](docs/tasklist-unificacao-bighead.md)

Objetivo:

- consolidar BigHead + Control Tower na nova BigHeadCT;
- manter o Control Tower como módulo, sem projeto paralelo de frontend/backend.

### 2. Ambiente e variáveis

Detalhe em:

- [PRD final do env.local](docs/prd-env-local-bigheadct.md)
- [Tasklist do env.local](docs/tasklist-env-local-bigheadct.md)

Objetivo:

- fechar o contrato de ambiente da nova versão;
- deixar claro o que é BigHead, o que é Control Tower e o que é infraestrutura derivada.

### 3. Validação

Detalhe em:

- [Tasklist de testes](docs/tasklist-testes-bigheadct-25.md)

Objetivo:

- permitir que outra LLM valide a implementação sem travar a execução principal.

## Regra operacional

Sempre que uma task for fechada, este arquivo deve ser atualizado antes de avançar para a próxima.

Isso vale especialmente para:

- estrutura de repositório;
- pacotes e nomes de workspace;
- scripts de build;
- integração Control Tower;
- configuração do ambiente;
- implementação funcional.

## Próximo foco

1. Fechar qualquer referência antiga que ainda esteja quebrando a coerência estrutural.
2. Começar a implementação funcional da versão 2.5.
3. Manter este mestre atualizado a cada task concluída.

## Atualizacao desta rodada

- [x] Rotas objetivas para acesso, colaboracao, tarefas e governanca.
- [x] Onboarding com fallback de API e erro de sessao mais claro.

## Atualizacao desta rodada

- [x] Politicas de governanca compactadas.
- [x] Portal externo excluido.
- [x] Skills, modelos, workflow editor, workflow versoes e playbooks simplificados.
- [x] Skill-teste excluida.

## Atualizacao desta rodada

- [x] Conhecimento compactado em ingestao e memoria.
- [x] Busca semantica excluida do caminho principal.

## Atualizacao desta rodada

- [x] Biblioteca de conhecimento compactada no mesmo padrao objetivo.

## Atualizacao desta rodada

- [x] Onboarding, automacao, administracao, comercial e aprendizado compactados no mesmo padrao objetivo.
