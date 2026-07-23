##########################################
### Syncing with origin/main
### Thu, 23 Jul 2026 15:14:30 GMT
##########################################

Commit: fix(deploy): use /health/live for api and hermes healthchecks in easypanel.yml 
 Image sistemas_bigheadct-web Building 
 Image sistemas_bigheadct-api Building 
 Image sistemas_bigheadct-worker Building 
 Image sistemas_bigheadct-hermes Building 
#1 [internal] load local bake definitions
#1 reading from stdin 2.04kB done
#1 DONE 0.0s

#2 [hermes internal] load build definition from Dockerfile.hermes
#2 transferring dockerfile:
#2 transferring dockerfile: 597B 0.0s done
#2 DONE 0.2s

#3 [web internal] load build definition from Dockerfile.web
#3 transferring dockerfile: 2.45kB 0.0s done
#3 DONE 0.1s

#4 [worker internal] load build definition from Dockerfile.worker
#4 transferring dockerfile: 1.22kB 0.0s done
#4 DONE 0.2s

#5 [api internal] load build definition from Dockerfile.api
#5 transferring dockerfile: 1.40kB 0.0s done
#5 DONE 0.2s

#6 [api] resolve image config for docker-image://docker.io/docker/dockerfile:1.7
#6 DONE 1.6s

#7 [worker] docker-image://docker.io/docker/dockerfile:1.7@sha256:a57df69d0ea827fb7266491f2813635de6f17269be881f696fbfdf2d83dda33e
#7 resolve docker.io/docker/dockerfile:1.7@sha256:a57df69d0ea827fb7266491f2813635de6f17269be881f696fbfdf2d83dda33e 0.0s done
#7 sha256:96918c57e42509b97f10c074d80672ecdbd3bb7dcd38c1bd95960cf291207416 0B / 11.98MB 0.2s
#7 sha256:96918c57e42509b97f10c074d80672ecdbd3bb7dcd38c1bd95960cf291207416 8.39MB / 11.98MB 0.3s
#7 sha256:96918c57e42509b97f10c074d80672ecdbd3bb7dcd38c1bd95960cf291207416 11.98MB / 11.98MB 0.4s done
#7 extracting sha256:96918c57e42509b97f10c074d80672ecdbd3bb7dcd38c1bd95960cf291207416
#7 extracting sha256:96918c57e42509b97f10c074d80672ecdbd3bb7dcd38c1bd95960cf291207416 0.2s done
#7 extracting sha256:96918c57e42509b97f10c074d80672ecdbd3bb7dcd38c1bd95960cf291207416 0.2s done
#7 DONE 0.7s

#8 [hermes internal] load build definition from Dockerfile.hermes
#8 transferring dockerfile: 597B done
#8 DONE 0.1s

#9 [worker internal] load build definition from Dockerfile.worker
#9 transferring dockerfile: 1.22kB done
#9 DONE 0.1s

#10 [web internal] load build definition from Dockerfile.web
#10 transferring dockerfile: 2.45kB done
#10 DONE 0.1s

#11 [api internal] load build definition from Dockerfile.api
#11 transferring dockerfile: 1.40kB done
#11 DONE 0.1s

#12 [web internal] load metadata for docker.io/library/node:24.11.1-bookworm-slim
#12 ...

#13 [api internal] load metadata for ghcr.io/astral-sh/uv:0.11.15
#13 DONE 1.2s

#12 [hermes internal] load metadata for docker.io/library/node:24.11.1-bookworm-slim
#12 DONE 1.4s

#14 [api internal] load metadata for docker.io/library/python:3.14.0-slim-bookworm
#14 DONE 1.4s

#15 [hermes internal] load .dockerignore
#15 transferring context: 373B done
#15 DONE 0.1s

#16 [api internal] load .dockerignore
#16 transferring context: 373B done
#16 DONE 0.1s

#17 [web internal] load .dockerignore
#17 transferring context: 373B done
#17 DONE 0.1s

#18 [worker internal] load .dockerignore
#18 transferring context: 373B done
#18 DONE 0.1s

#19 [hermes internal] load build context
#19 transferring context: 11.74kB done
#19 DONE 0.1s

#20 [api runtime-base 1/1] FROM docker.io/library/python:3.14.0-slim-bookworm@sha256:d13fa0424035d290decef3d575cea23d1b7d5952cdf429df8f5542c71e961576
#20 resolve docker.io/library/python:3.14.0-slim-bookworm@sha256:d13fa0424035d290decef3d575cea23d1b7d5952cdf429df8f5542c71e961576 0.0s done
#20 ...

#21 [worker internal] load build context
#21 transferring context: 335.94kB 0.0s done
#21 DONE 0.1s

#22 [api] FROM ghcr.io/astral-sh/uv:0.11.15@sha256:e590846f4776907b254ac0f44b5b380347af5d90d668138ca7938d1b0c2f98d3
#22 resolve ghcr.io/astral-sh/uv:0.11.15@sha256:e590846f4776907b254ac0f44b5b380347af5d90d668138ca7938d1b0c2f98d3 0.0s done
#22 DONE 0.3s

#23 [web 1/4] FROM docker.io/library/node:24.11.1-bookworm-slim@sha256:48abc13a19400ca3985071e287bd405a1d99306770eb81d61202fb6b65cf0b57
#23 resolve docker.io/library/node:24.11.1-bookworm-slim@sha256:48abc13a19400ca3985071e287bd405a1d99306770eb81d61202fb6b65cf0b57 0.1s done
#23 ...

#24 [api internal] load build context
#24 transferring context: 711.89kB 0.2s done
#24 DONE 0.5s

#22 [api] FROM ghcr.io/astral-sh/uv:0.11.15@sha256:e590846f4776907b254ac0f44b5b380347af5d90d668138ca7938d1b0c2f98d3
#22 sha256:edf16e7a8ef4fafc6ea9c9cff19db5558f8dad3b64f9ad7540a11699fc7e6a60 98B / 98B 0.3s done
#22 sha256:51e5b22c7c9f50cb9b87616ce109058a097bf732e479d7cd03f1968e4e75b9ee 0B / 24.90MB 0.2s
#22 ...

#20 [worker runtime-base 1/1] FROM docker.io/library/python:3.14.0-slim-bookworm@sha256:d13fa0424035d290decef3d575cea23d1b7d5952cdf429df8f5542c71e961576
#20 DONE 0.7s

#23 [hermes 1/4] FROM docker.io/library/node:24.11.1-bookworm-slim@sha256:48abc13a19400ca3985071e287bd405a1d99306770eb81d61202fb6b65cf0b57
#23 DONE 0.8s

#22 [api] FROM ghcr.io/astral-sh/uv:0.11.15@sha256:e590846f4776907b254ac0f44b5b380347af5d90d668138ca7938d1b0c2f98d3
#22 sha256:edf16e7a8ef4fafc6ea9c9cff19db5558f8dad3b64f9ad7540a11699fc7e6a60 98B / 98B 0.3s done
#22 ...

#25 [web internal] load build context
#25 transferring context: 3.69MB 0.7s done
#25 DONE 0.9s

#26 [hermes 2/4] WORKDIR /app
#26 DONE 0.3s

#22 [api] FROM ghcr.io/astral-sh/uv:0.11.15@sha256:e590846f4776907b254ac0f44b5b380347af5d90d668138ca7938d1b0c2f98d3
#22 sha256:51e5b22c7c9f50cb9b87616ce109058a097bf732e479d7cd03f1968e4e75b9ee 3.33MB / 24.90MB 0.8s
#22 sha256:51e5b22c7c9f50cb9b87616ce109058a097bf732e479d7cd03f1968e4e75b9ee 9.69MB / 24.90MB 0.9s
#22 sha256:51e5b22c7c9f50cb9b87616ce109058a097bf732e479d7cd03f1968e4e75b9ee 12.59MB / 24.90MB 1.1s
#22 sha256:51e5b22c7c9f50cb9b87616ce109058a097bf732e479d7cd03f1968e4e75b9ee 15.73MB / 24.90MB 1.2s
#22 sha256:51e5b22c7c9f50cb9b87616ce109058a097bf732e479d7cd03f1968e4e75b9ee 17.83MB / 24.90MB 1.4s
#22 sha256:51e5b22c7c9f50cb9b87616ce109058a097bf732e479d7cd03f1968e4e75b9ee 19.68MB / 24.90MB 1.7s
#22 sha256:51e5b22c7c9f50cb9b87616ce109058a097bf732e479d7cd03f1968e4e75b9ee 22.38MB / 24.90MB 1.8s
#22 sha256:51e5b22c7c9f50cb9b87616ce109058a097bf732e479d7cd03f1968e4e75b9ee 24.90MB / 24.90MB 1.9s done
#22 extracting sha256:51e5b22c7c9f50cb9b87616ce109058a097bf732e479d7cd03f1968e4e75b9ee
#22 ...

#27 [hermes 3/4] RUN groupadd --gid 10001 bighead     && useradd --uid 10001 --gid bighead --create-home --home-dir /home/bighead bighead
#27 DONE 2.5s

#28 [web production 2/8] RUN groupadd --gid 10001 bighead     && useradd --uid 10001 --gid bighead --create-home --home-dir /home/bighead bighead
#28 DONE 2.8s

#29 [worker production 1/3] RUN groupadd --gid 10001 bighead     && useradd --uid 10001 --gid bighead --create-home --home-dir /home/bighead bighead
#29 DONE 2.8s

#22 [api] FROM ghcr.io/astral-sh/uv:0.11.15@sha256:e590846f4776907b254ac0f44b5b380347af5d90d668138ca7938d1b0c2f98d3
#22 extracting sha256:51e5b22c7c9f50cb9b87616ce109058a097bf732e479d7cd03f1968e4e75b9ee 1.2s done
#22 extracting sha256:edf16e7a8ef4fafc6ea9c9cff19db5558f8dad3b64f9ad7540a11699fc7e6a60 0.1s done
#22 extracting sha256:edf16e7a8ef4fafc6ea9c9cff19db5558f8dad3b64f9ad7540a11699fc7e6a60 0.1s done
#22 DONE 3.7s

#30 [web production 3/8] WORKDIR /app/apps/web
#30 DONE 0.3s

#31 [worker production 2/3] WORKDIR /app
#31 DONE 0.3s

#32 [hermes 4/4] COPY apps/hermes/server.mjs /app/server.mjs
#32 DONE 0.3s

#33 [hermes] exporting to image
#33 exporting layers
#33 exporting layers 0.3s done
#33 exporting manifest sha256:a43e49804bb8f0da7c14b08e929b081ac3b6411f653da7fb3540c6022c9afe4e 0.0s done
#33 exporting config sha256:e04ea69963600311c3ea54c56d35d2f43f05bb7533d4397ddfd6fb44c0f9d94b 0.0s done
#33 exporting attestation manifest sha256:7fbf82624480979c66e62d1c66ffbebeae40d3a6a4044e400229cb0650ec54a3 0.0s done
#33 exporting manifest list sha256:9a3c946a377a54802c9b108941017a55b4cec076fb17e4601f068ccbe30b8f0b
#33 exporting manifest list sha256:9a3c946a377a54802c9b108941017a55b4cec076fb17e4601f068ccbe30b8f0b 0.0s done
#33 naming to docker.io/library/sistemas_bigheadct-hermes:latest done
#33 unpacking to docker.io/library/sistemas_bigheadct-hermes:latest 0.1s done
#33 DONE 0.7s

#34 [worker builder 1/9] COPY --from=ghcr.io/astral-sh/uv:0.11.15 /uv /uvx /bin/
#34 DONE 0.7s

#35 [worker builder 2/9] WORKDIR /app
#35 DONE 0.1s

#36 [api builder 3/9] COPY pyproject.toml uv.lock ./
#36 DONE 0.1s

#37 [hermes] resolving provenance for metadata file
#37 DONE 0.0s

#38 [worker builder 4/9] COPY apps/api/pyproject.toml apps/api/pyproject.toml
#38 DONE 0.1s

#39 [worker builder 5/9] COPY apps/worker/pyproject.toml apps/worker/pyproject.toml
#39 DONE 0.1s

#40 [worker builder 6/9] COPY packages/pycore/pyproject.toml packages/pycore/pyproject.toml
#40 DONE 0.1s

#41 [api builder 4/9] COPY apps/api/pyproject.toml apps/api/pyproject.toml
#41 CACHED

#42 [api builder 5/9] COPY apps/worker/pyproject.toml apps/worker/pyproject.toml
#42 CACHED

#43 [api builder 3/9] COPY pyproject.toml uv.lock ./
#43 CACHED

#44 [api builder 6/9] COPY packages/pycore/pyproject.toml packages/pycore/pyproject.toml
#44 CACHED

#45 [api builder 7/9] COPY apps/api/src apps/api/src
#45 DONE 0.1s

#46 [worker builder 7/9] COPY apps/worker/src apps/worker/src
#46 DONE 0.1s

#47 [api builder 8/9] COPY packages/pycore/src packages/pycore/src
#47 DONE 0.1s

#48 [worker builder 8/9] COPY packages/pycore/src packages/pycore/src
#48 DONE 0.1s

#49 [worker builder 9/9] RUN --mount=type=cache,target=/root/.cache/uv     uv sync --frozen --no-dev --no-editable --package bigheadct-worker
#49 ...

#50 [web base 2/3] RUN corepack enable && corepack prepare pnpm@10.26.2 --activate
#50 2.562 Preparing pnpm@10.26.2 for immediate activation...
#50 DONE 5.8s

#51 [web base 3/3] WORKDIR /app
#51 DONE 0.2s

#49 [worker builder 9/9] RUN --mount=type=cache,target=/root/.cache/uv     uv sync --frozen --no-dev --no-editable --package bigheadct-worker
#49 1.503 Using CPython 3.14.0 interpreter at: /usr/local/bin/python3
#49 1.503 Creating virtual environment at: .venv
#49 1.544    #49 ...

#52 [web dependencies 1/6] COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
#52 DONE 0.1s

#49 [worker builder 9/9] RUN --mount=type=cache,target=/root/.cache/uv     uv sync --frozen --no-dev --no-editable --package bigheadct-worker
#49 1.544    Building bigheadct-worker @ file:///app/apps/worker
#49 1.687 Downloading pydantic-core (2.0MiB)
#49 ...

#53 [web dependencies 2/6] COPY apps/web/package.json apps/web/package.json
#53 DONE 0.2s

#54 [web dependencies 3/6] COPY packages/config/package.json packages/config/package.json
#54 DONE 0.2s

#55 [api builder 9/9] RUN --mount=type=cache,target=/root/.cache/uv     uv sync --frozen --no-dev --no-editable --package bigheadct-api
#55 1.384 Using CPython 3.14.0 interpreter at: /usr/local/bin/python3
#55 1.384 Creating virtual environment at: .venv
#55 1.441    Building bigheadct-pycore @ file:///app/packages/pycore
#55 1.508    Building bigheadct-api @ file:///app/apps/api
#55 1.587 Downloading sqlalchemy (3.1MiB)
#55 1.591 Downloading pydantic-core (2.0MiB)
#55 1.594 Downloading asyncpg (3.3MiB)
#55 ...

#56 [web dependencies 4/6] COPY packages/contracts/package.json packages/contracts/package.json
#56 DONE 0.1s

#49 [worker builder 9/9] RUN --mount=type=cache,target=/root/.cache/uv     uv sync --frozen --no-dev --no-editable --package bigheadct-worker
#49 2.247  Downloaded pydantic-core
#49 ...

#57 [web dependencies 5/6] COPY packages/ui/package.json packages/ui/package.json
#57 DONE 0.2s

#55 [api builder 9/9] RUN --mount=type=cache,target=/root/.cache/uv     uv sync --frozen --no-dev --no-editable --package bigheadct-api
#55 2.442  Downloaded pydantic-core
#55 3.317  Downloaded asyncpg
#55 4.326  Downloaded sqlalchemy
#55 5.560       Built bigheadct-api @ file:///app/apps/api
#55 5.922       Built bigheadct-pycore @ file:///app/packages/pycore
#55 5.934 Prepared 48 packages in 4.52s
#55 ...

#49 [worker builder 9/9] RUN --mount=type=cache,target=/root/.cache/uv     uv sync --frozen --no-dev --no-editable --package bigheadct-worker
#49 5.026       Built bigheadct-worker @ file:///app/apps/worker
#49 5.922    Building bigheadct-pycore @ file:///app/packages/pycore
#49 8.237       Built bigheadct-pycore @ file:///app/packages/pycore
#49 8.245 Prepared 38 packages in 6.72s
#49 10.24 Installed 38 packages in 1.99s
#49 10.24  + annotated-types==0.7.0
#49 10.24  + anyio==4.14.2
#49 10.24  + arq==0.28.0
#49 10.24  + attrs==26.1.0
#49 10.24  + bigheadct-pycore==0.1.0 (from file:///app/packages/pycore)
#49 10.24  + bigheadct-worker==0.1.0 (from file:///app/apps/worker)
#49 10.24  + certifi==2026.6.17
#49 10.24  + charset-normalizer==3.4.9
#49 10.24  + click==8.4.2
#49 10.24  + googleapis-common-protos==1.75.0
#49 10.24  + h11==0.16.0
#49 10.24  + hiredis==3.4.0
#49 10.24  + httpcore==1.0.9
#49 10.24  + httpx==0.28.1
#49 10.24  + idna==3.18
#49 10.24  + jsonschema==4.26.0
#49 10.24  + jsonschema-specifications==2025.9.1
#49 10.24  + opentelemetry-api==1.44.0
#49 10.24  + opentelemetry-exporter-otlp-proto-common==1.44.0
#49 10.24  + opentelemetry-exporter-otlp-proto-http==1.44.0
#49 10.24  + opentelemetry-proto==1.44.0
#49 10.24  + opentelemetry-sdk==1.44.0
#49 10.24  + opentelemetry-semantic-conventions==0.65b0
#49 10.24  + protobuf==7.35.1
#49 10.24  + pydantic==2.13.4
#49 10.24  + pydantic-core==2.46.4
#49 10.24  + pydantic-settings==2.14.2
#49 10.24  + pyjwt==2.13.0
#49 10.24  + python-dotenv==1.2.2
#49 10.24  + redis==5.3.1
#49 10.24  + referencing==0.37.0
#49 10.24  + requests==2.34.2
#49 10.24  + rpds-py==2026.6.3
#49 10.24  + sentry-sdk==2.66.0
#49 10.24  + structlog==26.1.0
#49 10.24  + typing-extensions==4.16.0
#49 10.24  + typing-inspection==0.4.2
#49 10.24  + urllib3==2.7.0
#49 ...

#55 [api builder 9/9] RUN --mount=type=cache,target=/root/.cache/uv     uv sync --frozen --no-dev --no-editable --package bigheadct-api
#55 10.00 Installed 48 packages in 4.06s
#55 10.00  + annotated-doc==0.0.4
#55 10.00  + annotated-types==0.7.0
#55 10.00  + anyio==4.14.2
#55 10.00  + asgiref==3.12.1
#55 10.00  + asyncpg==0.31.0
#55 10.00  + bigheadct-api==0.1.0 (from file:///app/apps/api)
#55 10.00  + bigheadct-pycore==0.1.0 (from file:///app/packages/pycore)
#55 10.00  + certifi==2026.6.17
#55 10.00  + charset-normalizer==3.4.9
#55 10.00  + click==8.4.2
#55 10.00  + dnspython==2.8.0
#55 10.00  + email-validator==2.3.0
#55 10.00  + fastapi==0.139.2
#55 10.00  + googleapis-common-protos==1.75.0
#55 10.00  + greenlet==3.5.3
#55 10.00  + h11==0.16.0
#55 10.00  + httpcore==1.0.9
#55 10.00  + httpx==0.28.1
#55 10.00  + idna==3.18
#55 10.00  + opentelemetry-api==1.44.0
#55 10.00  + opentelemetry-exporter-otlp-proto-common==1.44.0
#55 10.00  + opentelemetry-exporter-otlp-proto-http==1.44.0
#55 10.00  + opentelemetry-instrumentation==0.65b0
#55 10.00  + opentelemetry-instrumentation-asgi==0.65b0
#55 10.00  + opentelemetry-instrumentation-fastapi==0.65b0
#55 10.00  + opentelemetry-proto==1.44.0
#55 10.00  + opentelemetry-sdk==1.44.0
#55 10.00  + opentelemetry-semantic-conventions==0.65b0
#55 10.00  + opentelemetry-util-http==0.65b0
#55 10.00  + orjson==3.11.9
#55 10.00  + packaging==26.2
#55 10.00  + protobuf==7.35.1
#55 10.00  + pydantic==2.13.4
#55 10.00  + pydantic-core==2.46.4
#55 10.00  + pydantic-settings==2.14.2
#55 10.00  + pyjwt==2.13.0
#55 10.00  + python-dotenv==1.2.2
#55 10.00  + redis==5.3.1
#55 10.00  + requests==2.34.2
#55 10.00  + sentry-sdk==2.66.0
#55 10.00  + sqlalchemy==2.0.51
#55 10.00  + starlette==1.3.1
#55 10.00  + structlog==26.1.0
#55 10.00  + typing-extensions==4.16.0
#55 10.00  + typing-inspection==0.4.2
#55 10.00  + urllib3==2.7.0
#55 10.00  + uvicorn==0.51.0
#55 10.00  + wrapt==2.2.2
#55 DONE 10.6s

#58 [web production-dependencies 6/6] RUN --mount=type=cache,id=pnpm-prod,target=/pnpm/store     pnpm install --prod --frozen-lockfile
#58 4.463 Scope: all 5 workspace projects
#58 5.984 Lockfile is up to date, resolution step is skipped
#58 6.367 Progress: resolved 1, reused 0, downloaded 0, added 0
#58 6.721 Packages: +338
#58 6.721 ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
#58 7.379 Progress: resolved 338, reused 0, downloaded 0, added 0
#58 ...

#49 [worker builder 9/9] RUN --mount=type=cache,target=/root/.cache/uv     uv sync --frozen --no-dev --no-editable --package bigheadct-worker
#49 DONE 10.7s

#58 [web production-dependencies 6/6] RUN --mount=type=cache,id=pnpm-prod,target=/pnpm/store     pnpm install --prod --frozen-lockfile
#58 8.380 Progress: resolved 338, reused 0, downloaded 2, added 1
#58 ...

#59 [web dependencies 6/6] RUN --mount=type=cache,id=pnpm,target=/pnpm/store     pnpm install --frozen-lockfile
#59 4.561 Scope: all 5 workspace projects
#59 6.138 Lockfile is up to date, resolution step is skipped
#59 6.850 Progress: resolved 1, reused 0, downloaded 0, added 0
#59 7.925 Packages: +726
#59 7.925 ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
#59 7.976 Progress: resolved 726, reused 0, downloaded 0, added 0
#59 ...

#58 [web production-dependencies 6/6] RUN --mount=type=cache,id=pnpm-prod,target=/pnpm/store     pnpm install --prod --frozen-lockfile
#58 8.638 
#58 8.638    ╭───────────────────────────────────────────────╮
#58 8.638    │                                               │
#58 8.638    │     Update available! 10.26.2 → 11.16.0.      │
#58 8.638    │     Changelog: https://pnpm.io/v/11.16.0      │
#58 8.638    │   To update, run: corepack use pnpm@11.16.0   │
#58 8.638    │                                               │
#58 8.638    ╰───────────────────────────────────────────────╯
#58 8.638 
#58 9.389 Progress: resolved 338, reused 0, downloaded 11, added 2
#58 10.41 Progress: resolved 338, reused 0, downloaded 16, added 2
#58 11.42 Progress: resolved 338, reused 0, downloaded 29, added 6
#58 12.43 Progress: resolved 338, reused 0, downloaded 53, added 13
#58 13.43 Progress: resolved 338, reused 0, downloaded 62, added 16
#58 14.44 Progress: resolved 338, reused 0, downloaded 72, added 18
#58 15.45 Progress: resolved 338, reused 0, downloaded 96, added 26
#58 16.87 Progress: resolved 338, reused 0, downloaded 100, added 27
#58 ...

#59 [web dependencies 6/6] RUN --mount=type=cache,id=pnpm,target=/pnpm/store     pnpm install --frozen-lockfile
#59 8.988 Progress: resolved 726, reused 0, downloaded 7, added 0
#59 9.974 Progress: resolved 726, reused 0, downloaded 12, added 0
#59 11.41 
#59 11.41    ╭───────────────────────────────────────────────╮
#59 11.41    │                                               │
#59 11.41    │     Update available! 10.26.2 → 11.16.0.      │
#59 11.41    │     Changelog: https://pnpm.io/v/11.16.0      │
#59 11.41    │   To update, run: corepack use pnpm@11.16.0   │
#59 11.41    │                                               │
#59 11.41    ╰───────────────────────────────────────────────╯
#59 11.41 
#59 11.44 Progress: resolved 726, reused 0, downloaded 14, added 0
#59 12.57 Progress: resolved 726, reused 0, downloaded 47, added 8
#59 13.60 Progress: resolved 726, reused 0, downloaded 59, added 12
#59 14.61 Progress: resolved 726, reused 0, downloaded 67, added 12
#59 15.66 Progress: resolved 726, reused 0, downloaded 70, added 14
#59 16.67 Progress: resolved 726, reused 0, downloaded 72, added 16
#59 17.72 Progress: resolved 726, reused 0, downloaded 74, added 16
#59 ...

#60 [worker production 3/4] COPY --from=builder --chown=bighead:bighead /app/.venv /app/.venv
#60 DONE 7.9s

#61 [api production 3/3] COPY --from=builder --chown=bighead:bighead /app/.venv /app/.venv
#61 ...

#62 [worker production 4/4] COPY --chown=bighead:bighead deploy/run-worker.py /app/run-worker.py
#62 DONE 2.5s

#58 [web production-dependencies 6/6] RUN --mount=type=cache,id=pnpm-prod,target=/pnpm/store     pnpm install --prod --frozen-lockfile
#58 19.42 Progress: resolved 338, reused 0, downloaded 101, added 28
#58 20.43 Progress: resolved 338, reused 0, downloaded 118, added 32
#58 ...

#61 [api production 3/3] COPY --from=builder --chown=bighead:bighead /app/.venv /app/.venv
#61 DONE 10.3s

#63 [api] exporting to image
#63 exporting layers
#63 ...

#64 [worker] exporting to image
#64 exporting layers 4.1s done
#64 exporting manifest sha256:3be9e75f300bd219e1e359a8cef437dc08bad2c09b088b6590e7a86a24f2e8bc 0.0s done
#64 exporting config sha256:10f86d667114ba299529d09fce3c1f222653604f710c0374f96fa875231677f1 0.1s done
#64 exporting attestation manifest sha256:2571dcda14d478127cbe7dddfe8e54bac731ffb53c0dc3490ce06c8f48981b88 0.1s done
#64 exporting manifest list sha256:c1c7d27739b578978a337427d8dd39c0b1f9fa4ccd4aa18534db517cf32296d9 0.0s done
#64 naming to docker.io/library/sistemas_bigheadct-worker:latest done
#64 unpacking to docker.io/library/sistemas_bigheadct-worker:latest
#64 ...

#59 [web dependencies 6/6] RUN --mount=type=cache,id=pnpm,target=/pnpm/store     pnpm install --frozen-lockfile
#59 18.89 Progress: resolved 726, reused 0, downloaded 77, added 16
#59 19.89 Progress: resolved 726, reused 0, downloaded 82, added 17
#59 20.89 Progress: resolved 726, reused 0, downloaded 94, added 21
#59 22.17 Progress: resolved 726, reused 0, downloaded 96, added 21
#59 23.18 Progress: resolved 726, reused 0, downloaded 111, added 25
#59 24.19 Progress: resolved 726, reused 0, downloaded 120, added 29
#59 25.18 Progress: resolved 726, reused 0, downloaded 133, added 32
#59 26.22 Progress: resolved 726, reused 0, downloaded 134, added 32
#59 27.23 Progress: resolved 726, reused 0, downloaded 136, added 33
#59 28.24 Progress: resolved 726, reused 0, downloaded 150, added 37
#59 ...

#58 [web production-dependencies 6/6] RUN --mount=type=cache,id=pnpm-prod,target=/pnpm/store     pnpm install --prod --frozen-lockfile
#58 21.43 Progress: resolved 338, reused 0, downloaded 128, added 36
#58 22.44 Progress: resolved 338, reused 0, downloaded 134, added 36
#58 23.44 Progress: resolved 338, reused 0, downloaded 137, added 37
#58 24.45 Progress: resolved 338, reused 0, downloaded 146, added 40
#58 25.45 Progress: resolved 338, reused 0, downloaded 159, added 44
#58 26.45 Progress: resolved 338, reused 0, downloaded 191, added 53
#58 27.53 Progress: resolved 338, reused 0, downloaded 207, added 57
#58 28.61 Progress: resolved 338, reused 0, downloaded 210, added 59
#58 ...

#63 [api] exporting to image
#63 exporting layers 8.2s done
#63 exporting manifest sha256:ae7799ea00aaabd978f536182939ae0a9914aa19673bb9ebc1a35fee65c289c5
#63 exporting manifest sha256:ae7799ea00aaabd978f536182939ae0a9914aa19673bb9ebc1a35fee65c289c5 0.0s done
#63 exporting config sha256:ed1a5e5f54fd5822ae7072cab4a2002bd52ecb506465afb65dabba94c8974618 0.0s done
#63 exporting attestation manifest sha256:c550ba5ebbbb7524d7ff8cd6d1d211b8ad8016fa2884bb05513337c568218b0d
#63 exporting attestation manifest sha256:c550ba5ebbbb7524d7ff8cd6d1d211b8ad8016fa2884bb05513337c568218b0d 0.1s done
#63 exporting manifest list sha256:b3a0b8e24c1494e188398502106c6d62c585c975f02e68e7df4146b2aa07fe40 0.0s done
#63 naming to docker.io/library/sistemas_bigheadct-api:latest
#63 naming to docker.io/library/sistemas_bigheadct-api:latest done
#63 unpacking to docker.io/library/sistemas_bigheadct-api:latest
#63 ...

#64 [worker] exporting to image
#64 unpacking to docker.io/library/sistemas_bigheadct-worker:latest 6.2s done
#64 DONE 11.0s

#58 [web production-dependencies 6/6] RUN --mount=type=cache,id=pnpm-prod,target=/pnpm/store     pnpm install --prod --frozen-lockfile
#58 29.64 Progress: resolved 338, reused 0, downloaded 216, added 59
#58 30.70 Progress: resolved 338, reused 0, downloaded 218, added 63
#58 32.28 Progress: resolved 338, reused 0, downloaded 223, added 63
#58 ...

#65 [worker] resolving provenance for metadata file
#65 DONE 0.3s

#59 [web dependencies 6/6] RUN --mount=type=cache,id=pnpm,target=/pnpm/store     pnpm install --frozen-lockfile
#59 29.24 Progress: resolved 726, reused 0, downloaded 173, added 44
#59 30.45 Progress: resolved 726, reused 0, downloaded 197, added 51
#59 32.71 Progress: resolved 726, reused 0, downloaded 204, added 54
#59 33.76 Progress: resolved 726, reused 0, downloaded 215, added 57
#59 35.38 Progress: resolved 726, reused 0, downloaded 216, added 57
#59 36.54 Progress: resolved 726, reused 0, downloaded 217, added 59
#59 ...

#58 [web production-dependencies 6/6] RUN --mount=type=cache,id=pnpm-prod,target=/pnpm/store     pnpm install --prod --frozen-lockfile
#58 36.65 Progress: resolved 338, reused 0, downloaded 224, added 63
#58 ...

#63 [api] exporting to image
#63 unpacking to docker.io/library/sistemas_bigheadct-api:latest 7.9s done
#63 DONE 16.3s

#59 [web dependencies 6/6] RUN --mount=type=cache,id=pnpm,target=/pnpm/store     pnpm install --frozen-lockfile
#59 ...

#66 [api] resolving provenance for metadata file
#66 DONE 0.1s

#58 [web production-dependencies 6/6] RUN --mount=type=cache,id=pnpm-prod,target=/pnpm/store     pnpm install --prod --frozen-lockfile
#58 37.65 Progress: resolved 338, reused 0, downloaded 236, added 67
#58 ...

#59 [web dependencies 6/6] RUN --mount=type=cache,id=pnpm,target=/pnpm/store     pnpm install --frozen-lockfile
#59 39.71 Progress: resolved 726, reused 0, downloaded 225, added 60
#59 43.19 Progress: resolved 726, reused 0, downloaded 228, added 61
#59 44.21 Progress: resolved 726, reused 0, downloaded 229, added 63
#59 45.21 Progress: resolved 726, reused 0, downloaded 231, added 63
#59 46.22 Progress: resolved 726, reused 0, downloaded 233, added 63
#59 47.22 Progress: resolved 726, reused 0, downloaded 236, added 65
#59 48.22 Progress: resolved 726, reused 0, downloaded 238, added 65
#59 ...

#58 [web production-dependencies 6/6] RUN --mount=type=cache,id=pnpm-prod,target=/pnpm/store     pnpm install --prod --frozen-lockfile
#58 60.29 Progress: resolved 338, reused 0, downloaded 237, added 67
#58 61.30 Progress: resolved 338, reused 0, downloaded 239, added 71
#58 62.36 Progress: resolved 338, reused 0, downloaded 252, added 72
#58 63.36 Progress: resolved 338, reused 0, downloaded 264, added 76
#58 64.37 Progress: resolved 338, reused 0, downloaded 282, added 83
#58 65.38 Progress: resolved 338, reused 0, downloaded 295, added 87
#58 66.38 Progress: resolved 338, reused 0, downloaded 312, added 92
#58 67.39 Progress: resolved 338, reused 0, downloaded 327, added 96
#58 68.38 Progress: resolved 338, reused 0, downloaded 338, added 124
#58 69.39 Progress: resolved 338, reused 0, downloaded 338, added 137
#58 ...

#59 [web dependencies 6/6] RUN --mount=type=cache,id=pnpm,target=/pnpm/store     pnpm install --frozen-lockfile
#59 63.34 Progress: resolved 726, reused 0, downloaded 239, added 65
#59 64.35 Progress: resolved 726, reused 0, downloaded 242, added 66
#59 65.35 Progress: resolved 726, reused 0, downloaded 261, added 72
#59 66.36 Progress: resolved 726, reused 0, downloaded 273, added 76
#59 67.37 Progress: resolved 726, reused 0, downloaded 284, added 78
#59 68.36 Progress: resolved 726, reused 0, downloaded 310, added 86
#59 69.36 Progress: resolved 726, reused 0, downloaded 337, added 94
#59 70.37 Progress: resolved 726, reused 0, downloaded 369, added 99
#59 ...

#58 [web production-dependencies 6/6] RUN --mount=type=cache,id=pnpm-prod,target=/pnpm/store     pnpm install --prod --frozen-lockfile
#58 70.39 Progress: resolved 338, reused 0, downloaded 338, added 154
#58 71.39 Progress: resolved 338, reused 0, downloaded 338, added 222
#58 72.39 Progress: resolved 338, reused 0, downloaded 338, added 240
#58 73.39 Progress: resolved 338, reused 0, downloaded 338, added 254
#58 74.41 Progress: resolved 338, reused 0, downloaded 338, added 280
#58 75.40 Progress: resolved 338, reused 0, downloaded 338, added 315
#58 76.41 Progress: resolved 338, reused 0, downloaded 338, added 318
#58 ...

#59 [web dependencies 6/6] RUN --mount=type=cache,id=pnpm,target=/pnpm/store     pnpm install --frozen-lockfile
#59 71.37 Progress: resolved 726, reused 0, downloaded 452, added 119
#59 72.37 Progress: resolved 726, reused 0, downloaded 513, added 133
#59 73.38 Progress: resolved 726, reused 0, downloaded 572, added 144
#59 74.38 Progress: resolved 726, reused 0, downloaded 596, added 149
#59 75.38 Progress: resolved 726, reused 0, downloaded 628, added 157
#59 76.51 Progress: resolved 726, reused 0, downloaded 637, added 160
#59 77.75 Progress: resolved 726, reused 0, downloaded 642, added 160
#59 78.89 Progress: resolved 726, reused 0, downloaded 648, added 163
#59 81.48 Progress: resolved 726, reused 0, downloaded 660, added 169
#59 82.48 Progress: resolved 726, reused 0, downloaded 692, added 178
#59 ...

#58 [web production-dependencies 6/6] RUN --mount=type=cache,id=pnpm-prod,target=/pnpm/store     pnpm install --prod --frozen-lockfile
#58 83.62 Progress: resolved 338, reused 0, downloaded 338, added 319
#58 84.64 Progress: resolved 338, reused 0, downloaded 338, added 325
#58 85.65 Progress: resolved 338, reused 0, downloaded 338, added 327
#58 86.65 Progress: resolved 338, reused 0, downloaded 338, added 337
#58 87.80 Progress: resolved 338, reused 0, downloaded 338, added 338
#58 87.80 Progress: resolved 338, reused 0, downloaded 338, added 338, done
#58 88.39 
#58 88.39 dependencies:
#58 88.39 + @sentry/nextjs 10.65.0
#58 88.39 
#58 88.39 devDependencies: skipped
#58 88.39 
#58 88.50 Done in 1m 25.8s using pnpm v10.26.2
#58 DONE 89.1s

#59 [web dependencies 6/6] RUN --mount=type=cache,id=pnpm,target=/pnpm/store     pnpm install --frozen-lockfile
#59 84.01 Progress: resolved 726, reused 0, downloaded 693, added 178
#59 85.01 Progress: resolved 726, reused 0, downloaded 695, added 178
#59 86.03 Progress: resolved 726, reused 0, downloaded 696, added 178
#59 87.03 Progress: resolved 726, reused 0, downloaded 718, added 185
#59 88.03 Progress: resolved 726, reused 0, downloaded 725, added 196
#59 89.03 Progress: resolved 726, reused 0, downloaded 726, added 221
#59 90.04 Progress: resolved 726, reused 0, downloaded 726, added 250
#59 91.04 Progress: resolved 726, reused 0, downloaded 726, added 298
#59 92.04 Progress: resolved 726, reused 0, downloaded 726, added 328
#59 93.04 Progress: resolved 726, reused 0, downloaded 726, added 329
#59 94.04 Progress: resolved 726, reused 0, downloaded 726, added 512
#59 95.04 Progress: resolved 726, reused 0, downloaded 726, added 633
#59 96.04 Progress: resolved 726, reused 0, downloaded 726, added 711
#59 97.02 Progress: resolved 726, reused 0, downloaded 726, added 726, done
#59 97.73 
#59 97.73 dependencies:
#59 97.73 + @sentry/nextjs 10.65.0
#59 97.73 
#59 97.73 devDependencies:
#59 97.73 + @eslint/js 9.39.5
#59 97.73 + @next/eslint-plugin-next 15.5.20
#59 97.73 + @playwright/test 1.61.1
#59 97.73 + @testing-library/dom 10.4.1
#59 97.73 + @testing-library/jest-dom 6.9.1
#59 97.73 + @testing-library/react 16.3.2
#59 97.73 + @types/node 24.13.3
#59 97.73 + @types/react 19.2.17
#59 97.73 + @types/react-dom 19.2.3
#59 97.73 + @vitejs/plugin-react 5.2.0
#59 97.73 + concurrently 9.2.4
#59 97.73 + eslint 9.39.5
#59 97.73 + jsdom 26.1.0
#59 97.73 + openapi-typescript 7.13.0
#59 97.73 + prettier 3.9.5
#59 97.73 + supabase 2.109.1
#59 97.73 + turbo 2.10.4
#59 97.73 + typescript 5.9.3
#59 97.73 + typescript-eslint 8.63.0
#59 97.73 + vite-tsconfig-paths 5.1.4
#59 97.73 + vitest 3.2.7
#59 97.73 
#59 97.85 Done in 1m 34.6s using pnpm v10.26.2
#59 DONE 98.4s

#67 [web builder 1/2] COPY . .
#67 DONE 2.0s

#68 [web builder 2/2] RUN pnpm --filter @bigheadct/web build
#68 1.156 
#68 1.156 > @bigheadct/web@0.1.0 build /app/apps/web
#68 1.156 > pnpm clean && next build
#68 1.156 
#68 1.927 
#68 1.927 > @bigheadct/web@0.1.0 clean /app/apps/web
#68 1.927 > node ./scripts/clean-next.mjs
#68 1.927 
#68 3.609    ▲ Next.js 15.5.20
#68 3.609 
#68 3.676    Creating an optimized production build ...
#68 18.68  ✓ Compiled successfully in 14.8s
#68 18.69    Skipping validation of types
#68 18.69    Skipping linting
#68 19.06    Collecting page data ...
#68 22.56    Generating static pages (0/23) ...
#68 ...

#69 [web production 4/8] COPY --from=production-dependencies --chown=bighead:bighead /app/node_modules /app/node_modules
#69 ...

#68 [web builder 2/2] RUN pnpm --filter @bigheadct/web build
#68 23.35    Generating static pages (5/23) 
#68 23.43    Generating static pages (11/23) 
#68 23.43    Generating static pages (17/23) 
#68 23.60  ✓ Generating static pages (23/23)
#68 24.42    Finalizing page optimization ...
#68 24.42    Collecting build traces ...
#68 34.85 
#68 34.87 Route (app)                                                 Size  First Load JS
#68 34.87 ┌ ƒ /                                                      217 B         103 kB
#68 34.87 ├ ƒ /_not-found                                            997 B         103 kB
#68 34.87 ├ ƒ /[...slug]                                            122 kB         227 kB
#68 34.87 ├ ƒ /acesso/onboarding                                   6.69 kB         109 kB
#68 34.87 ├ ƒ /acesso/organizacoes                                   168 B         106 kB
#68 34.87 ├ ƒ /api/agents                                            217 B         103 kB
#68 34.87 ├ ƒ /api/agents/[agentId]                                  217 B         103 kB
#68 34.87 ├ ƒ /api/analytics/summary/records                         217 B         103 kB
#68 34.87 ├ ƒ /api/approvals                                         217 B         103 kB
#68 34.87 ├ ƒ /api/approvals/[approvalId]                            217 B         103 kB
#68 34.87 ├ ƒ /api/approvals/[approvalId]/decision                   217 B         103 kB
#68 34.87 ├ ƒ /api/approvals/[approvalId]/decisions                  217 B         103 kB
#68 34.87 ├ ƒ /api/commercial/leads                                  217 B         103 kB
#68 34.87 ├ ƒ /api/commercial/leads/[leadId]                         217 B         103 kB
#68 34.87 ├ ƒ /api/commercial/leads/[leadId]/follow-ups              217 B         103 kB
#68 34.87 ├ ƒ /api/commercial/opportunities/[opportunityId]/stage    217 B         103 kB
#68 34.87 ├ ƒ /api/commercial/pipeline                               217 B         103 kB
#68 34.87 ├ ƒ /api/projects                                          217 B         103 kB
#68 34.87 ├ ƒ /api/projects/[projectId]                              217 B         103 kB
#68 34.87 ├ ƒ /api/prompts                                           217 B         103 kB
#68 34.87 ├ ƒ /api/realtime                                          217 B         103 kB
#68 34.87 ├ ƒ /api/rooms                                             217 B         103 kB
#68 34.87 ├ ƒ /api/rooms/[roomId]/files                              217 B         103 kB
#68 34.87 ├ ƒ /api/rooms/[roomId]/join-requests                      217 B         103 kB
#68 34.87 ├ ƒ /api/rooms/[roomId]/join-requests/[requestId]          217 B         103 kB
#68 34.87 ├ ƒ /api/rooms/[roomId]/members                            217 B         103 kB
#68 34.87 ├ ƒ /api/rooms/[roomId]/messages                           217 B         103 kB
#68 34.87 ├ ƒ /api/screen-rules                                      217 B         103 kB
#68 34.87 ├ ƒ /api/search/global                                     217 B         103 kB
#68 34.87 ├ ƒ /api/tasks                                             217 B         103 kB
#68 34.87 ├ ƒ /api/tasks/[taskId]                                    217 B         103 kB
#68 34.87 ├ ƒ /api/tasks/[taskId]/transition                         217 B         103 kB
#68 34.87 ├ ƒ /api/teams                                             217 B         103 kB
#68 34.87 ├ ƒ /api/teams/[teamId]                                    217 B         103 kB
#68 34.87 ├ ƒ /auth/callback                                         217 B         103 kB
#68 34.87 ├ ƒ /auth/signout                                          217 B         103 kB
#68 34.87 ├ ƒ /auth/update-password                                  217 B         103 kB
#68 34.87 ├ ƒ /catalogo                                              168 B         106 kB
#68 34.87 ├ ƒ /login                                                 217 B         103 kB
#68 34.87 └ ƒ /portal/[token]                                      1.76 kB         104 kB
#68 34.87 + First Load JS shared by all                             102 kB
#68 34.87   ├ chunks/2089-f7140ec2a14242ad.js                      46.2 kB
#68 34.87   ├ chunks/4f8ccae5-a67852df20d158dc.js                  54.2 kB
#68 34.87   └ other shared chunks (total)                          1.98 kB
#68 34.87 
#68 34.87 
#68 34.87 ƒ Middleware                                             91.3 kB
#68 34.87 
#68 34.88 ƒ  (Dynamic)  server-rendered on demand
#68 34.88 
#68 DONE 39.5s

#69 [web production 4/8] COPY --from=production-dependencies --chown=bighead:bighead /app/node_modules /app/node_modules
#69 DONE 16.9s

#70 [web production 5/8] COPY --from=production-dependencies --chown=bighead:bighead /app/apps/web/node_modules ./node_modules
#70 DONE 0.6s

#71 [web production 6/8] COPY --from=production-dependencies --chown=bighead:bighead /app/packages /app/packages
#71 DONE 0.2s

#72 [web production 7/8] COPY --from=builder --chown=bighead:bighead /app/apps/web/.next ./.next
#72 DONE 0.2s

#73 [web production 8/8] COPY --from=builder --chown=bighead:bighead /app/apps/web/package.json ./package.json
#73 DONE 0.2s

#74 [web] exporting to image
#74 exporting layers
#74 exporting layers 30.9s done
#74 exporting manifest sha256:440c962c1a749eaf6b01cc4bd58ee564793f059b63505c05cc195a564c623dcf
#74 exporting manifest sha256:440c962c1a749eaf6b01cc4bd58ee564793f059b63505c05cc195a564c623dcf 0.0s done
#74 exporting config sha256:f3eb6586705c3ced408bf1952e5e0860594f127af092dc8fed87c7786682e2ff 0.0s done
#74 exporting attestation manifest sha256:cce37da37c26bd7a6deecb2e8a8b6aa7818c430b511134647d8f450da044654a 0.0s done
#74 exporting manifest list sha256:bdc05346f95f73e2ac590589358ad69794f1246a07c875c734d05c6265b9b321 0.0s done
#74 naming to docker.io/library/sistemas_bigheadct-web:latest
#74 naming to docker.io/library/sistemas_bigheadct-web:latest done
#74 unpacking to docker.io/library/sistemas_bigheadct-web:latest
#74 unpacking to docker.io/library/sistemas_bigheadct-web:latest 11.9s done
#74 DONE 43.0s

#75 [web] resolving provenance for metadata file
#75 DONE 0.0s
 Image sistemas_bigheadct-worker Built 
 Image sistemas_bigheadct-hermes Built 
 Image sistemas_bigheadct-api Built 
 Image sistemas_bigheadct-web Built 
 Container sistemas_bigheadct-hermes-1 Recreate 
 Container sistemas_bigheadct-redis-1 Running 
 Container sistemas_bigheadct-api-1 Recreate 
 Container sistemas_bigheadct-rag-1 Running 
 Container sistemas_bigheadct-clamav-1 Running 
 Container sistemas_bigheadct-api-1 Recreated 
 Container sistemas_bigheadct-web-1 Creating 
 Container sistemas_bigheadct-hermes-1 Recreated 
 Container sistemas_bigheadct-worker-1 Recreate 
 Container sistemas_bigheadct-web-1 Created 
 Container sistemas_bigheadct-worker-1 Recreated 
 Container sistemas_bigheadct-redis-1 Waiting 
 Container sistemas_bigheadct-hermes-1 Starting 
 Container sistemas_bigheadct-hermes-1 Started 
 Container sistemas_bigheadct-hermes-1 Waiting 
 Container sistemas_bigheadct-redis-1 Waiting 
 Container sistemas_bigheadct-clamav-1 Waiting 
 Container sistemas_bigheadct-redis-1 Healthy 
 Container sistemas_bigheadct-api-1 Starting 
 Container sistemas_bigheadct-api-1 Started 
 Container sistemas_bigheadct-api-1 Waiting 
 Container sistemas_bigheadct-clamav-1 Healthy 
 Container sistemas_bigheadct-redis-1 Healthy 
 Container sistemas_bigheadct-hermes-1 Healthy 
 Container sistemas_bigheadct-worker-1 Starting 
 Container sistemas_bigheadct-worker-1 Started 
 Container sistemas_bigheadct-api-1 Error dependency api failed to start
dependency failed to start: container sistemas_bigheadct-api-1 is unhealthy
##########################################
### Error
### Thu, 23 Jul 2026 15:18:09 GMT
##########################################

Command failed with exit code 1: docker compose -f /etc/easypanel/projects/sistemas/bigheadct/code/easypanel.yml -f /etc/easypanel/projects/sistemas/bigheadct/code/docker-compose.override.yml -p sistemas_bigheadct up --build -d