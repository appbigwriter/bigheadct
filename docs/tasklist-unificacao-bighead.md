# Tasklist única e objetiva para a unificação BigHead + Control Tower

Data de referência: 19 de julho de 2026

Objetivo: montar a nova pasta `BigHeadCT` como a base única e curada, contendo apenas códigos e decisões já definidos e aprovados, sem manter o Control Tower como projeto paralelo de frontend/backend.

## Regras de execução

- Não alterar o frontend nem o backend do Control Tower original.
- Tratar o Control Tower como módulo do BigHead.
- Cada item abaixo deve ser concluído antes de avançar para o próximo bloco.
- Nada entra na BigHeadCT sem aprovação explícita.

## 1. Definir a linha de corte da unificação

- [x] Confirmar qual é a fonte da verdade para cada domínio: BigHead, Control Tower ou Hermes.
- [x] Classificar tudo em três grupos: aprovado, revisar, descartar.
- [x] Congelar o que já funciona e não entra na nova base.
- [x] Registrar a regra de que Control Tower não terá novos ajustes de UI/API no projeto original.

## 2. Montar a estrutura da BigHeadCT

- [x] Criar a pasta-base do novo conjunto unificado.
- [x] Copiar apenas artefatos aprovados.
- [x] Separar por domínio, não por origem histórica.
- [x] Garantir que não existam duplicidades de telas, rotas ou contratos.
- [x] Manter documentação de origem apenas como referência, não como runtime.

## 3. Fechar a arquitetura de módulos

- [x] Definir BigHead como aplicação principal.
- [x] Inserir Control Tower como módulo interno do BigHead.
- [x] Manter Hermes como integração operacional e não como camada de UI.
- [x] Mapear dependências entre telas, backend, worker e integrações externas.
- [x] Eliminar qualquer ambiguidade de “quem manda em quê”.

## 4. Redesenhar as telas do BigHead com foco funcional

- [x] Revisar telas vagas e trocar por telas com propósito único.
- [x] Priorizar formulários e ações claras em vez de dashboards abstratos.
- [x] Reescrever títulos de telas para linguagem de tarefa.
- [x] Para cada tela, definir: objetivo, entrada, saída e próxima ação.
- [x] Reduzir painéis genéricos que misturam muitos estados sem decisão.
- [x] Criar versões novas para os módulos mais inconsistentes do BigHead.

## 5. Reorganizar os fluxos de trabalho

- [x] Desenhar fluxos curtos por intenção: criar, aprovar, executar, revisar, auditar.
- [x] Garantir que toda ação tenha ponto de entrada óbvio.
- [x] Encadear tarefa → aprovação → execução → auditoria sem ruptura.
- [x] Colocar indicações explícitas de quando o humano precisa intervir.
- [x] Remover passos implícitos que dependem de memória do usuário.

## 6. Normalizar a integração Hermes

- [x] Manter o adapter como único ponto de contato com Hermes.
- [x] Centralizar contrato de request/response.
- [x] Validar profile sync, executor e tratamento de erro.
- [x] Garantir que a UI não exponha detalhes excessivos da orquestração.
- [x] Separar o que é ação de negócio do que é operação técnica.

## 7. Organizar a auditoria do que já foi aprovado

- [x] Listar módulos que já podem ser considerados estáveis.
- [x] Marcar telas e rotas que viraram legado transitório.
- [x] Registrar dependências que não devem ser recriadas.
- [x] Congelar decisões de schema e contrato que já passaram por validação.

## 8. Validar a fluidez dos fluxos

- [x] Revisar cada fluxo com foco em tempo até a primeira ação útil.
- [x] Verificar se a tela responde “o que faço agora?” em menos de 10 segundos.
- [x] Testar se o caminho principal evita mudança de contexto desnecessária.
- [x] Checar se os estados vazios ajudam o usuário a avançar.
- [x] Checar se o vocabulário da interface é consistente.

## 9. Entregáveis finais

- [x] Documento de corte do que entra na BigHeadCT.
- [x] Mapa de módulos da nova base unificada.
- [x] Lista de telas reescritas com foco funcional.
- [x] Lista de fluxos priorizados para ajuste.
- [x] Lista de itens congelados do Control Tower.
- [x] Inventário de integrações Hermes mantidas.

## Ordem recomendada de execução

1. Congelar o escopo.
2. Definir a fonte da verdade.
3. Montar a BigHeadCT.
4. Fechar módulos.
5. Reescrever telas.
6. Ajustar fluxos.
7. Validar Hermes.
8. Fechar auditoria final.

## 10. Inclusao humana nas conversas

- [x] Definir pedido de acesso para sala privada quando o usuario nao for membro.
- [x] Definir convite por e-mail para moderadores e responsaveis pela sala.
- [x] Persistir pedidos em tabela propria com aprovacao e recusa.
- [x] Expor os fluxos no workspace com botoes objetivos e estados claros.

## Atualizacao desta rodada

- [x] Simplificacao das telas de automacao para prompts, workflows e biblioteca com CTA unico e listas em mini cards.
- [x] Inclusao de rota visual para novo lead e ajuste dos CTAs de projetos e times.
- [x] Implementacao da base de CRUD e contexto de projetos/times para a unificacao.
- [x] Compactacao das rotas de acesso, colaboracao, tarefas e governanca em superficies objetivas.
- [x] Onboarding resiliente com fallback de URL da API e tratamento explicito de sessao invalida.

## Atualizacao desta rodada

- [x] Politicas de governanca compactadas em simulador por risco, tipo de acao e segregacao.
- [x] Portal externo excluido da navegacao e da resolucao de rotas.
- [x] Skills, modelos, workflow editor, workflow versoes e playbooks simplificados.
- [x] Skill-teste excluida; o fluxo de simulacao ficou concentrado em skills.

## Atualizacao desta rodada

- [x] Conhecimento compactado em Ingestao e Memoria com foco objetivo.
- [x] Busca semantica excluida da resolucao de rotas e da navegacao visivel.

## Atualizacao desta rodada

- [x] Biblioteca de conhecimento compactada no mesmo padrao objetivo.

## Atualizacao desta rodada

- [x] Onboarding, automacao, administracao, comercial e aprendizado compactados no mesmo padrao objetivo.
