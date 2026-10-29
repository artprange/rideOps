# RideOps

Plataforma privada para registrar pedaladas, importar GPX, visualizar trajetos e acompanhar a evolução.

## Estado atual

Projeto iniciado do zero. O ticket **RO-001 — Definir escopo e regras do domínio** está concluído na documentação. Ainda não há aplicação, dependências instaladas ou comandos de execução.

- [Produto e regras do domínio](PRODUCT.md)
- [Backlog e branches](docs/BACKLOG.md)

## Arquitetura planejada

- `apps/web`: React, Vite e TypeScript.
- `apps/api`: NestJS e TypeScript, API REST por domínio.
- `packages/shared`: contratos e tipos sem dependência de frameworks.
- PostgreSQL e Prisma para persistência.
- pnpm workspaces, Docker Compose e GitHub Actions para desenvolvimento e validação.
- Worker, Redis e BullMQ somente na fase de importação assíncrona.

Esses componentes ainda não foram criados. O próximo ticket é **RO-002 — Criar monorepo TypeScript**.

## Fluxo de trabalho

Branches seguem `roX/featyyy`: `X` é o número do ticket sem zeros à esquerda e `yyy` é uma descrição curta em minúsculas, separada por hífens. Exemplo: `ro1/featdefinir-escopo`.

Cada entrega registra critérios de aceite e verificações executadas. Quando o monorepo existir, lint, typecheck, testes e build deverão passar antes da integração. Nesta etapa documental, esses comandos ainda não existem e não foram executados.
