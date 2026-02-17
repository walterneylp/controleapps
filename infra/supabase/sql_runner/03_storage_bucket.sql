-- 03_storage_bucket.sql
-- Execute depois do 02

insert into storage.buckets (id, name, public)
values ('controleapps-files', 'controleapps-files', false)
on conflict (id) do nothing;
