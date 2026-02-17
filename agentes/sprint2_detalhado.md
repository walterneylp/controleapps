# Sprint 2 Detalhada (D1 a D5) - Por Agente

## Objetivo da Sprint 2

Entregar o nucleo funcional de inventario tecnico com CRUD completo de SaaS/APP, hospedagem, dominio e integracoes IA/API, incluindo busca e filtros.

## Resultado esperado ao fim da sprint

- Cadastro tecnico ponta a ponta funcional.
- Busca e filtros operacionais para uso diario.
- Base pronta para Sprint 3 (segredos, assinaturas e anexos).

## Regras operacionais da sprint

- Daily com status por agente: feito, bloqueio, proximo passo.
- Entregas incrementais com validacao continua.
- Bloqueio > 4 horas deve ser escalado.

## D1 (Segunda) - Modelagem funcional e contratos

### Agente 1 (Produto)
- Refinar historias do inventario tecnico (P0 da sprint).
- Validar criterios de aceite de CRUD e busca.

### Agente 2 (Backend/API)
- Definir contratos finais dos endpoints de `apps`, `hosting_entries`, `domains`, `ai_integrations`.
- Implementar estrutura inicial de controllers/services/repositorios.

### Agente 3 (Dados/Supabase)
- Ajustar schema para campos finais das entidades da Sprint 2.
- Criar/validar indices para busca por nome, dominio e provedor.

### Agente 4 (Frontend)
- Criar telas base: lista de apps e formulario de cadastro.
- Definir estados de loading, erro e vazio.

### Agente 5 (Seguranca)
- Revisar permissao por papel para cada acao de CRUD.
- Validar que respostas nao exponham campos sensiveis indevidos.

### Agente 6 (QA)
- Criar cenarios de teste para CRUD completo e busca.
- Definir massa de dados para homolog.

### Agente 7 (DevOps)
- Garantir ambiente homolog atualizado para testes de integracao.
- Validar pipeline com novas migrations.

## D2 (Terca) - CRUD de SaaS/APP e hospedagem

### Agente 1
- Validar aderencia funcional das primeiras entregas de CRUD.

### Agente 2
- Implementar CRUD de `apps`.
- Implementar CRUD de `hosting_entries` com vinculo a app.

### Agente 3
- Validar constraints e integridade entre app e hospedagem.
- Publicar seed para cenarios de teste de relacionamento.

### Agente 4
- Integrar frontend com CRUD de apps e hospedagem.
- Implementar validacoes de formulario essenciais.

### Agente 5
- Revisar autorizacao nas rotas criadas e tentativa de bypass.

### Agente 6
- Executar testes de integracao para CRUD de app/hospedagem.

### Agente 7
- Monitorar erros em homolog durante integracao frontend-backend.

## D3 (Quarta) - CRUD de dominio e integracoes IA/API

### Agente 1
- Confirmar cobertura dos fluxos criticos com o time.

### Agente 2
- Implementar CRUD de `domains`.
- Implementar CRUD de `ai_integrations` (com referencia de segredo, sem fluxo de segredo completo ainda).

### Agente 3
- Garantir consistencia relacional entre app, dominio e integracoes.

### Agente 4
- Implementar abas/sections de dominio e integracoes no detalhe do app.

### Agente 5
- Revisar politica de visibilidade de dados por papel nessas telas/rotas.

### Agente 6
- Testar fluxo completo: criar app -> cadastrar dominio -> cadastrar integracao.

### Agente 7
- Acompanhar estabilidade de deploy incremental em homolog.

## D4 (Quinta) - Busca, filtros e refinamento UX

### Agente 1
- Validar se busca/filtros atendem uso operacional diario.

### Agente 2
- Implementar endpoints de busca e filtros principais.
- Otimizar consultas mais usadas.

### Agente 3
- Ajustar indices conforme consultas reais da API.
- Validar plano de execucao das queries principais.

### Agente 4
- Implementar busca global e filtros por nome, dominio, provedor e status.
- Ajustar experiencia de lista e navegacao.

### Agente 5
- Revisar se filtros e respostas respeitam RBAC.

### Agente 6
- Testar combinacoes de filtros e cenarios de edge case.

### Agente 7
- Verificar performance basica de homolog sob uso moderado.

## D5 (Sexta) - Fechamento de sprint

### Todos os agentes
- Corrigir pendencias criticas.
- Consolidar documentacao de endpoints, campos e regras.
- Preparar handoff para Sprint 3.

### Gate de aceite da Sprint 2

- CRUD completo de inventario tecnico funcionando.
- Busca e filtros validos em frontend e backend.
- Permissoes por papel aplicadas nas rotas da sprint.
- Sem bug critico aberto em fluxo principal.
- Evidencias de teste publicadas.

## Checklist de encerramento

- [ ] Historias P0 da sprint concluidas
- [ ] Bugs criticos resolvidos
- [ ] Documentacao atualizada
- [ ] Debitos tecnicos registrados
- [ ] Backlog da Sprint 3 refinado
