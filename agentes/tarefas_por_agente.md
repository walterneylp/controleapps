# Tarefas por Agente - Execucao V1

## Regras de Execucao

- Cada agente executa apenas seu escopo.
- Bloqueios devem ser registrados com dependencia explicita.
- Nenhuma tarefa sensivel pode ser considerada pronta sem criterio de aceite.

## Agente 1 - Produto e Escopo

## Objetivo

Manter a entrega aderente ao escopo v1 e evitar deriva funcional.

## Tarefas

1. Criar backlog priorizado por sprint (P0, P1, P2).
2. Escrever criterios de aceite de todas historias criticas.
3. Formalizar fora de escopo da v1 em documento unico.
4. Validar matriz de permissoes com time tecnico.

## Dependencias

- Nenhuma para inicio.

## Aceite

- Backlog fechado para Sprint 1 e Sprint 2.
- Escopo congelado da v1 documentado e aprovado.

## Agente 2 - Backend/API

## Objetivo

Entregar API modular segura para inventario, segredos, assinaturas e anexos.

## Tarefas

1. Estruturar modulos `inventory`, `secrets`, `subscriptions`, `attachments`, `alerts`, `audit`.
2. Implementar CRUD de inventario tecnico.
3. Implementar endpoints de segredos com auditoria obrigatoria.
4. Implementar assinaturas tecnicas.
5. Integrar anexos com storage e metadados.
6. Expor endpoint de alertas simples.

## Dependencias

- Schema inicial do banco.
- Auth/RBAC minimamente disponivel.

## Aceite

- Fluxo ponta a ponta de cadastro tecnico funcionando por API.
- Eventos sensiveis auditados.
- Testes de integracao dos fluxos criticos passando.

## Agente 3 - Dados/Supabase

## Objetivo

Definir e estabilizar base relacional e storage com integridade e rastreabilidade.

## Tarefas

1. Criar migrations para tabelas base.
2. Definir FKs, indices e constraints de integridade.
3. Preparar bucket e politica de anexos.
4. Definir politicas de acesso em conjunto com auth.
5. Criar scripts de seed para homologacao.

## Dependencias

- Definicao final de campos minimos por entidade.

## Aceite

- Migrations reproduziveis do zero.
- Consultas principais com performance adequada para escala v1.

## Agente 4 - Frontend Web

## Objetivo

Entregar experiencia operacional clara e rapida para time tecnico.

## Tarefas

1. Implementar login e estado de sessao.
2. Implementar dashboard com alertas e indicadores basicos.
3. Implementar lista de apps com busca/filtros.
4. Implementar detalhe com abas: hospedagem, dominio, integracoes, assinaturas, anexos.
5. Implementar fluxo seguro de revelar segredo.
6. Implementar tela de auditoria com filtros basicos.

## Dependencias

- Endpoints de API disponiveis.
- Contratos de dados estaveis.

## Aceite

- Jornada principal concluida sem bloqueios.
- Campos sensiveis mascarados por padrao.

## Agente 5 - Seguranca e Auditoria

## Objetivo

Garantir confidencialidade, autorizacao e rastreabilidade em toda a v1.

## Tarefas

1. Definir padrao de criptografia de segredos em aplicacao.
2. Revisar matriz RBAC por rota e por acao.
3. Validar trilha de auditoria e formato de evento.
4. Revisar estrategia de logs e mascaramento.
5. Validar upload de anexos (tipo/tamanho/nome).

## Dependencias

- Endpoints basicos implementados.

## Aceite

- Nenhum segredo exposto em log.
- Testes de autorizacao cobrindo rotas sensiveis.

## Agente 6 - QA/Testes

## Objetivo

Assegurar confiabilidade funcional e regressao controlada.

## Tarefas

1. Criar plano de testes por sprint.
2. Cobrir fluxo de cadastro tecnico ponta a ponta.
3. Cobrir fluxo de segredo com auditoria.
4. Cobrir fluxo de anexos.
5. Cobrir regras de alertas simples.
6. Executar regressao antes do go-live.

## Dependencias

- Funcionalidades minimas implementadas por modulo.

## Aceite

- Suite critica aprovada.
- Bugs severidade alta corrigidos ou bloqueando release.

## Agente 7 - DevOps/Operacao

## Objetivo

Entregar esteira de deploy segura e operacao minima para disponibilidade alvo.

## Tarefas

1. Configurar pipeline de build/test/deploy.
2. Configurar monitoramento basico de API e disponibilidade.
3. Implementar rotina de backup e politica de retencao.
4. Definir e testar rollback.
5. Publicar runbook de operacao v1.

## Dependencias

- Ambientes provisionados.
- Aplicacao com build estavel.

## Aceite

- Deploy reproduzivel.
- Restore de backup validado.
- Monitoramento ativo no ambiente alvo.
