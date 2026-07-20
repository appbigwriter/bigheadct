# Mapa de módulos da BigHeadCT

Data de referência: 20 de julho de 2026

Este documento consolida a fronteira atual da BigHeadCT após a unificação inicial.
Ele descreve o que já faz parte da base única, o que continua como módulo interno
e o que deve permanecer apenas como referência histórica.

## Princípio de organização

- BigHead é a aplicação principal.
- Control Tower entra como módulo interno, sem evoluir como frontend/backend paralelo.
- Hermes é integração operacional, não camada de interface.
- Contratos e pacotes compartilhados vivem em `packages/`.

## Módulos aprovados na base única

### `apps/web`

Frontend principal da BigHeadCT.

Responsabilidade:

- apresentar os fluxos de trabalho do produto;
- orquestrar entradas do usuário;
- consumir a API principal;
- expor as telas funcionais da operação.

Observação:

- é o lugar certo para redesenhar telas vagas em telas com propósito único;
- usa `NEXT_PUBLIC_*` para dependências públicas do browser.

### `apps/api`

API principal da BigHeadCT.

Responsabilidade:

- expor o contrato HTTP do produto;
- proteger regras de negócio;
- integrar Supabase, storage, auditoria, regras de domínio e serviços externos;
- servir como ponto de coordenação para o web app e para o worker.

### `apps/worker`

Worker de processamento assíncrono da BigHeadCT.

Responsabilidade:

- executar filas e jobs;
- lidar com runs, ingestão, webhooks, privacidade, artefatos e integrações de LLM;
- manter a execução técnica fora da interface.

### `apps/control-tower`

Control Tower embutido como módulo interno.

Responsabilidade:

- manter o catálogo e a governança já aprovados;
- funcionar como módulo do ecossistema BigHeadCT;
- não voltar a se comportar como produto paralelo com backend/frontend próprios.

### `packages/contracts`

Contrato compartilhado entre as camadas.

Responsabilidade:

- gerar e distribuir contratos OpenAPI e helpers de cliente;
- manter a fronteira entre API e frontend explícita;
- evitar deriva entre interface e backend.

### `packages/ui`

Biblioteca visual compartilhada.

Responsabilidade:

- conter componentes reutilizáveis;
- padronizar campos, botões, painéis e estados;
- evitar duplicação de primitives entre telas.

### `packages/config`

Configuração compartilhada do workspace.

Responsabilidade:

- centralizar base de lint, prettier e TypeScript;
- reduzir divergência entre apps e pacotes.

### `packages/pycore`

Base Python compartilhada para API e worker.

Responsabilidade:

- agrupar integrações Python comuns;
- manter modelos e utilitários reutilizáveis;
- reduzir duplicação entre `apps/api` e `apps/worker`.

## Integrações operacionais

### Hermes

Hermes deve ser tratado como integração operacional para execução e suporte a agentes.

O contrato fica concentrado em:

- `HERMES_API_URL`
- `HERMES_API_KEY`
- `HERMES_PROFILES_DIR`
- `HERMES_DEFAULT_MODEL`
- `HERMES_TIMEOUT_SECONDS`

### AnythingLLM

AnythingLLM continua como backend RAG/knowledge.

O contrato fica concentrado em:

- `ANYTHING_LLM_API_URL`
- `ANYTHING_LLM_API_KEY`
- `ANYTHING_LLM_DEFAULT_WORKSPACE`
- `ANYTHING_LLM_TIMEOUT_SECONDS`
- `KNOWLEDGE_BACKEND`
- `KNOWLEDGE_BACKEND_REQUIRED`

### Supabase

Supabase continua como base de auth, banco, storage e contratos de segurança.

O contrato principal usa:

- `SUPABASE_URL`
- `SUPABASE_PUBLIC_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY`
- `DATABASE_URL`
- `DIRECT_DATABASE_URL`
- `REDIS_URL`
- `REDIS_PASSWORD`

O fluxo de autentica��o tamb�m usa:

- `SUPABASE_AUTH_SITE_URL`
- `SUPABASE_AUTH_REDIRECT_URLS`
- `SUPABASE_AUTH_SMTP_CONFIGURED`

Observa��o:

- `SUPABASE_SERVICE_ROLE_KEY` permanece como nome de compatibilidade para a camada Control Tower / provider quando exigido por infraestrutura, mas o runtime atual do BigHeadCT usa `SUPABASE_SECRET_KEY` como segredo de servidor.

## Fronteiras que não devem voltar a aparecer

- Control Tower como frontend/backend paralelo.
- Prefixos antigos de workspace fora de `@bigheadct/*`.
- Variáveis de browser sem `NEXT_PUBLIC_`.
- Contratos duplicados entre web, api e worker sem pacote compartilhado.
- Documentos legados tratando o BigHead antigo como base runtime.

## Resultado esperado da unificação

Depois dessa primeira corte de arquitetura, a base única deve ficar assim:

- uma aplicação principal;
- um módulo interno de Control Tower;
- um worker assíncrono;
- contratos e componentes compartilhados;
- integrações externas concentradas em pontos únicos.



