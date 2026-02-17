# Security Baseline - V1

## Controles implementados

- RBAC basico: `admin`, `editor`, `leitor`.
- Auditoria de eventos sensiveis (login, acesso negado, CRUD critico, view_secret).
- Segredos armazenados criptografados em AES-256-GCM (chave via ambiente).
- Campos sensiveis nao retornam por padrao nos endpoints de listagem.

## Pendencias para producao

- Integrar auth real com Supabase Auth (remover usuarios locais de desenvolvimento).
- Persistir auditoria em banco em vez de memoria.
- Implementar rotacao de chave de criptografia.
- Integrar upload real com Supabase Storage (com antivirus e checksum).
- Ativar rate limiting e protecoes anti brute-force no login.

## Recomendacoes operacionais

- Nunca versionar `.env` com segredos.
- Revisar acessos de papeis a cada sprint.
- Executar revisao de seguranca antes de cada release.
