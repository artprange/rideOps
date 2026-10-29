# Backlog de engenharia

Origem: RideOps_Backlog_Engenharia.pdf, de 29/10/2026. Os identificadores locais RO-001 a RO-040 correspondem aos tickets RIDE-001 a RIDE-040 do documento, preservando sua numeração, dependências e critérios de aceite.

## Convenção de branches

`roX/featyyy`: número do ticket sem zeros à esquerda + descrição curta da feature em minúsculas e hífens. Exemplo: RO-001 → `ro1/featdefinir-escopo`; RO-002 → `ro2/featcriar-monorepo`.

## Progresso

RO-001 concluído por revisão documental em PRODUCT.md. RO-002 é o próximo ticket. Todos os demais estão pendentes. A conclusão documental não indica implementação do MVP.

## Tickets

### RO-001 — Definir escopo e regras do domínio

Prioridade: P0 · Tamanho: S · Dependências (números RO): -

Escrever visão, termos do domínio, convenções de unidades, timezone e recortes do MVP.

- [x] Um README/PRODUCT.md descreve MVP, fora de escopo e três fluxos principais.
- [x] Distância é armazenada em metros; duração em segundos; instantes em UTC.
- [x] Existe uma decisão explícita para métricas ausentes e passeios manuais.

### RO-002 — Criar monorepo TypeScript

Prioridade: P0 · Tamanho: M · Dependências (números RO): 001

Estruturar apps/web, apps/api e packages/shared com pnpm workspaces e scripts comuns.

- [ ] Web e API sobem em modo desenvolvimento sem ajustes manuais obscuros.
- [ ] Lint, typecheck e testes possuem comandos de workspace documentados.
- [ ] Configurações de TS e aliases não criam dependência circular.

### RO-003 — Infra local com Docker Compose

Prioridade: P0 · Tamanho: S · Dependências (números RO): 002

Provisionar PostgreSQL com healthcheck e volumes persistentes; sem Redis nesta etapa.

- [ ] docker compose up -d inicia o banco e informa health status.
- [ ] Credenciais de exemplo ficam em .env.example, nunca no Git.
- [ ] Migração e reset do banco estão documentados.

### RO-004 — Esqueleto NestJS + health endpoints

Prioridade: P0 · Tamanho: S · Dependências (números RO): 002,003

Criar API com validação global, configuração tipada e endpoints de liveness/readiness.

- [ ] GET /health/live retorna 200 com processo saudável.
- [ ] GET /health/ready falha corretamente se o banco estiver indisponível.
- [ ] Um teste de integração cobre os dois casos.

### RO-005 — Pipeline CI e padronização

Prioridade: P1 · Tamanho: S · Dependências (números RO): 002,004

Configurar GitHub Actions para lint, typecheck, tests e build sem secrets reais.

- [ ] PR quebrado falha na checagem automática.
- [ ] README documenta os checks que precisam passar.
- [ ] Commit hooks, se usados, não substituem CI.

### RO-006 — Modelar User e Ride no PostgreSQL

Prioridade: P0 · Tamanho: M · Dependências (números RO): 003,004

Criar migrations e entidades iniciais via Prisma; campos id, userId, source, título, início, distância, duração, ganho de elevação opcional, notas, timestamps.

- [ ] FK Ride.userId impede pedal órfão.
- [ ] Campos numéricos rejeitam negativos e valores incoerentes.
- [ ] Migration up é reexecutável em um banco limpo via fluxo documentado.

### RO-007 — Autenticação e sessão

Prioridade: P0 · Tamanho: L · Dependências (números RO): 006

Implementar cadastro, login, logout e GET /auth/me, com hashing de senha e sessão segura.

- [ ] Senhas nunca ficam em texto puro ou log.
- [ ] Cookies de sessão usam HttpOnly, Secure em produção e política SameSite compatível.
- [ ] Usuário não autenticado recebe 401 em rotas protegidas.

### RO-008 — Autorização por proprietário

Prioridade: P0 · Tamanho: S · Dependências (números RO): 007

Garantir isolamento de dados em leitura, escrita, exclusão e consultas agregadas.

- [ ] Usuário A não consulta, altera ou apaga pedal do usuário B.
- [ ] Teste automatizado cobre tentativa de acesso por ID arbitrário.
- [ ] Respostas não vazam dados privados nem revelam recursos de terceiros.

### RO-009 — CRUD REST de pedal manual

Prioridade: P0 · Tamanho: M · Dependências (números RO): 006,007,008

Criar POST/GET/PATCH/DELETE /rides e GET /rides/:id com DTOs, filtros básicos e paginação.

- [ ] Cadastrar título, data, km e tempo produz unidade normalizada no banco.
- [ ] GET /rides suporta page/limit e retorna ordem estável por data + id.
- [ ] PATCH e DELETE validam autorização; payloads inválidos retornam 400.

### RO-010 — Telas de autenticação e shell do app

Prioridade: P0 · Tamanho: M · Dependências (números RO): 007

Configurar React + Vite + router + TanStack Query; criar login, cadastro e layout responsivo.

- [ ] Usuário logado acessa rotas privadas; não logado é redirecionado.
- [ ] Erros de API possuem feedback legível e estados loading/empty.
- [ ] Mobile não tem overflow horizontal nas páginas centrais.

### RO-011 — Criar, listar, detalhar e editar pedaladas

Prioridade: P0 · Tamanho: L · Dependências (números RO): 009,010

Implementar os formulários e lista de pedaladas, reaproveitando contratos tipados.

- [ ] Formulário tem validação de data, distância e duração.
- [ ] Após criar/editar, UI atualiza sem reload total.
- [ ] Exclusão pede confirmação e permite lidar com falha do servidor.

### RO-012 — Dados de demonstração e teste E2E básico

Prioridade: P1 · Tamanho: M · Dependências (números RO): 011

Criar seed determinístico e cenário de navegação Playwright.

- [ ] Seed gera usuário de dev e 10 pedais com datas variadas sem dados pessoais reais.
- [ ] E2E faz login, cria um pedal, visualiza e edita.
- [ ] Suite roda em ambiente descartável, sem usar produção.

### RO-013 — Modelar Track, TrackPoint e Import

Prioridade: P0 · Tamanho: M · Dependências (números RO): 006

Adicionar Track, TrackPoint e ImportRecord; guardar segmentos, sequência, checksum e status.

- [ ] Coordenadas ficam como lat/lon e sequência explícita, sem depender da ordenação implícita do banco.
- [ ] Segmentos GPX diferentes não são ligados artificialmente.
- [ ] Checksum é único por usuário quando import concluído.

### RO-014 — Endpoint seguro de upload GPX

Prioridade: P0 · Tamanho: M · Dependências (números RO): 013

Aceitar multipart GPX com limite inicial de 5 MB e limite configurável de pontos.

- [ ] Rejeita extensão/MIME incompatível e XML malformado com erro amigável.
- [ ] Implementação bloqueia entidades externas/XXE e trata arquivos excessivos.
- [ ] Arquivo temporário é removido em sucesso e erro.

### RO-015 — Parser GPX isolado da API

Prioridade: P0 · Tamanho: L · Dependências (números RO): 014

Criar serviço puro para ler trk/trkseg/trkpt, lat, lon, ele e time; suportar GPX válido com campos opcionais.

- [ ] Aceita GPX com e sem elevação; tempos ausentes geram duração null.
- [ ] Descarta/rejeita coordenadas fora dos intervalos [-90,90] e [-180,180].
- [ ] Testes usam fixtures pequenas, inclusive segmento vazio, timestamps inválidos e múltiplos segmentos.

### RO-016 — Cálculo de métricas GPS

Prioridade: P0 · Tamanho: L · Dependências (números RO): 015

Calcular distância acumulada por Haversine, tempo decorrido e estatísticas básicas; não inventar moving time nesta fase.

- [ ] Distância não conecta saltos entre segmentos.
- [ ] Tempo decorrido usa timestamps válidos; se insuficientes fica null.
- [ ] Elevação ausente fica null; ganho só é exibido se houver regra documentada para ruído.

### RO-017 — Persistir importação e evitar duplicatas

Prioridade: P0 · Tamanho: M · Dependências (números RO): 013,015,016

Executar ingestão transacional: registrar import, track, pontos e ride; registrar erros sem dados parciais.

- [ ] Arquivo repetido pelo mesmo usuário não duplica pedalada.
- [ ] Falha durante persistência não deixa ride parcialmente importada.
- [ ] Response v1 documentada: 201 {importId, rideId, status: COMPLETED}.

### RO-018 — UI de upload e estados de importação

Prioridade: P0 · Tamanho: M · Dependências (números RO): 014,017

Tela para arrastar/selecionar GPX, acompanhar processamento e navegar para pedal criado.

- [ ] Upload mostra formato e tamanho aceitos antes do envio.
- [ ] Duplicata, dados inválidos e erro de servidor exibem mensagens distintas.
- [ ] Sucesso leva a detalhes do pedal importado.

### RO-019 — Visualizar trilha no mapa

Prioridade: P0 · Tamanho: L · Dependências (números RO): 013,017,018

Adicionar MapLibre/tiles com atribuição correta; desenhar segmentos e ajustar bounding box.

- [ ] Rota e start/end aparecem corretamente em GPX de teste.
- [ ] Se rota estiver vazia, mapa não quebra.
- [ ] Proveedor de tiles, limites e atribuição estão documentados; não abusar de servidores públicos.

### RO-020 — Tela de detalhe com métricas e trajetória

Prioridade: P0 · Tamanho: M · Dependências (números RO): 016,019

Exibir duração, distância, velocidade média quando calculável, ganho de elevação e mapa.

- [ ] Unidades na UI seguem km/h, km, m; API mantém SI.
- [ ] Campos ausentes mostram "não disponível", nunca zero inventado.
- [ ] Resumo de atividade é consistente com resultados do backend.

### RO-021 — Suite de regressão de GPX

Prioridade: P1 · Tamanho: M · Dependências (números RO): 015,016,017,020

Criar fixtures com trilha pequena, gaps, coordenadas inválidas, falta de elevação e duplicatas.

- [ ] Teste referencia distância aproximada conhecida e tolerância declarada.
- [ ] Casos de arquivos maliciosos, muito grandes e repetidos falham com segurança.
- [ ] E2E importa fixture e encontra rota no detalhe.

### RO-022 — Agregados por período

Prioridade: P0 · Tamanho: M · Dependências (números RO): 009,017

Criar GET /stats/summary?from=&to= com quilômetros, horas, atividades e elevação total conhecida.

- [ ] Agregação filtra sempre por usuário e intervalo inclusivo/exclusivo documentado.
- [ ] Dados ausentes não são somados como se fossem medições reais.
- [ ] Testes cobrem períodos vazios e virada de mês.

### RO-023 — Dashboard responsivo

Prioridade: P0 · Tamanho: M · Dependências (números RO): 022

Cards com totais do mês, últimas atividades e gráfico semanal/mensal.

- [ ] Dashboard usa dados reais da API e loading/empty/error states.
- [ ] Gráficos possuem labels, unidades e são legíveis no mobile.
- [ ] Seleção de período corresponde à consulta efetiva.

### RO-024 — Filtros e busca em pedaladas

Prioridade: P1 · Tamanho: M · Dependências (números RO): 009,023

Permitir buscar título, filtrar origem (manual/GPX) e intervalo de datas.

- [ ] Filtros funcionam combinados e no backend, antes da paginação.
- [ ] URL preserva filtros ao recarregar ou compartilhar dentro da conta.
- [ ] Consultas vazias mostram indicação clara.

### RO-025 — Recordes pessoais básicos

Prioridade: P1 · Tamanho: M · Dependências (números RO): 022

Listar pedal mais longo, maior duração e maior distância em um mês.

- [ ] Empates têm critério estável de desempate.
- [ ] Atividades sem duração não competem em recorde de tempo.
- [ ] Cada recorde navega para o pedal correspondente.

### RO-026 — Testes de API e cobertura de autorização

Prioridade: P0 · Tamanho: M · Dependências (números RO): 008,017,022

Expandir suíte de integração para auth, propriedade, filtros, upload e agregação.

- [ ] Testes rodam com banco de teste isolado e migrations reais.
- [ ] Casos 400/401/403 ou 404 são previsíveis e documentados.
- [ ] Uma execução limpa passa sem depender de ordem.

### RO-027 — Política de privacidade e segurança

Prioridade: P0 · Tamanho: M · Dependências (números RO): 017,026

Todas as pedaladas são privadas por padrão; rever logs, upload, CSRF, rate limiting e vazamento de localização.

- [ ] Nenhuma rota pública devolve trilha ou coordenadas do usuário.
- [ ] Tokens, senhas, conteúdo GPX e coordenadas não aparecem em logs normais.
- [ ] Há limites de requisição para login e upload; threat model curto no repositório.

### RO-028 — Índices, paginação e medições

Prioridade: P1 · Tamanho: M · Dependências (números RO): 024,026

Medir queries de listagem/agregados; adicionar índices comprovadamente úteis.

- [ ] EXPLAIN ou logs de consulta fundamentam a otimização.
- [ ] Lista não retorna todos os pontos GPS por padrão.
- [ ] Teste com dataset sintético grande identifica gargalos.

### RO-029 — Logs estruturados e erros consistentes

Prioridade: P1 · Tamanho: M · Dependências (números RO): 026

Adicionar requestId, códigos de erro estáveis e logging redigido.

- [ ] Falha de import registra requestId/importId sem exibir dados sensíveis.
- [ ] Frontend mapeia erro conhecido para mensagem clara.
- [ ] Status de health não revela secrets nem stack trace.

### RO-030 — Acessibilidade e estados extremos

Prioridade: P1 · Tamanho: M · Dependências (números RO): 023,026

Auditar navegação por teclado, contraste, carregamento lento, dados ausentes e tabela extensa.

- [ ] Inputs têm label e erro acessível; modal de exclusão tem foco gerenciado.
- [ ] UI não trava com 0 atividades ou duração desconhecida.
- [ ] Mapa tem resumo textual alternativo das métricas da rota.

### RO-031 — Adicionar Redis, BullMQ e worker separado

Prioridade: P1 · Tamanho: L · Dependências (números RO): 017,029

Extrair parsing de GPX para um worker; API recebe arquivo e cria ImportRecord pendente.

- [ ] POST /imports/gpx passa a responder 202 {importId, status: QUEUED}.
- [ ] Worker pode iniciar/parar separadamente da API.
- [ ] Frontend continua funcionando com status assíncrono.

### RO-032 — Máquina de estados da importação

Prioridade: P1 · Tamanho: M · Dependências (números RO): 031

Definir QUEUED, PROCESSING, COMPLETED, FAILED e GET /imports/:id; polling simples na UI.

- [ ] Estado só avança por transições válidas.
- [ ] Polling cessa após sucesso/falha ou desmontagem do componente.
- [ ] Um job com falha apresenta mensagem sanitizada e rastreável.

### RO-033 — Idempotência e retries de jobs

Prioridade: P1 · Tamanho: L · Dependências (números RO): 031,032

Configurar retry com backoff, deduplicação por checksum e persistência atômica.

- [ ] Mesmo arquivo/job repetido não gera duas Ride.
- [ ] Erro transitório reprocessa; GPX inválido falha sem retry inútil.
- [ ] Matar worker durante job não deixa dados inconsistentes.

### RO-034 — Falhas definitivas e reprocessamento

Prioridade: P1 · Tamanho: M · Dependências (números RO): 032,033

Registrar tentativas, erro terminal, retenção adequada e reprocessamento manual seguro.

- [ ] Usuário vê status e pode reenviar importação falha sem duplicatas.
- [ ] Admin/dev tem caminho documentado de inspeção de jobs mortos.
- [ ] Não existem retries infinitos.

### RO-035 — Limites de concorrência e carga

Prioridade: P2 · Tamanho: M · Dependências (números RO): 031,033

Benchmark com GPX grandes, concorrência configurável e restrições por usuário.

- [ ] Carga controlada não derruba API de CRUD.
- [ ] Quantidade máxima de pontos/tamanho/tempo é explícita e testada.
- [ ] Relatório curto documenta throughput e gargalo observado.

### RO-036 — Deploy e ambiente de produção

Prioridade: P1 · Tamanho: L · Dependências (números RO): 027,029,031

Fazer deploy de web, API, worker e banco em serviços compatíveis, com HTTPS e secrets externos.

- [ ] Pipelines rodam migrações de maneira controlada.
- [ ] Endpoints de health refletem dependências essenciais.
- [ ] Importar GPX e ver mapa funciona em ambiente remoto.

### RO-037 — Backup, restauração e documentação

Prioridade: P1 · Tamanho: M · Dependências (números RO): 036

Documentar arquitetura, runbooks, ADRs e teste de restauração do PostgreSQL.

- [ ] Outro dev consegue subir projeto apenas com README e .env.example.
- [ ] Backup de teste é restaurado e validado em ambiente isolado.
- [ ] Existe diagrama de componentes e registro de decisões.

### RO-038 — Gráfico de altitude e moving time

Prioridade: P2 · Tamanho: L · Dependências (números RO): 020,021

Adicionar perfil de altitude e algoritmo documentado para tempo em movimento, incluindo gaps e ruído.

- [ ] Algoritmo tem limiares explícitos, não inventa tempo ausente.
- [ ] Gráfico permite identificar ponto aproximado do percurso.
- [ ] Fixture com pausa e ruído produz resultado dentro da tolerância.

### RO-039 — Metas e progressão semanal

Prioridade: P2 · Tamanho: M · Dependências (números RO): 023,025

Definir meta mensal de distância, progresso e histórico visual.

- [ ] Metas são por usuário e não alteram métricas de atividades.
- [ ] Mudança de meta atualiza progresso sem recalcular GPS.
- [ ] Sem meta definida, dashboard não força dados falsos.

### RO-040 — Exportação e portabilidade

Prioridade: P2 · Tamanho: M · Dependências (números RO): 024,027

Exportar atividades do usuário em CSV e trilhas importadas em GPX quando suportado.

- [ ] CSV preserva cabeçalhos, unidades e timezone documentados.
- [ ] Exportação requer autenticação e ownership.
- [ ] Não inclui dados de outro usuário e limita volume.
