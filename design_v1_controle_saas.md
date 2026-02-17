# Design V1 - Sistema de Controle Técnico SaaS/APP

## 1. Resumo de Entendimento

- O produto é um sistema web para centralizar controle técnico de SaaS/APP.
- O objetivo é reduzir perda de contexto operacional sobre hospedagem, domínio, banco e integrações.
- Usuários da v1: time técnico interno pequeno (2 a 10 pessoas).
- Escopo v1 inclui inventário técnico, credenciais seguras, assinaturas técnicas, anexos e alertas simples.
- Segurança v1 exige criptografia forte de segredos, RBAC simples e trilha de auditoria.
- Base de dados será Supabase em VPS.
- Resposta e interface priorizam PT-BR.

## 2. Objetivos e Não Objetivos

### Objetivos

- Centralizar ativos técnicos em uma fonte única de verdade.
- Permitir busca rápida por SaaS/APP, domínio, provedor e integrações.
- Reduzir risco operacional com controle de credenciais e auditoria.
- Preparar o terreno para integração futura com sistema financeiro.

### Não Objetivos (v1)

- Não implementar controle financeiro completo.
- Não implementar multi-tenant externo.
- Não iniciar com microserviços.

## 3. Requisitos Funcionais V1

- Cadastro de SaaS/APP com nome interno e nome comercial.
- Cadastro de hospedagem com provedor, IP e tipo.
- Cadastro de domínio e registrador com credencial associada.
- Cadastro de integrações IA/API e chaves vinculadas.
- Cadastro de assinaturas técnicas com nome no cartão e últimos 4 dígitos.
- Upload e gestão de anexos por registro.
- Busca e filtros por campos principais.
- Alertas simples por lacunas de cadastro.
- Auditoria de eventos sensíveis.

## 4. Requisitos Não Funcionais V1

- Disponibilidade alvo: 99,5%.
- Escala alvo: até 10 usuários e até 500 registros.
- Segurança: criptografia de segredos em aplicação antes da persistência.
- Autorização: RBAC com papéis admin, editor e leitor.
- Auditoria: leitura e alteração de dados sensíveis.
- Operação: backup diário e retenção definida.

## 5. Arquitetura Recomendada

### Abordagem escolhida

- Monólito modular com frontend web, backend API único e Supabase (Postgres/Auth/Storage).

### Módulos de backend

- `inventory`
- `secrets`
- `subscriptions`
- `attachments`
- `alerts`
- `audit`

## 6. Modelo de Dados (alto nível)

- `apps`
- `hosting_entries`
- `domains`
- `access_secrets`
- `ai_integrations`
- `subscriptions`
- `attachments`
- `audit_events`
- `alerts`

## 7. Fluxos Críticos

- Cadastro completo de app e vínculos técnicos.
- Criação e acesso de segredo com auditoria.
- Upload de anexo e vínculo ao app.
- Geração de alertas por ausência de dados essenciais.

## 8. Segurança

- Segredos nunca persistidos em texto puro.
- Mascaramento de campos sensíveis em logs.
- Auditoria obrigatória para `view_secret`, `create`, `update`, `delete` em recursos críticos.
- Controle de acesso por papel.

## 9. Estratégia de Testes

- Testes unitários para validações e regras de permissão.
- Testes de integração para fluxos de segredo, auditoria e anexos.
- E2E enxuto para jornada principal.

## 10. Assunções

- Sem owner único de dados na v1; manutenção compartilhada.
- Integração com financeiro fica para etapa posterior.
- Interface inicial somente em PT-BR.

## 11. Decision Log

- D1: Incluir anexos na v1.
  Motivo: valor operacional imediato para documentação técnica.
- D2: Supabase em VPS como base de dados/plataforma.
  Motivo: alinhamento com ambiente já definido.
- D3: Escolha de monólito modular.
  Motivo: menor complexidade com alta velocidade de entrega para v1.
- D4: Separar segredos em entidade dedicada.
  Motivo: reforço de segurança e governança.
- D5: Incluir alertas simples na v1.
  Motivo: reduzir falhas por cadastro incompleto.
- D6: RBAC com 3 papéis (admin, editor, leitor).
  Motivo: simplicidade com controle mínimo adequado.
- D7: Auditoria mandatória para eventos sensíveis.
  Motivo: rastreabilidade e compliance interna.
- D8: Disponibilidade alvo de 99,5%.
  Motivo: equilíbrio entre custo e confiabilidade na v1.
