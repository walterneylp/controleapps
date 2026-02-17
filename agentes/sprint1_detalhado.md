# Sprint 1 Detalhada (D1 a D5) - Por Agente

## Objetivo da Sprint 1

Entregar fundacao tecnica: schema inicial, auth, RBAC, estrutura modular backend, base de auditoria e casca inicial de frontend.

## Resultado esperado ao fim da sprint

- Login funcional.
- Papeis `admin`, `editor`, `leitor` aplicados.
- Auditoria base persistindo eventos.
- Infra de desenvolvimento pronta para Sprint 2.

## Regras operacionais da sprint

- Daily com status por agente: feito, bloqueio, proximo passo.
- Merge pequeno e frequente.
- Qualquer bloqueio > 4 horas vira escalacao.

## D1 (Segunda) - Kickoff tecnico

### Agente 1 (Produto)
- Congelar backlog da Sprint 1.
- Publicar criterios de aceite das historias da sprint.

### Agente 2 (Backend/API)
- Subir estrutura de projeto modular (`inventory`, `secrets`, `subscriptions`, `attachments`, `alerts`, `audit`).
- Definir contratos iniciais de rotas de auth e healthcheck.

### Agente 3 (Dados/Supabase)
- Criar migrations iniciais de tabelas base.
- Definir chaves e relacionamento inicial.

### Agente 4 (Frontend)
- Criar shell do app (layout base + roteamento inicial).
- Tela de login (UI inicial, sem fluxo final).

### Agente 5 (Seguranca)
- Definir matriz RBAC v1 por modulo/acao.
- Definir formato padrao de evento de auditoria.

### Agente 6 (QA)
- Preparar plano de testes da Sprint 1.
- Criar casos de teste para auth, RBAC e auditoria base.

### Agente 7 (DevOps)
- Configurar pipeline minimo (build + test).
- Definir ambientes dev/homolog e variaveis necessarias.

## D2 (Terca) - Auth e permissao base

### Agente 1
- Validar aderencia do escopo com implementacoes de D1.

### Agente 2
- Implementar auth base no backend.
- Integrar middleware de autorizacao por papel.

### Agente 3
- Ajustar schema para users/roles conforme auth.
- Seed inicial de papeis.

### Agente 4
- Integrar login com backend/auth.
- Guardas de rota por sessao autenticada.

### Agente 5
- Revisar rotas protegidas e validar regra minima por papel.

### Agente 6
- Iniciar testes de integracao de login e acesso protegido.

### Agente 7
- Validar execucao de pipeline em PR.
- Publicar padrao de versionamento de ambiente.

## D3 (Quarta) - Auditoria e observabilidade minima

### Agente 1
- Confirmar historias prontas e riscos de escopo.

### Agente 2
- Implementar middleware/evento de auditoria base.
- Registrar eventos de login, falha de acesso e acoes sensiveis iniciais.

### Agente 3
- Refinar tabela `audit_events` com indices uteis.

### Agente 4
- Exibir estado de sessao e feedback de acesso negado.

### Agente 5
- Validar campos obrigatorios de auditoria.
- Revisar politica de mascaramento de logs.

### Agente 6
- Testar persistencia de eventos de auditoria.
- Abrir bugs de rastreabilidade incompleta.

### Agente 7
- Configurar monitoramento minimo de erro de API.

## D4 (Quinta) - Consolidacao tecnica

### Agente 1
- Revisao de progresso contra aceite da sprint.

### Agente 2
- Hardening de auth e permissoes.
- Ajustes finais na estrutura modular para preparar Sprint 2.

### Agente 3
- Validar migrations do zero em ambiente limpo.
- Publicar script de reset + seed para homolog.

### Agente 4
- Melhorar UX basica de login e estados de erro/loading.

### Agente 5
- Revisao de seguranca da fundacao implementada.

### Agente 6
- Regressao de auth/RBAC/auditoria.

### Agente 7
- Validar pipeline completo com testes.
- Publicar runbook curto de deploy homolog.

## D5 (Sexta) - Fechamento de sprint

### Todos os agentes
- Tratar pendencias criticas abertas.
- Atualizar documentacao do que foi entregue.
- Preparar handoff para Sprint 2.

### Gate de aceite da Sprint 1

- Login funcional validado.
- RBAC aplicado e testado para rotas base.
- Auditoria base persistida e consultavel.
- CI executando build e testes sem falha.
- Sem bug critico aberto em auth/permissao/auditoria.

## Checklist de encerramento

- [ ] Backlog da Sprint 2 refinado
- [ ] Debitos tecnicos registrados
- [ ] Riscos atualizados
- [ ] Evidencias de teste anexadas
