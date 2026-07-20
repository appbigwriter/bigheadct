# Análise crítica do BigHead

Data da auditoria: 20 de julho de 2026

Escopo desta leitura:

- BigHead como base principal.
- Control Tower tratado como módulo dentro do BigHeadCT.
- Hermes como integração já presente e sensível.
- Sem propor mudança no frontend nem no backend do Control Tower original.

## 1. Leitura executiva

O BigHead já deixou de ser um projeto “simplesmente integrado” e passou a operar como uma plataforma grande, com muitas camadas de abstração, muitas telas genéricas e vários contratos indiretos. Isso explica a sensação de confusão: a experiência atual não está centrada em tarefas concretas, e sim em espaços amplos demais como “workspace”, “home operacional”, “agentes”, “conhecimento”, “comercial” e “aprendizado”.

A consequência prática é que o usuário precisa pensar como o sistema pensa, em vez de o sistema conduzir o usuário por fluxos claros.

Em paralelo, a integração com Hermes já entrou no núcleo do produto: há sync de profiles, executor dedicado, validação de contrato e fallback por provider. Isso é bom do ponto de vista técnico, mas aumenta muito a área de superfície do sistema e, se misturado com uma UI vaga, vira ruído operacional.

## 2. O que já está claro no código

Pelos arquivos analisados, o BigHead já tem:

- shell de navegação com áreas separadas por função;
- catálogo de telas e contratos por tela;
- backend com domínios explícitos;
- worker separado para execução;
- integração Hermes com profile sync e executor;
- documentação de PRD e especificações de novas capacidades;
- forte preocupação com contratos, testes e observabilidade.

Ou seja: o problema principal não parece ser falta de estrutura. O problema é excesso de estrutura sem ancoragem suficiente na experiência real de uso.

## 3. Diagnóstico crítico dos fluxos

### 3.1. Muitas telas ainda falam em abstração, não em ação

O catálogo de telas mostra várias superfícies que ainda soam genéricas ou “meio produto, meio framework”. Exemplos:

- “Home operacional”
- “Busca global e command palette”
- “Lista de salas”
- “Sala conversacional”
- “Monitor de execução”
- “Biblioteca de conhecimento”
- “Estúdio de conteúdo”
- “Dashboard executivo”

Esses nomes são válidos do ponto de vista arquitetural, mas não guiam o usuário para a próxima decisão concreta. O usuário entra, olha o painel e ainda precisa descobrir qual problema resolver primeiro.

### 3.2. O produto está organizado por domínio, mas não por intenção

A navegação principal agrupa por:

- Visão geral
- Conversas
- Trabalho
- Comercial

Isso é bom para organização interna, mas ainda não responde a perguntas práticas como:

- “O que eu faço agora?”
- “Qual tela resolve minha dor hoje?”
- “Qual ação cria valor em menos de um minuto?”

Quando a organização é forte, mas a intenção do usuário não aparece na primeira camada, surgem telas inchadas e fluxos longos demais.

### 3.3. Hermes aumentou a complexidade de orquestração

O BigHead já depende de um contrato operacional com Hermes em vários pontos:

- geração e sincronização de profile;
- execução de runs por executor Hermes;
- validação rigorosa de payload de resposta;
- uso de headers e metadados específicos;
- tratamento de erro separado por tipo.

Isso é tecnicamente saudável, mas exige disciplina. Se a interface e os fluxos não forem “mais simples que a infraestrutura”, o sistema fica cognitivamente pesado.

### 3.4. Há sinais claros de produto em transição

No navegador do workspace existe um conjunto de rotas e grupos que parecem desenhados para uma expansão futura. O próprio código expõe rotas “productize later”, o que indica que parte da navegação ainda está servindo como ponte entre estados diferentes do produto.

Esse tipo de ponte é útil em fase de evolução, mas em auditoria costuma denunciar uma coisa: a experiência ainda não foi fechada no nível da tarefa.

## 4. Onde o BigHead está mais inconsistente

### 4.1. Telas ultra vagas e complexas demais

Seu comentário bate com o que a base sugere: há muitos espaços amplos, porém poucos pontos de entrada orientados a “faça isso aqui agora”.

O risco é cair em três padrões ruins:

1. tela que parece dashboard, mas não entrega decisão;
2. tela que parece editor, mas não fecha uma ação;
3. tela que parece catálogo, mas não prioriza o próximo passo.

### 4.2. Fluxos de trabalho pouco fluídos

Os fluxos parecem atravessar vários domínios:

- sala → tarefa → aprovação → execução;
- agente → profile Hermes → run → saída do worker;
- lead → pipeline → comercial → conteúdo;
- conhecimento → RAG → execução;
- portal → aprovação → auditoria.

Sem uma camada de “próxima ação” muito bem desenhada, isso vira encadeamento técnico em vez de experiência de trabalho.

### 4.3. O risco de o Control Tower virar uma segunda cabeça

Como você quer unificar os dois projetos e tratar o Control Tower como módulo do BigHead, o maior risco não é técnico; é de propriedade da experiência.

Se o Control Tower continuar “existindo por fora” conceitualmente, a equipe vai continuar dividindo o cérebro entre:

- onde o ajuste deveria morar;
- qual projeto é fonte da verdade;
- quem controla a tela;
- quem controla o fluxo;
- quem controla o contrato.

Por isso a unificação precisa ser também semântica, não só de pasta.

## 5. Diretriz crítica para a nova BigHeadCT

O BigHeadCT deve ser montado como uma base curada, com apenas o que já está definido e aprovado.

Isso implica:

- Control Tower não ganha novo frontend nem novo backend separado;
- BigHead passa a absorver o Control Tower como módulo;
- Hermes continua como integração de execução, não como conceito espalhado na UI;
- telas novas do BigHead devem nascer ancoradas em funcionalidades concretas, não em abstrações amplas;
- cada tela precisa responder a uma pergunta clara de operação.

## 6. Princípios de redesign para as telas do BigHead

As novas telas precisam obedecer a uma lógica simples:

- objetivo único por tela;
- formulário ou ação principal sempre visível;
- estado vazio útil;
- resumo do que já existe;
- próxima ação clara;
- pouco texto decorativo;
- menos catálogo, mais operação.

Em termos práticos, a tela boa para o BigHead deve permitir que alguém entenda em poucos segundos:

1. o que está vendo;
2. por que aquilo existe;
3. o que pode ser feito agora;
4. qual o impacto da ação;
5. quando precisa de aprovação humana.

## 7. Conclusão

O BigHead não está fraco de estrutura; ele está forte demais de estrutura e ainda fraco de orientação de uso.

A auditoria aponta três conclusões firmes:

1. a integração com Hermes já está profunda e precisa ser tratada como núcleo operacional;
2. o frontend precisa sair do modo “workspace genérico” e virar fluxo de trabalho guiado por intenção;
3. a unificação com Control Tower deve ocorrer dentro da nova BigHeadCT como um recorte curado, sem espalhar complexidade de integração por duas bases paralelas.

Se a próxima etapa for feita com disciplina, o ganho não será só técnico. A experiência inteira fica mais legível.

## 8. Estado após implementação

A auditoria inicial gerou um efeito prático direto: as telas mais confusas foram redesenhadas com resumo operacional, os fluxos centrais ficaram mais ancorados em tarefas, e o contrato de ambiente foi unificado para refletir o que o código realmente consome hoje.

Na prática, isso significa que a crítica deixou de ser apenas diagnóstica e passou a orientar uma base já mais legível, com build validado e contratos menos ambíguos.
