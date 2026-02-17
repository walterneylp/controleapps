# Sprint 4 Detalhada (D1 a D5) - Por Agente

## Objetivo da Sprint 4

Entregar alertas simples operacionais, hardening final de seguranca, regressao completa e preparacao de go-live da v1.

## Resultado esperado ao fim da sprint

- Alertas simples ativos e confiaveis.
- Aplicacao estabilizada para uso interno.
- Operacao pronta com monitoramento, backup e rollback.
- Go-live aprovado sem pendencia critica.

## Regras operacionais da sprint

- Daily por agente com foco em risco de release.
- Qualquer bug critico bloqueia go-live ate tratativa.
- Bloqueio > 4 horas deve ser escalado.

## D1 (Segunda) - Planejamento de release e alertas

### Agente 1 (Produto)
- Congelar escopo final da v1.
- Publicar checklist de go-live e criterio de "release/no-release".

### Agente 2 (Backend/API)
- Implementar regras de alertas simples (lacunas de cadastro criticas).
- Expor endpoint consolidado de alertas por app.

### Agente 3 (Dados/Supabase)
- Ajustar tabela `alerts` e job/rotina de geracao.
- Validar indices para consultas de dashboard e filtros.

### Agente 4 (Frontend)
- Integrar visualizacao de alertas no dashboard e detalhe do app.
- Implementar estados de prioridade e status do alerta.

### Agente 5 (Seguranca)
- Revisar impacto de alertas em autorizacao e exposicao de dados.

### Agente 6 (QA)
- Criar cenarios de teste para regras de alerta.

### Agente 7 (DevOps)
- Planejar janela de release e roteiro de rollback.
- Revisar readiness de monitoramento e backup.

## D2 (Terca) - Hardening de seguranca

### Agente 1
- Validar que nao houve desvio de escopo.

### Agente 2
- Revisar validacoes de entrada e tratamento de erro em rotas criticas.
- Padronizar respostas de erro sem vazamento de detalhes sensiveis.

### Agente 3
- Revisar politicas de acesso e integridade de dados.

### Agente 4
- Revisar UI para nao exibir campos sensiveis indevidos.

### Agente 5
- Executar checklist completo de seguranca v1.
- Validar RBAC e auditoria em todos fluxos sensiveis.

### Agente 6
- Testar cenarios de permissao indevida e regressao de seguranca.

### Agente 7
- Validar configuracoes seguras de ambiente (secrets, variaveis, acessos).

## D3 (Quarta) - Regressao funcional completa

### Agente 1
- Acompanhar progresso contra gate de release.

### Agente 2
- Corrigir bugs de backend identificados na regressao.

### Agente 3
- Corrigir inconsistencias de dados/migrations encontradas em homolog.

### Agente 4
- Corrigir bugs de UX e fluxos principais.

### Agente 5
- Revalidar seguranca apos correcoes.

### Agente 6
- Executar suite de regressao E2E da jornada principal.
- Consolidar relatorio de qualidade por severidade.

### Agente 7
- Acompanhar estabilidade de homolog durante regressao massiva.

## D4 (Quinta) - Preparacao operacional de producao

### Agente 1
- Preparar comunicacao interna de liberacao da v1.

### Agente 2
- Congelar mudancas de codigo (somente hotfix de alta prioridade).
- Publicar versao candidata a release (RC).

### Agente 3
- Validar backup/restore com dados de homolog.
- Conferir consistencia final de schema.

### Agente 4
- Revisao final de navegacao e acessibilidade funcional basica.

### Agente 5
- Assinatura final de seguranca para go-live.

### Agente 6
- Regressao final sobre RC.
- Confirmar ausencia de bug critico.

### Agente 7
- Validar pipeline de deploy e rollback em simulacao.
- Confirmar alertas de monitoramento ativos.

## D5 (Sexta) - Go-live controlado

### Todos os agentes
- Executar checklist final de release.
- Realizar go-live controlado.
- Monitorar primeiras horas e registrar incidentes.

### Gate de aceite da Sprint 4 e da V1

- Alertas simples funcionando conforme regras definidas.
- Nenhum bug critico aberto.
- Seguranca e auditoria aprovadas.
- Backup e rollback validados.
- Monitoramento e logs operacionais ativos.

## Checklist de encerramento

- [ ] Release aprovada
- [ ] Go-live executado
- [ ] Monitoramento ativo
- [ ] Plano de suporte pos-liberacao definido
- [ ] Retro da v1 agendada
