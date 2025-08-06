-- src/db/procedures/edit_user_phone.sql
CREATE OR REPLACE PROCEDURE edit_user_phone(p_auth_user_id UUID, 
  p_uid    UUID,
  p_phone  TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  CALL check_user_permission(p_auth_user_id, 'edit_user_phone');

-- Only update the phone field; all other columns are left as-is.
  PERFORM update_user(
    p_uid,
    NULL,     -- name_json
    NULL,     -- email
    p_phone,  -- phone
    NULL,     -- picture (if your update_user signature takes picture here, otherwise shift accordingly)
    NULL,     -- role
    NULL,     -- status
    NULL      -- twoFaEnabled
  );
END;
$$;
