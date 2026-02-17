# Agente de Dados/Supabase - V1

## Missão

Modelar e manter o schema no Supabase com integridade, rastreabilidade e performance para escala inicial.

## Tabelas base

- `apps`
- `hosting_entries`
- `domains`
- `access_secrets`
- `ai_integrations`
- `subscriptions`
- `attachments`
- `audit_events`
- `alerts`

## Diretrizes

- Chaves estrangeiras obrigatórias entre entidades relacionadas.
- Índices para busca por nome de app, domínio, provedor e status.
- Campo de controle temporal padrão: `created_at`, `updated_at`.
- Soft delete quando necessário para rastreabilidade.

## Supabase Storage

- Bucket para anexos com estrutura por tipo de recurso e id.
- Metadados de arquivo em tabela `attachments`.

## Critérios de aceite

- Migrations reproduzíveis em ambiente novo.
- Integridade relacional validada.
- Consultas principais com tempo adequado para escala v1.
