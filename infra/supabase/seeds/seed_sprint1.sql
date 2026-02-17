-- Seed minimo da Sprint 1
insert into public.roles (code, description)
values
  ('admin', 'Acesso total ao sistema'),
  ('editor', 'Pode editar recursos tecnicos'),
  ('leitor', 'Somente leitura')
on conflict (code) do nothing;
