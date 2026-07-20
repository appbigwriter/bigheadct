# Tasklist atualizada — `env.local` do BigHeadCT

Data de referência: 19 de julho de 2026

Objetivo: criar o PRD e a especificação técnica do `env.local` do BigHeadCT usando como base consolidada:

- `F:\Projetos\BigHead\.env`
- `F:\Projetos\GestaoDB\.env.local`

Sem ambiguidade sobre o que é BigHead, o que é Control Tower e o que é infraestrutura derivada.

## 1. Fechar o inventário real

- [x] Extrair todas as variáveis dos dois arquivos sem omitir chaves herdadas.
- [x] Separar variáveis por escopo: cliente, servidor, worker, infraestrutura, legado.
- [x] Marcar duplicadas e divergentes.
- [x] Identificar variáveis que só existem por compatibilidade histórica.

## 2. Mapear o uso no código

- [x] Confirmar onde cada variável é lida no BigHead.
- [x] Confirmar onde cada variável é lida no Control Tower/GestaoDB.
- [x] Marcar variáveis usadas por compose, scripts, build ou docs.
- [x] Destacar variáveis que não têm consumidor real.

## 3. Classificar por origem e responsabilidade

- [x] Atribuir cada variável a um domínio: Supabase, Auth, BigHead, Hermes, Control Tower, observabilidade, storage.
- [x] Marcar o que é regenerável.
- [x] Marcar o que é derivado por script/compose.
- [x] Marcar o que deve ficar exclusivo de backend.

## 4. Definir o contrato do novo `env.local`

- [x] Definir quais variáveis entram no `BigHeadCT`.
- [x] Definir o nome final das variáveis públicas do frontend.
- [x] Definir o nome final das variáveis privadas do backend/worker.
- [x] Definir o que será obrigatório em desenvolvimento local.
- [x] Definir o que será obrigatório em produção.

## 5. Documentar o caminho de obtenção das chaves

- [x] Explicar como obter chaves do Supabase novamente.
- [x] Explicar como regenerar chaves e quais sistemas impactam.
- [x] Explicar onde obter segredos do Control Tower.
- [x] Explicar onde obter configurações de Hermes.
- [x] Explicar como derivar URLs e segredos por ambiente.

## 6. Resolver variáveis problemáticas

- [x] Corrigir qualquer variável pública mal nomeada.
- [x] Corrigir divergências entre `NEXT_PUBLIC_*` e variantes sem prefixo.
- [x] Normalizar variáveis de URL para frontend e backend.
- [x] Eliminar variáveis duplicadas com papel confuso.

## 7. Preparar o PRD final

- [x] Escrever a tabela mestre com origem, uso, obrigatoriedade e regeneração.
- [x] Escrever as regras de segurança para segredos.
- [x] Escrever a política de fallback quando uma variável faltar.
- [x] Escrever os impactos caso as APIs sejam regeneradas.

## 8. Validar com o código

- [x] Conferir se o documento cobre todas as leituras em `apps/web`.
- [x] Conferir se o documento cobre todas as leituras em `apps/api`.
- [x] Conferir se o documento cobre todas as leituras em `apps/worker`.
- [x] Conferir se o documento cobre os pontos de uso do Control Tower.

## 9. Entregáveis finais

- [x] PRD do `env.local` do BigHeadCT.
- [x] Tabela consolidada de variáveis.
- [x] Mapa de origem/uso por variável.
- [x] Lista de variáveis regeneráveis.
- [x] Lista de variáveis derivadas.
- [x] Lista de variáveis exclusivas do Control Tower.

## Ordem recomendada

1. Inventário.
2. Uso no código.
3. Origem e responsabilidade.
4. Contrato do `env.local`.
5. Caminho de obtenção.
6. Normalização.
7. PRD final.
8. Validação cruzada.

## Atualizacao desta rodada

- [x] Nenhuma variavel nova foi necessaria para o fluxo de acesso as conversas.
- [x] O contrato de `env.local` permanece inalterado nesta iteracao.
