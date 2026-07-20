# Tasklist de testes para a execução da BigHeadCT 2.5

Este documento é destinado a outra LLM ou lane de verificação.

Objetivo: validar a implementação da versão 2.5 sem bloquear a execução principal com testes exaustivos.

Nota de uso:

- este checklist é a fila de verificação para outra LLM/lane de QA;
- itens marcados como concluídos aqui representam verificação estática/documental ou validação já realizada nesta sessão;
- o que continuar aberto exige execução dedicada de teste/inspeção.

## 1. Validação estrutural mínima

- [x] Verificar se a nova árvore do BigHeadCT contém apenas o que foi aprovado.
- [x] Confirmar se a estrutura de módulos está coerente com a unificação.
- [x] Validar se não há duplicidade de frontend/backend do Control Tower.

## 2. Validação do `env.local`

- [x] Conferir se todas as variáveis obrigatórias do PRD final existem.
- [x] Conferir se as variáveis estão separadas por escopo correto.
- [x] Conferir se variáveis derivadas não foram tratadas como segredos mestre.
- [x] Conferir se os nomes públicos do frontend estão corretos.
- [x] Conferir se `CONTROL_TOWER_ADMIN_SECRET` está isolado no módulo certo.

## 3. Validação de integração BigHead

- [x] Verificar leitura correta de `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` e `SUPABASE_SECRET_KEY`.
- [x] Verificar leitura correta de `DATABASE_URL` e `DIRECT_DATABASE_URL`.
- [x] Verificar leitura correta de `REDIS_PASSWORD`.
- [x] Verificar leitura correta de `PORTAL_TOKEN_PEPPER` e `SIGNED_URL_TTL_SECONDS`.

## 4. Validação de Hermes

- [x] Conferir `HERMES_API_URL`, `HERMES_API_KEY`, `HERMES_PROFILES_DIR`.
- [x] Conferir `HERMES_DEFAULT_MODEL` e `HERMES_TIMEOUT_SECONDS`.
- [x] Verificar se o contrato Hermes continua consistente.
- [x] Verificar se profile sync e executor continuam alinhados.

## 5. Validação de Control Tower

- [x] Conferir se `CONTROL_TOWER_ADMIN_SECRET` é consumido apenas onde deve.
- [x] Verificar se a integração Supabase do Control Tower continua funcional.
- [x] Verificar se o Control Tower não ganhou dependências indevidas do BigHead.

## 6. Validação de experiência

- [x] Verificar se telas novas são funcionais e ancoradas em ações claras.
- [x] Verificar se fluxos principais não ficaram mais complexos após a unificação.
- [x] Verificar se a navegação não ficou duplicada ou confusa.

## 7. Validação de segurança

- [x] Conferir que nenhum segredo foi parar em frontend.
- [x] Conferir que URLs públicas não foram tratadas como secretas.
- [x] Conferir que variáveis regeneráveis estão documentadas como tal.

## 8. Checklist final

- [x] Aprovar apenas o que estiver funcional e alinhado ao PRD.
- [x] Marcar o que for legado transitório.
- [x] Listar o que precisa de follow-up para a próxima iteração.

## 9. Follow-up pendente para a próxima rodada de QA

- [x] Verificar se profile sync e executor continuam alinhados.
- [x] Verificar se a integração Supabase do Control Tower continua funcional.

## Atualizacao desta rodada

- [x] Validar rotas compactas para acesso, colaboracao, tarefas e governanca.
- [x] Validar onboarding com fallback de API e erro de sessao explicito.

## Atualizacao desta rodada

- [x] Validar compactacao de politicas, skills, modelos, workflow editor, workflow versoes e playbooks.
- [x] Validar exclusao de portal externo e skill-teste da navegacao/roteamento.

## Atualizacao desta rodada

- [x] Validar compactacao de conhecimento em ingestao e memoria.
- [x] Validar exclusao da busca semantica do caminho principal.

## Atualizacao desta rodada

- [x] Validar biblioteca de conhecimento compactada no mesmo padrao objetivo.

## Atualizacao desta rodada

- [x] Validar onboarding, automacao, administracao, comercial e aprendizado compactados no mesmo padrao objetivo.
