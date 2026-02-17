# Controle App - V1

Implementacao inicial da V1 seguindo `master_playbook_v1.md`.

## Estrutura

- `apps/backend`: API (Auth, RBAC, Auditoria base)
- `apps/frontend`: Web app inicial (login + shell)
- `infra/supabase`: migrations e seeds SQL
- `agentes/`: documentos de coordenacao dos agentes

## Sprint 1 (estado atual)

- Estrutura monorepo criada.
- Fundacao de backend criada.
- Auth e RBAC base implementados.
- Auditoria base implementada.
- Migration inicial Supabase criada.

## Proximos passos

- Integrar backend com Supabase Auth real.
- Conectar frontend ao login do backend.
- Avancar para Sprint 2 (CRUD inventario tecnico).
