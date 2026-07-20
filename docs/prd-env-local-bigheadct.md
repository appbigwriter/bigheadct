# PRD final — `env.local` do BigHeadCT

Data de referência: 20 de julho de 2026

Versão: 1.0

Este documento fecha a especificação do `env.local` do BigHeadCT para a versão 2.5 do produto.

Ele consolida o que hoje existe em:

- `F:\Projetos\BigHead\.env`
- `F:\Projetos\GestaoDB\.env.local`

O objetivo é criar um único contrato de ambiente, com rastreabilidade total de origem, consumo e regeneração.

## 1. Objetivo do PRD

O `env.local` do BigHeadCT deve permitir:

- subir a stack local completa;
- executar o frontend, API e worker do BigHead;
- manter a integração Hermes funcional;
- preservar a operação do Control Tower como módulo interno;
- deixar explícito o que é variável do BigHead, o que é do Control Tower e o que é infraestrutura derivada;
- documentar como recuperar cada segredo ou URL caso a configuração precise ser regenerada.

## 2. Princípios obrigatórios

1. Um único arquivo de ambiente por ambiente.
2. Toda variável deve ter consumidor real ou justificativa explícita.
3. Cliente e servidor nunca compartilham o mesmo escopo por acidente.
4. Segredo, URL pública e valor derivado precisam ser distinguidos claramente.
5. O Control Tower não será mantido como projeto paralelo de frontend/backend.
6. Hermes é integração de execução, não camada de apresentação.
7. Tudo que puder ser regenerado deve ter fonte de regeneração documentada.

## 3. Escopo funcional

O `env.local` cobre os seguintes blocos:

- Supabase local e remoto;
- autenticação e redirecionamento;
- banco de dados e pooler;
- storage e URLs assinadas;
- observabilidade e logs;
- APIs e workers do BigHead;
- integração Hermes;
- integração Control Tower;
- derivações por `compose`, scripts e build.

## 4. Contrato final de variáveis

### 4.1. Variáveis obrigatórias do BigHeadCT

Essas variáveis devem existir no `env.local` do BigHeadCT, com valor válido por ambiente:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_URL`
- `SUPABASE_PUBLIC_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY`
- `DATABASE_URL`
- `DIRECT_DATABASE_URL`
- `REDIS_PASSWORD`
- `PORTAL_TOKEN_PEPPER`
- `SIGNED_URL_TTL_SECONDS`
- `ENCRYPTION_KEY`
- `ACME_EMAIL`
- `SUPABASE_AUTH_SITE_URL`
- `SUPABASE_AUTH_REDIRECT_URLS`
- `SUPABASE_AUTH_SMTP_CONFIGURED`
- `HERMES_API_URL`
- `HERMES_API_KEY`
- `HERMES_PROFILES_DIR`
- `HERMES_DEFAULT_MODEL`
- `HERMES_TIMEOUT_SECONDS`
- `LLM_PROVIDER_DEFAULT`
- `LLM_MODEL_DEFAULT`
- `CONTROL_TOWER_ADMIN_SECRET`

### 4.2. Variáveis de infraestrutura Supabase

Essas devem existir e ser documentadas, mesmo que algumas sejam derivadas pela própria stack:

- `JWT_SECRET`
- `ANON_KEY`
- `SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SECRET_KEY_BASE`
- `JWT_KEYS`
- `JWT_JWKS`
- `DASHBOARD_USERNAME`
- `DASHBOARD_PASSWORD`
- `LOGFLARE_PUBLIC_ACCESS_TOKEN`
- `LOGFLARE_PRIVATE_ACCESS_TOKEN`
- `S3_PROTOCOL_ACCESS_KEY_ID`
- `S3_PROTOCOL_ACCESS_KEY_SECRET`
- `SUPABASE_PUBLIC_URL`
- `API_EXTERNAL_URL`
- `POSTGRES_HOST`
- `POSTGRES_DB`
- `POSTGRES_PORT`
- `POOLER_PROXY_PORT_TRANSACTION`
- `POOLER_DEFAULT_POOL_SIZE`
- `POOLER_MAX_CLIENT_CONN`
- `POOLER_TENANT_ID`
- `POOLER_DB_POOL_SIZE`
- `STUDIO_DEFAULT_ORGANIZATION`
- `STUDIO_DEFAULT_PROJECT`
- `OPENAI_API_KEY`
- `SITE_URL`
- `ADDITIONAL_REDIRECT_URLS`
- `JWT_EXPIRY`
- `DISABLE_SIGNUP`
- `MAILER_URLPATHS_CONFIRMATION`
- `MAILER_URLPATHS_INVITE`
- `MAILER_URLPATHS_RECOVERY`
- `MAILER_URLPATHS_EMAIL_CHANGE`
- `ENABLE_EMAIL_SIGNUP`
- `ENABLE_EMAIL_AUTOCONFIRM`
- `ENABLE_PHONE_SIGNUP`
- `ENABLE_PHONE_AUTOCONFIRM`
- `GLOBAL_S3_BUCKET`
- `REGION`
- `MINIO_ROOT_USER`
- `MINIO_ROOT_PASSWORD`
- `STORAGE_TENANT_ID`
- `FUNCTIONS_VERIFY_JWT`
- `PGRST_DB_SCHEMAS`
- `PGRST_DB_MAX_ROWS`
- `PGRST_DB_EXTRA_SEARCH_PATH`
- `DOCKER_SOCKET_LOCATION`
- `GOOGLE_PROJECT_ID`
- `GOOGLE_PROJECT_NUMBER`
- `KONG_HTTP_PORT`
- `KONG_HTTPS_PORT`
- `ANON_KEY_ASYMMETRIC`
- `SERVICE_ROLE_KEY_ASYMMETRIC`
- `IMGPROXY_AUTO_WEBP`

### 4.3. Variáveis exclusivas do Control Tower

Essas variáveis não devem ser tratadas como padrão do BigHead; são específicas do módulo Control Tower ou da compatibilidade legada de infraestrutura:

- `CONTROL_TOWER_ADMIN_SECRET`
- `PROXY_DOMAIN`
- `CERTBOT_EMAIL`
- `SUPABASE_SERVICE_ROLE_KEY`

## 5. Origem oficial de cada grupo

### 5.1. Origem BigHead

O BigHead é a origem oficial para:

- `HERMES_*`
- `LLM_PROVIDER_DEFAULT`
- `LLM_MODEL_DEFAULT`
- `REDIS_PASSWORD`
- `PORTAL_TOKEN_PEPPER`
- `SIGNED_URL_TTL_SECONDS`
- `ENCRYPTION_KEY`
- `ACME_EMAIL`

### 5.2. Origem Control Tower

O Control Tower é a origem oficial para:

- `CONTROL_TOWER_ADMIN_SECRET`
- `PROXY_DOMAIN`
- `CERTBOT_EMAIL`

### 5.3. Origem Supabase / infraestrutura

Supabase e a stack local/produção são a origem oficial para:

- variáveis de auth;
- URLs públicas e server-side;
- keys e secrets do projeto;
- banco e pooler;
- storage;
- logs;
- gateway;
- imagem;
- observabilidade.

## 6. Mapa de consumo por domínio

### 6.1. Frontend do BigHead

Consumidores reais:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_AUTH_SITE_URL`
- `SUPABASE_AUTH_REDIRECT_URLS`

Uso observado:

- `apps/web/src/lib/supabase/config.ts`
- `apps/web/src/lib/supabase/auth-config.ts`
- `compose.production.yml`
- `deploy/Dockerfile.web`
- `scripts/start-local-stack.ps1`
- scripts de E2E e integração

### 6.2. API do BigHead

Consumidores reais:

- `SUPABASE_URL`
- `SUPABASE_PUBLIC_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY`
- `DATABASE_URL`
- `DIRECT_DATABASE_URL`
- `PORTAL_TOKEN_PEPPER`
- `SIGNED_URL_TTL_SECONDS`
- `SUPABASE_AUTH_SITE_URL`
- `SUPABASE_AUTH_REDIRECT_URLS`
- `SUPABASE_AUTH_SMTP_CONFIGURED`
- `HERMES_API_URL`
- `HERMES_API_KEY`
- `HERMES_PROFILES_DIR`
- `HERMES_DEFAULT_MODEL`
- `HERMES_TIMEOUT_SECONDS`
- `LLM_PROVIDER_DEFAULT`
- `LLM_MODEL_DEFAULT`
- `OPENAI_API_KEY`

### 6.3. Worker do BigHead

Consumidores reais:

- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY`
- `DATABASE_URL`
- `DIRECT_DATABASE_URL`
- `REDIS_PASSWORD`
- `HERMES_API_URL`
- `HERMES_API_KEY`
- `HERMES_PROFILES_DIR`
- `HERMES_DEFAULT_MODEL`
- `HERMES_TIMEOUT_SECONDS`
- `LLM_PROVIDER_DEFAULT`
- `LLM_MODEL_DEFAULT`
- `OPENAI_API_KEY`

### 6.4. Control Tower / GestaoDB

Consumidores reais:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `CONTROL_TOWER_ADMIN_SECRET`

## 7. Regras de nome e escopo

### 7.1. Variáveis públicas do frontend

Devem usar o prefixo `NEXT_PUBLIC_` quando consumidas no browser.

Obrigatórias:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

### 7.2. Variáveis privadas do backend

Não devem usar `NEXT_PUBLIC_`.

Obrigatórias:

- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`
- `DIRECT_DATABASE_URL`
- `HERMES_API_URL`
- `HERMES_API_KEY`
- `HERMES_PROFILES_DIR`
- `CONTROL_TOWER_ADMIN_SECRET`

### 7.3. Variáveis derivadas

Podem ser produzidas por compose, scripts ou runtime:

- `REDIS_URL`
- `DATABASE_SERVICE_URL`
- `SUPABASE_PUBLIC_URL`
- `SUPABASE_AUTH_SITE_URL`
- `SUPABASE_AUTH_REDIRECT_URLS`
- `SUPABASE_AUTH_SMTP_CONFIGURED`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 8. Regeneração e reobtenção

### 8.1. Regeneráveis

Podem ser recriadas se o projeto for reemitido ou a infraestrutura for recriada:

- `JWT_SECRET`
- `ANON_KEY`
- `SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SECRET_KEY_BASE`
- `JWT_KEYS`
- `JWT_JWKS`
- `S3_PROTOCOL_ACCESS_KEY_ID`
- `S3_PROTOCOL_ACCESS_KEY_SECRET`
- `LOGFLARE_PUBLIC_ACCESS_TOKEN`
- `LOGFLARE_PRIVATE_ACCESS_TOKEN`
- `REDIS_PASSWORD`
- `ENCRYPTION_KEY`
- `PORTAL_TOKEN_PEPPER`

### 8.2. Como obter novamente

- Supabase Admin / EasyPanel: chaves, URLs, secrets e tokens da infraestrutura.
- Control Tower/GestaoDB: `CONTROL_TOWER_ADMIN_SECRET` e `SUPABASE_SERVICE_ROLE_KEY` quando o m�dulo legado ou a infraestrutura de compatibilidade exigirem.
- BigHead API/worker: `HERMES_*`, `LLM_*`, `REDIS_PASSWORD`, `PORTAL_TOKEN_PEPPER`.
- `compose` e scripts: `REDIS_URL`, `DATABASE_SERVICE_URL`, `SUPABASE_PUBLIC_URL`, `SUPABASE_AUTH_SITE_URL`, `SUPABASE_AUTH_REDIRECT_URLS`, `SUPABASE_AUTH_SMTP_CONFIGURED`.

### 8.3. Se as APIs forem regeneradas

Se houver regeneração de API, a regra é:

- atualizar contratos antes de atualizar variáveis dependentes;
- documentar a nova origem da URL ou chave;
- validar frontend, API e worker em conjunto;
- registrar quais variáveis deixam de ser válidas;
- não manter fallback implícito em produção.

## 9. Fonte de verdade por ambiente

### 9.1. Desenvolvimento local

O arquivo `env.local` do BigHeadCT é a fonte de verdade local.

### 9.2. Produção

A fonte de verdade é o secret manager / painel de deploy / provider da infraestrutura, com o `env.local` servindo como espelho documental e operacional quando aplicável.

## 10. Regras de segurança

1. Nunca expor `SUPABASE_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `CONTROL_TOWER_ADMIN_SECRET` ou qualquer chave de servidor no browser.
2. Nunca copiar segredos sem anotar a origem e o escopo.
3. Nunca tratar valor derivado como segredo mestre.
4. Nunca deixar uma variável crítica sem dono.
5. Se uma variável puder ser obtida de novo, o PRD deve dizer onde e como.

## 11. Critérios de aceite

O PRD só é considerado fechado quando:

- a lista final de variáveis estiver estabelecida;
- a origem de cada variável estiver documentada;
- o consumo por frontend, backend, worker e Control Tower estiver mapeado;
- as variáveis regeneráveis estiverem identificadas;
- as variáveis derivadas estiverem separadas;
- o caminho de reobtenção estiver explícito;
- não houver ambiguidade entre BigHead e Control Tower.

## 12. Decisão final

O BigHeadCT adota este contrato como base da versão 2.5.

Qualquer nova variável só entra por adição formal ao PRD.
Qualquer variável que sair deve ser removida do contrato e dos consumidores.

Este é o documento de referência para implementação.

