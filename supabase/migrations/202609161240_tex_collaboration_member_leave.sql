drop policy if exists "tex collaborators member leave" on public.tex_document_collaborators;
create policy "tex collaborators member leave"
  on public.tex_document_collaborators
  for delete
  to authenticated
  using (member_id = auth.uid());
