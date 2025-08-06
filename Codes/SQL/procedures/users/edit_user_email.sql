-- edit_user_email.sql
CREATE OR REPLACE PROCEDURE edit_user_email(p_auth_user_id UUID, 
  p_uid UUID,
  p_email TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  CALL check_user_permission(p_auth_user_id, 'edit_user_email');

-- Reuse existing update_user route but only change email
  PERFORM update_user(p_uid, NULL, p_email, NULL, NULL, NULL, NULL, NULL);
END;
$$;
