update public.profiles p
set hide_gender_on_profile = case lower(coalesce(u.raw_user_meta_data->>'hide_gender_on_profile',''))
  when 'true' then true
  when 'false' then false
  else p.hide_gender_on_profile
end,
updated_at = now()
from auth.users u
where u.id = p.id;
