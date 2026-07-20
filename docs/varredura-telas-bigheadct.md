# Varredura objetiva das telas do BigHeadCT

Objetivo: deixar claro, tela por tela, qual problema cada tela resolve, quais acoes primarias ela precisa expor e quais informacoes nao podem faltar.

Esta varredura usa o catalogo atual de telas do monorepo e o estado real da UI existente. A intencao aqui nao e diagnosticar; e definir o corte funcional minimo e objetivo para cada tela.

## Acesso

- T01 Login - objetivo: autenticar sem friccao; botoes: Entrar, Criar conta, Enviar link de acesso, Enviar recuperacao, Entrar com conta local; infos: email, senha, estado de erro sem enumeracao, caminho de recuperacao.
- T02 Recuperacao e redefinicao - objetivo: recuperar acesso com seguranca; botoes: Enviar link, Validar token, Redefinir senha; infos: expiracao do token, regra de senha forte, aviso de revogacao de sessoes.
- T03 Aceite de convite - objetivo: aceitar ou recusar convite de organizacao; botoes: Aceitar convite, Recusar convite, Reenviar convite; infos: email alvo, prazo do convite, papel oferecido, idempotencia.
- T04 Onboarding - objetivo: criar a primeira organizacao e concluir entrada; botoes: Criar organizacao e entrar, Voltar, Avancar passo; infos: nome, organizacao, slug, timezone, idioma, metas, politica inicial.
- T05 Seletor de organizacao - objetivo: trocar de tenant sem vazar contexto; botoes: Selecionar organizacao, Sair da organizacao atual, Atualizar lista; infos: memberships, permissao, tenant ativo, limpeza de cache e sessoes.

## Operacao

- T06 Home operacional - objetivo: dar a visao de controle do dia; botoes: Nova tarefa, Abrir detalhe, Filtrar periodo; infos: SLA, aprovacoes, falhas, custos, proximas acoes e frescor dos dados.
- T07 Busca global e command palette - objetivo: encontrar qualquer recurso rapido; botoes: Buscar, Tentar novamente, Abrir resultado; infos: tipo do item, permissao, contexto, atalhos de teclado.
- T08 Notificacoes - objetivo: concentrar eventos acionaveis; botoes: Todas, Nao lidas, Marcar em lote, Tentar novamente; infos: origem, prioridade, relacao com tarefa, sala ou aprovacao, status de leitura.
- T09 Perfil e sessoes - objetivo: administrar preferencias pessoais e dispositivos; botoes: Salvar preferencias, Encerrar sessao, Encerrar dispositivo; infos: idioma, timezone, acessibilidade, sessoes ativas, tema.
- T10 Lista de salas - objetivo: organizar a entrada colaborativa; botoes: Ver salas, Criar sala, Favoritar, Arquivar; infos: privacidade, contadores de nao lidas, recentes, fixadas e arquivadas.
- T11 Sala conversacional - objetivo: conversar e transformar conversa em trabalho; botoes: Enviar, Criar tarefa, Voltar para salas, Anexar arquivo; infos: mensagens, autores, threads, mencoes, custo e fonte do agente, status de upload.
- T12 Informacoes e membros da sala - objetivo: controlar descricao, privacidade e membros; botoes: Salvar, Convidar membro, Ativar/Inativar, Voltar; infos: papel, moderadores, status da sala, ultima alteracao.
- T13 Arquivos da sala - objetivo: gerenciar anexos com seguranca; botoes: Enviar arquivo, Reprocessar, Preview, Baixar; infos: quarentena, metadados, URL assinada, tipo e tamanho.

## Tarefas

- T14 Inbox de tarefas - objetivo: priorizar e filtrar a fila; botoes: Criar tarefa, Aplicar filtros, Abrir fila, Recarregar; infos: status, owner, SLA, dependencias, views salvas e pagina por cursor.
- T15 Criacao de tarefa - objetivo: abrir uma tarefa com escopo claro; botoes: Criar tarefa, Voltar para a fila; infos: objetivo, risco, agente, workflow, dependencias, SLA e motivo do roteamento.
- T16 Detalhe da tarefa - objetivo: acompanhar uma tarefa do inicio ao fim; botoes: Confirmar alteracao, Abrir conversa de origem, Recarregar tarefa; infos: resumo, timeline, artefatos, aprovacoes, execucoes, auditoria.
- T17 Monitor de execucao - objetivo: observar a execucao sem esconder falhas; botoes: Recarregar, Cancelar, Retry; infos: passos, tentativas, heartbeat, latencia, tokens, custo e logs mascarados.
- T18 Fila de falhas - objetivo: agrupar problemas para tratamento rapido; botoes: Abrir incidente, Reexecutar, Filtrar por causa; infos: erro, modelo, skill, permissao, timeout, impacto.
- T19 Calendario e SLA - objetivo: ver o trabalho no tempo; botoes: Reagendar, Filtrar por responsavel, Abrir item; infos: vencidas, em risco, responsavel, workflow, data limite.

## Governanca

- T20 Inbox de aprovacoes - objetivo: decidir rapido o que tem risco; botoes: Ver pendentes, Ver vencidas, Abrir fila, Tentar novamente; infos: prazo, risco, cliente, solicitante, preview.
- T21 Detalhe da aprovacao - objetivo: tomar decisao com contexto; botoes: Aprovar, Reprovar, Comentarios, Abrir tarefa relacionada; infos: versoes, checklist, comparacao, justificativa, decisao imutavel.
- T22 Scorecards Sentinel QA - objetivo: medir qualidade por entrega e risco; botoes: Filtrar canal, Abrir scorecard, Exportar; infos: criterio, nota, tendencia, politica aplicada.
- T23 Politicas de aprovacao - objetivo: editar regras sem ambiguidade; botoes: Salvar politica, Simular, Reverter; infos: tipo de acao, risco, segregacao, efeito esperado.
- T24 Portal externo - objetivo: oferecer decisao externa por token; botoes: Aprovar, Reprovar, Comentar, Ver contexto; infos: token opaco, escopo, expiracao, branding isolado.

## Automacao

- T26 Configuracao do agente - objetivo: editar o comportamento do agente; botoes: Salvar nova versao, Voltar, Testar; infos: prompt, limites, modelos permitidos, skills, score.
- T27 Catalogo de skills - objetivo: expor capacidades reutilizaveis; botoes: Abrir skill, Criar skill, Filtrar risco; infos: schema, timeout, retries, necessidade de aprovacao.
- T28 Configuracao e teste da skill - objetivo: editar e validar a skill; botoes: Executar teste, Salvar contrato, Recarregar; infos: contrato, mascaramento, timeout, schema, saida esperada.
- T29 Provedores e modelos - objetivo: administrar fornecedores e modelos; botoes: Adicionar provider, Salvar, Definir fallback; infos: pricing, vigencia, latencia, janela de uso.
- T30 Biblioteca e versoes de prompts - objetivo: controlar prompt como ativo versionado; botoes: Salvar, Comparar diff, Reverter; infos: owner, changelog, status, versao publicada.
- T31 Lista de workflows - objetivo: catalogar fluxos executaveis; botoes: Criar workflow, Filtrar, Abrir fluxo; infos: dominio, status, risco, owner, ultima revisao.
- T32 Editor visual de workflow - objetivo: desenhar o fluxo com clareza; botoes: Adicionar node, Conectar, Publicar, Validar grafo; infos: passos, decisao, espera, revisao, aprovacao.
- T33 Historico de versoes - objetivo: auditar mudancas e permitir rollback; botoes: Ver diff, Restaurar versao, Voltar; infos: versao, autor, data, compatibilidade com execucoes antigas.
- T34 Biblioteca de playbooks - objetivo: iniciar workflows com contexto pronto; botoes: Instanciar playbook, Editar template, Filtrar; infos: parametros obrigatorios, owner, workflow de origem.

## Conhecimento

- T35 Biblioteca de conhecimento - objetivo: organizar documentos e ingestao; botoes: Upload, Abrir documento, Reprocessar; infos: status, classificacao, owner, ultima revisao, tenant.
- T36 Documento e ingestao - objetivo: acompanhar parse e chunking; botoes: Enviar documento, Reprocessar, Ver erro; infos: chunks, falhas, estado do job, origem do arquivo.
- T37 Memoria operacional - objetivo: registrar fatos, inferencias e decisoes; botoes: Criar memoria, Contestar, Aprovar; infos: tipo, fonte, validade, escopo e contestacao.
- T38 Busca semantica e debug RAG - objetivo: provar a recuperacao do conhecimento; botoes: Buscar, Limpar filtro, Abrir fonte; infos: score, fonte, confidencialidade, tenant, contexto recuperado.

## Comercial

- T39 Contas e contatos - objetivo: manter base comercial limpa; botoes: Importar, Mesclar, Criar contato, Abrir conta; infos: consentimento, origem, deduplicacao, relacao entre conta e contato.
- T40 Leads - objetivo: priorizar oportunidades iniciais; botoes: Abrir lead, Filtrar etapa, Criar follow-up; infos: sinais, score ICP, owner, proxima acao, origem.
- T41 Detalhe do lead - objetivo: transformar lead em decisao pratica; botoes: Registrar atividade, Criar tarefa, Avancar etapa; infos: timeline, sinais, ICP, contexto, origem.
- T42 Pipeline e oportunidades - objetivo: gerir funil e forecast; botoes: Avancar etapa, Registrar perda, Registrar ganho, Abrir oportunidade; infos: forecast, obrigatorios por etapa, valor, owner.
- T43 Campanhas - objetivo: coordenar campanhas por meta e canal; botoes: Criar campanha, Editar objetivo, Publicar; infos: publico, status, atribuicao futura, canal.
- T44 Estudio de conteudo - objetivo: produzir briefing e variantes; botoes: Criar briefing, Salvar variante, Enviar para aprovacao; infos: ativos, metadados editoriais, aprovacoes, historico.
- T45 Calendario editorial e publicacoes - objetivo: agendar e acompanhar publicacoes; botoes: Agendar, Reagendar, Reprocessar falha; infos: data, canal, payload, erro do provider.

## Aprendizado

- T46 Lista de experimentos - objetivo: enxergar experimentos em andamento e encerrados; botoes: Criar experimento, Abrir detalhe, Filtrar; infos: hipotese, status, metrica, owner.
- T47 Configuracao e resultado do experimento - objetivo: ajustar variaveis e ler resultado; botoes: Iniciar, Encerrar, Ver resultado; infos: variantes, janela, stop rule, amostra, conclusao.
- T48 Dashboard executivo - objetivo: resumir operacao, receita e qualidade; botoes: Mudar periodo, Abrir drilldown, Exportar; infos: KPI, periodo, timezone, fonte.
- T49 Operacoes e SLA - objetivo: acompanhar throughput e atrasos; botoes: Filtrar equipe, Abrir detalhe, Exportar; infos: backlog, SLA, falhas, comparativo temporal.
- T50 Performance de agentes e skills - objetivo: analisar desempenho tecnico; botoes: Filtrar provider, Abrir agente, Exportar; infos: latencia, sucesso, custo, falha, degradacao.
- T51 Custos, budgets e quotas - objetivo: controlar consumo e limite; botoes: Ajustar budget, Ver quota, Exportar; infos: consumo por tenant, equipe, agente e campanha, alerta de excesso.
- T52 Funil e atribuicao - objetivo: ligar campanha, conteudo, lead e receita; botoes: Filtrar periodo, Abrir origem, Exportar; infos: conversao, atribuicao declarada, fonte do KPI.

## Administracao

- T53 Gestao de organizacoes e branding - objetivo: administrar o catalogo de organizacoes do tenant, a identidade visual e os defaults operacionais; botoes: Salvar organizacao, Atualizar branding, Definir dominio, Abrir catalogo; infos: nome, logo, dominio, timezone, defaults, owner, confianca, versao, metricas.
- T54 Membros, convites e papeis - objetivo: gerir acesso e evitar travar a org; botoes: Enviar convite, Trocar papel, Ativar/Inativar; infos: ultimo owner, status, convite pendente, papel.
- T55 Integracoes e webhooks - objetivo: operar integracoes sem expor segredo; botoes: Adicionar integracao, Revelar secret uma vez, Testar delivery; infos: deliveries, retries, segredo, status.
- T56 Privacidade, retencao e auditoria - objetivo: atender compliance e rastreabilidade; botoes: Exportar, Solicitar exclusao, Aplicar legal hold; infos: escopo LGPD, auditoria append-only, status dos jobs.

## Control Tower no estado atual

- O Control Tower ainda existe como app separado em `apps/control-tower`.
- Ele nao entrou como tela dentro do shell principal do BigHeadCT.
- Se a meta agora e tratar o Control Tower como modulo da nova base, o proximo passo e escolher onde ele aparece na navegacao principal e quais telas viram entradas oficiais do produto.

## Proxima acao recomendada

Se voce quiser, eu transformo esta varredura em uma tasklist de implementacao, ja ordenada por prioridade de entrega, para irmos tela por tela sem dispersao.
