-- Add Alibaba Cloud Bailian as an AERTEX Intelligence provider.
-- Applied to production on 2026-09-24.

alter table public.ai_providers
  drop constraint if exists ai_providers_provider_check;

alter table public.ai_providers
  add constraint ai_providers_provider_check
  check (provider in ('openai','zhipu','bailian'));

notify pgrst, 'reload schema';
