# Agente Backend/API - V1

## Missão

Implementar API monolítica modular com regras de negócio centralizadas e segurança para dados sensíveis.

## Módulos

- `inventory`
- `secrets`
- `subscriptions`
- `attachments`
- `alerts`
- `audit`

## Endpoints mínimos

- CRUD de apps.
- CRUD de hospedagem vinculada.
- CRUD de domínio/registrador.
- CRUD de integrações IA/API.
- CRUD de assinaturas técnicas.
- Upload/listagem/remoção lógica de anexos.
- Consulta de alertas.
- Consulta de trilha de auditoria com filtros.

## Regras obrigatórias

- Nenhum segredo em texto puro no banco.
- Toda ação sensível deve registrar evento de auditoria.
- Validação de autorização por papel em todas rotas.
- Mascarar dados sensíveis em respostas não autorizadas.

## Critérios de aceite

- Fluxo completo de cadastro técnico funcionando por API.
- Auditoria gerada para `view_secret`, `create`, `update`, `delete` sensíveis.
- Cobertura de testes de integração para fluxos críticos.
