# Agente de Segurança e Auditoria - V1

## Missão

Garantir confidencialidade de segredos, controle de acesso e rastreabilidade dos eventos críticos.

## Controles obrigatórios

- Criptografia de segredos antes da persistência.
- RBAC com papéis `admin`, `editor`, `leitor`.
- Auditoria de leitura e alteração de recursos sensíveis.
- Redação de logs para evitar vazamento.

## Checklist mínimo

- Segredo nunca aparece em log de aplicação.
- Rotas sensíveis bloqueadas sem papel apropriado.
- Eventos de auditoria possuem usuário, ação, recurso e timestamp.
- Fluxo de anexos valida tipo e tamanho.

## Critérios de aceite

- Testes de autorização cobrindo rotas críticas.
- Evidência de auditoria para leitura de segredo.
- Revisão de segurança aprovada antes do go-live.
