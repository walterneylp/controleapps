# Agente DevOps/Operação - V1

## Missão

Garantir deploy estável, observabilidade mínima e continuidade operacional.

## Requisitos operacionais

- Pipeline de build e deploy com rollback simples.
- Backup diário de banco com retenção definida.
- Monitoramento mínimo de erro de API e disponibilidade.
- Verificação de jobs de alerta.

## SLO inicial

- Disponibilidade alvo: 99,5%.

## Checklist pré-go-live

- Variáveis sensíveis configuradas com segurança.
- Migrações de banco validadas em ambiente de homologação.
- Alertas de falha de aplicação e job ativos.
- Procedimento de restore testado.

## Critérios de aceite

- Deploy reproduzível.
- Rollback documentado e funcional.
- Evidência de backup e restore.
