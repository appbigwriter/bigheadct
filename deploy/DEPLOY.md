# Guia Completo de Deploy — BigHead no Easypanel (VPS Própria)

Este documento descreve o procedimento passo a passo para realizar o deploy completo da plataforma **BigHead** em uma VPS própria utilizando o **Easypanel**.

---

## 📋 Mapeamento Completo de Domínios e Serviços

| Serviço | Subdomínio Público | Porta Interna / Protocolo | Descrição |
|---------|-------------------|---------------------------|-----------|
| **`web`** | `https://bighead.fbr.news` | 3000 (HTTP) | Frontend Next.js 15 |
| **`api`** | `https://bighead-api.fbr.news` | 8000 (HTTP) | Backend FastAPI (Python 3.14) |
| **`hermes`** | `https://hermes.fbr.news` | 9119 (HTTP) | Gateway LLM (Node.js) |
| **`rag`** | `https://rag.fbr.news` | 3001 (HTTP) | AnythingLLM (RAG / Conhecimento) |
| **`supabase`** | `https://supabase.fbr.news` | 8000 (HTTP/Kong) | Supabase Studio / Auth / Storage |
| **`db` / `bd`** | `db.bighead.fbr.news` / `bd.bighead.fbr.news` | 5432 (PostgreSQL) | Banco de Dados PostgreSQL (Direto/Pooler) |
| `worker` | *Interno* | — | Processador de filas ARQ (Python) |
| `redis` | *Interno* | 6379 | Broker de mensagens e Cache |
| `clamav` | *Interno* | 3310 | Antivírus / Scanner de Malware |

---

## 💻 1. Requisitos do Servidor (VPS)

- **Sistema Operacional:** Ubuntu 22.04 LTS ou Debian 12
- **Processador:** Mínimo 4 vCPUs (Recomendado 8 vCPUs)
- **Memória RAM:** Mínimo 16 GB (devido ao Supabase + PostgreSQL + ClamAV + AnythingLLM)
- **Armazenamento:** 60 GB SSD ou NVMe
- **Firewall (Portas abertas):** `80/tcp`, `443/tcp`, `5432/tcp` (PostgreSQL), `3000/tcp` (Easypanel Admin)

---

## 🌐 2. Configuração de DNS (Criar Registros A)

Crie os registros **A** no seu provedor de DNS (ex: Cloudflare / Registro.br) apontando para o IP da VPS:

```text
bighead.fbr.news.     IN  A  <IP_DA_SUA_VPS>
bighead-api.fbr.news. IN  A  <IP_DA_SUA_VPS>
hermes.fbr.news.      IN  A  <IP_DA_SUA_VPS>
rag.fbr.news.         IN  A  <IP_DA_SUA_VPS>
supabase.fbr.news.    IN  A  <IP_DA_SUA_VPS>
db.bighead.fbr.news.  IN  A  <IP_DA_SUA_VPS>
bd.bighead.fbr.news.  IN  A  <IP_DA_SUA_VPS>
```

---

## 🚀 3. Passo a Passo do Deploy

### Passo 1: Instalar o Easypanel na VPS

Acesse a VPS via SSH e execute:

```bash
curl -sSL https://get.easypanel.io | sh
```

Após a instalação, acesse no navegador: `http://<IP_DA_VPS>:3000` e crie a conta do administrador.

---

### Passo 2: Configurar o GitHub Container Registry (GHCR)

1. No GitHub, vá em **Settings > Developer Settings > Personal Access Tokens > Fine-grained tokens**.
2. Gere um novo token com as permissões:
   - `Read access to metadata`
   - `Read and Write access to packages`
3. No repositório do projeto no GitHub, vá em **Settings > Secrets and variables > Actions** e adicione:
   - `NEXT_PUBLIC_SUPABASE_URL`: `https://supabase.fbr.news`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: `<sua-chave-publica-do-supabase>`

---

### Passo 3: Subir as Imagens Docker (Primeira Execução)

1. No repositório do GitHub, vá em **Actions**.
2. Selecione o workflow **Build & Push Docker Images**.
3. Clique em **Run workflow** selecionando a branch `main`.
4. Aguarde o término do build (~5 minutos). As imagens serão publicadas em `ghcr.io/<seu-usuario>/bigheadct-*`.

---

### Passo 4: Subir a Stack do Supabase no Easypanel

1. No Easypanel, crie um novo projeto chamado **`supabase`**.
2. Escolha o template oficial do **Supabase** na galeria de templates do Easypanel.
3. Defina a URL pública da API/Studio como `supabase.fbr.news`.
4. Defina o host do banco de dados PostgreSQL como `db.bighead.fbr.news`.
5. Salve as chaves geradas (`ANON_KEY`, `SERVICE_ROLE_KEY` e a senha do `POSTGRES_PASSWORD`).

---

### Passo 5: Criar a Stack do BigHead no Easypanel

1. No Easypanel, crie um novo projeto chamado **`bighead`**.
2. Clique em **+ Service** > **App Stack**.
3. Na aba **Compose**, cole o conteúdo do arquivo [`easypanel.yml`](file:///f:/Projetos/BigHeadCT/easypanel.yml).
4. Na aba **Environment**, adicione as variáveis conforme a referência em [`deploy/easypanel-env.example`](file:///f:/Projetos/BigHeadCT/deploy/easypanel-env.example).

5. Defina os domínios para cada serviço no Easypanel:
   - **`web`**: `bighead.fbr.news` (Porta 3000)
   - **`api`**: `bighead-api.fbr.news` (Porta 8000)
   - **`hermes`**: `hermes.fbr.news` (Porta 9119)
   - **`rag`**: `rag.fbr.news` (Porta 3001)

6. Clique em **Deploy**.

---

### Passo 6: Executar as Migrações do Banco de Dados

Com a stack rodando e conectada ao Supabase self-hosted via `db.bighead.fbr.news`, aplique o schema SQL no banco:

```bash
# Na sua máquina local, aponte a URL direta do banco para a produção:
npx supabase db push --db-url "postgresql://postgres:<SENHA_POSTGRES>@db.bighead.fbr.news:5432/postgres"
```

---

## 🔍 4. Verificação de Saúde (Healthchecks)

Após a conclusão da implantação, valide os endpoints via cURL ou no navegador:

```bash
# Frontend Web
curl -I https://bighead.fbr.news

# API FastAPI
curl https://bighead-api.fbr.news/health/ready

# Gateway Hermes
curl https://hermes.fbr.news/health/ready

# AnythingLLM RAG
curl https://rag.fbr.news/api/ping

# Supabase Auth / Studio
curl https://supabase.fbr.news/auth/v1/health

# Conexão Banco PostgreSQL
NC -zv db.bighead.fbr.news 5432
```

---

## 🔄 5. Atualizações Automáticas (CI/CD)

Sempre que houver um `push` na branch `main`:
1. O GitHub Actions irá construir as novas imagens Docker.
2. O workflow irá enviar as imagens para o **GHCR**.
3. Se o webhook do Easypanel estiver configurado (`EASYPANEL_WEBHOOK_URL` e `EASYPANEL_WEBHOOK_TOKEN`), o Easypanel fará o deploy da nova versão sem downtime.
