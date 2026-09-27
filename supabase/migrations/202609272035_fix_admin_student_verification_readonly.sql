begin;

-- The admin student-verification getter performs expiry cleanup before returning
-- results. Its public SQL wrapper was marked STABLE, which forces a read-only
-- execution context and makes the nested UPDATE/DELETE cleanup fail.
alter function public.get_admin_student_verifications() volatile;

commit;
