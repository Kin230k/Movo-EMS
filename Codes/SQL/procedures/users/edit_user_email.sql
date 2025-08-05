-- edit_user_email.sql
CREATE OR REPLACE PROCEDURE edit_user_email(
  p_uid UUID,
  p_email TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  -- Reuse existing update_user route but only change email
  PERFORM update_user(p_uid, NULL, p_email, NULL, NULL, NULL, NULL, NULL);
END;
$$;
