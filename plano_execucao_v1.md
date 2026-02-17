# Plano de Execucao V1 - Controle Tecnico SaaS/APP

## 1. Objetivo do Plano

Organizar a entrega da V1 em ciclos curtos, com foco em valor operacional, seguranca e previsibilidade.

## 2. Premissas

- Time tecnico interno pequeno (2 a 10 pessoas).
- Supabase em VPS como base de dados e storage.
- V1 com foco tecnico, sem modulo financeiro completo.
- Disponibilidade alvo: 99,5%.

## 3. Estrategia de Entrega

- Modelo incremental por sprints.
- Primeiro liberar fundacao tecnica e seguranca.
- Depois consolidar fluxos principais de inventario.
- Em seguida finalizar operacao, alertas, auditoria e estabilizacao.

## 4. Fases e Sprints

## Fase 0 - Preparacao (2 a 3 dias)

- Definir stack final de app (frontend e backend).
- Configurar repositorio, padrao de branch e CI basico.
- Provisionar ambientes (dev/homolog) e acessos.
- Definir convencoes de dados, logs e auditoria.

Saida esperada:
- Ambiente pronto para desenvolvimento.
- Contratos iniciais de API e schema preliminar.

## Sprint 1 - Fundacao de Dados, Auth e RBAC (1 semana)

- Criar schema inicial no Supabase.
- Implementar auth e papeis `admin`, `editor`, `leitor`.
- Estruturar backend modular base.
- Implementar trilha de auditoria base.

Saida esperada:
- Login funcional.
- Controle de acesso por papel aplicado em rotas essenciais.
- Auditoria persistindo eventos iniciais.

## Sprint 2 - Inventario Tecnico Core (1 semana)

- CRUD de SaaS/APP.
- CRUD de hospedagem e dominio.
- CRUD de integracoes IA/API com referencia de segredo.
- Busca e filtros principais.

Saida esperada:
- Cadastro completo de inventario tecnico funcional ponta a ponta.

## Sprint 3 - Segredos, Assinaturas e Anexos (1 semana)

- Modulo de segredos com criptografia.
- Fluxo de revelar segredo com auditoria.
- Cadastro de assinaturas tecnicas.
- Upload/listagem/remocao logica de anexos.

Saida esperada:
- Dados sensiveis protegidos.
- Trilha de auditoria completa para eventos sensiveis.

## Sprint 4 - Alertas, Qualidade e Go-Live (1 semana)

- Regras de alertas simples por lacunas de cadastro.
- Hardening de seguranca e validacoes finais.
- Testes integrados e E2E da jornada principal.
- Preparacao operacional (backup, monitoramento, rollback).

Saida esperada:
- V1 pronta para uso interno com checklist de producao aprovado.

## 5. Dependencias Principais

- Sem RBAC e auth prontos, nao avancar para fluxos sensiveis.
- Sem schema minimamente estavel, evitar frontend de telas finais.
- Sem auditoria de segredo, nao liberar fluxo de visualizacao de credencial.

## 6. Definicao de Pronto (DoR)

- Historia com objetivo claro e criterio de aceite objetivo.
- Dependencias mapeadas.
- Dados de teste definidos.
- Risco de seguranca identificado quando aplicavel.

## 7. Definicao de Concluido (DoD)

- Codigo revisado.
- Testes obrigatorios passando.
- Sem vazamento de segredo em logs/respostas indevidas.
- Auditoria aplicada em eventos sensiveis.
- Documentacao atualizada.

## 8. Riscos e Mitigacoes

- Risco: escopo crescer para financeiro.
  Mitigacao: bloquear novas features fora do escopo v1.
- Risco: regras de autorizacao incompletas.
  Mitigacao: matriz de permissao por rota + testes dedicados.
- Risco: anexos virarem vetor de ataque.
  Mitigacao: validacao de tipo/tamanho e sanitizacao de nome de arquivo.

## 9. Marco de Release

- Marco 1: Fundacao tecnica validada.
- Marco 2: Inventario tecnico completo.
- Marco 3: Segredos e anexos seguros.
- Marco 4: Operacao estavel e liberacao para uso interno.
