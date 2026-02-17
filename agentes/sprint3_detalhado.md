# Sprint 3 Detalhada (D1 a D5) - Por Agente

## Objetivo da Sprint 3

Entregar os modulos de segredos, assinaturas tecnicas e anexos com controles de seguranca e auditoria obrigatorios.

## Resultado esperado ao fim da sprint

- Segredos protegidos por criptografia em aplicacao.
- Fluxo de visualizacao de segredo com auditoria completa.
- Assinaturas tecnicas operacionais.
- Anexos funcionais com validacao de seguranca.

## Regras operacionais da sprint

- Daily por agente com progresso e bloqueios.
- Nenhum fluxo sensivel vai para homolog sem revisao de seguranca.
- Bloqueio > 4 horas deve ser escalado.

## D1 (Segunda) - Desenho tecnico sensivel

### Agente 1 (Produto)
- Refinar historias de segredos, assinaturas e anexos.
- Congelar criterios de aceite de seguranca da sprint.

### Agente 2 (Backend/API)
- Definir contratos de `access_secrets`, `subscriptions` e `attachments`.
- Estruturar servicos para criptografia e mascaramento.

### Agente 3 (Dados/Supabase)
- Revisar schema final de `access_secrets`, `subscriptions`, `attachments`.
- Garantir metadados necessarios para auditoria de segredo.

### Agente 4 (Frontend)
- Criar telas/formularios de assinaturas e anexos.
- Definir UX do fluxo "revelar segredo" com confirmacao explicita.

### Agente 5 (Seguranca)
- Definir padrao de criptografia e politica de acesso a segredo.
- Validar requisitos de mascaramento em API e UI.

### Agente 6 (QA)
- Criar plano de testes para fluxos sensiveis.
- Definir casos de tentativa de acesso indevido.

### Agente 7 (DevOps)
- Validar armazenamento seguro de variaveis de criptografia.
- Preparar observabilidade para eventos sensiveis.

## D2 (Terca) - Implementacao de segredos

### Agente 1
- Validar entregas com foco em escopo e usabilidade do fluxo sensivel.

### Agente 2
- Implementar criacao e atualizacao de segredos com criptografia.
- Implementar endpoint de visualizacao controlada de segredo.
- Garantir auditoria em `view_secret`.

### Agente 3
- Validar persistencia de payload criptografado.
- Revisar indices e integridade de referencias.

### Agente 4
- Integrar fluxo de cadastro de segredo.
- Implementar mascaramento por padrao e revelacao sob permissao.

### Agente 5
- Revisar rotas e validar que segredo nao vaza em responses/log.

### Agente 6
- Testar fluxo completo de segredo com permissao correta/incorreta.

### Agente 7
- Monitorar erros e latencia dos endpoints sensiveis em homolog.

## D3 (Quarta) - Assinaturas tecnicas e consolidacao de auditoria

### Agente 1
- Confirmar aderencia funcional do modulo de assinaturas.

### Agente 2
- Implementar CRUD de assinaturas tecnicas.
- Consolidar eventos de auditoria em acoes sensiveis e alteracoes criticas.

### Agente 3
- Validar constraints de `subscriptions`.
- Ajustar estrutura de `audit_events` se necessario.

### Agente 4
- Integrar tela de assinaturas ao detalhe do app.
- Ajustar feedback visual de sucesso/erro.

### Agente 5
- Revisar se assinaturas nao expõem dados alem do permitido.

### Agente 6
- Executar testes funcionais de assinaturas.
- Revalidar rastreabilidade de auditoria.

### Agente 7
- Validar logs e alertas de erro para novos modulos.

## D4 (Quinta) - Anexos com seguranca

### Agente 1
- Validar se anexos cobrem uso operacional da equipe.

### Agente 2
- Implementar upload/listagem/remocao logica de anexos.
- Integrar metadados em `attachments`.

### Agente 3
- Validar consistencia metadados x storage.

### Agente 4
- Integrar UI de anexos no detalhe do app.
- Exibir status de upload e erros.

### Agente 5
- Validar regras de tipo, tamanho e permissao de arquivo.
- Revisar riscos de upload malicioso.

### Agente 6
- Testar anexos validos e invalidos.
- Testar autorizacao de acesso/remocao.

### Agente 7
- Verificar capacidade basica e estabilidade de upload em homolog.

## D5 (Sexta) - Fechamento de sprint

### Todos os agentes
- Corrigir bugs criticos.
- Consolidar evidencias de seguranca e testes.
- Preparar handoff da Sprint 4 (alertas e go-live).

### Gate de aceite da Sprint 3

- Segredos criptografados e nunca expostos indevidamente.
- Evento de auditoria registrado em leitura de segredo.
- CRUD de assinaturas tecnicas aprovado.
- Fluxo de anexos aprovado com validacoes de seguranca.
- Sem bug critico aberto em fluxos sensiveis.

## Checklist de encerramento

- [ ] Criterios de seguranca atendidos
- [ ] Testes criticos aprovados
- [ ] Evidencias de auditoria anexadas
- [ ] Debitos tecnicos registrados
- [ ] Backlog da Sprint 4 refinado
