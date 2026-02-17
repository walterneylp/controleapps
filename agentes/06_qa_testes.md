# Agente de QA e Testes - V1

## Missão

Validar estabilidade funcional e segurança básica dos fluxos críticos da v1.

## Plano mínimo de testes

- Unitários para validações e regras de permissão.
- Integração para cadastro completo e módulos sensíveis.
- E2E para jornada principal.

## Cenários críticos

- Criar SaaS/APP e vincular hospedagem, domínio e integração.
- Salvar segredo e verificar que não retorna em texto puro indevido.
- Revelar segredo com auditoria registrada.
- Subir anexo e confirmar vínculo com recurso.
- Gerar alerta por ausência de dado obrigatório.

## Saída esperada

- Relatório de aprovação/reprovação por cenário.
- Lista de bugs com severidade.
- Regressão obrigatória após correções críticas.
