-- Applied migration 20261113154010. Reject NULL PKCE inputs before accessing
-- or consuming authorization codes. Preserve grants, records and token TTLs.
DO $audit$
DECLARE
  definition text;
  original text;
BEGIN
  SELECT pg_catalog.pg_get_functiondef('public.oauth_exchange_authorization_code(text,text,text,text)'::regprocedure) INTO definition;
  original := definition;
  IF position('if p_code_verifier is null or p_code_verifier !~' in lower(definition)) = 0 THEN
    IF position('if p_code_verifier !~' in definition) = 0 THEN
      RAISE EXCEPTION 'Unrecognized OAuth verifier guard; review before migration';
    END IF;
    definition := replace(definition, 'if p_code_verifier !~', 'if p_code_verifier is null or p_code_verifier !~');
  END IF;
  IF position('v_expected_challenge is distinct from v_code_row.code_challenge' in lower(definition)) = 0 THEN
    IF position('if v_expected_challenge <> v_code_row.code_challenge then' in definition) = 0 THEN
      RAISE EXCEPTION 'Unrecognized OAuth challenge comparison; review before migration';
    END IF;
    definition := replace(definition,
      'if v_expected_challenge <> v_code_row.code_challenge then',
      'if v_code_row.code_challenge_method is distinct from ''S256'' or v_expected_challenge is null or v_expected_challenge is distinct from v_code_row.code_challenge then');
  END IF;
  IF definition <> original THEN EXECUTE definition; END IF;

  SELECT pg_catalog.pg_get_functiondef('public.oauth_issue_authorization_code(text,text,text,text)'::regprocedure) INTO definition;
  original := definition;
  IF position('if p_code_challenge is null or p_code_challenge !~' in lower(definition)) = 0 THEN
    IF position('if p_code_challenge !~' in definition) = 0 THEN
      RAISE EXCEPTION 'Unrecognized OAuth challenge input guard; review before migration';
    END IF;
    definition := replace(definition, 'if p_code_challenge !~', 'if p_code_challenge is null or p_code_challenge !~');
  END IF;
  IF definition <> original THEN EXECUTE definition; END IF;
END;
$audit$;
