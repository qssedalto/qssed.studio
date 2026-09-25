create index if not exists device_access_exemptions_granted_by_idx
  on public.device_access_exemptions(granted_by);
