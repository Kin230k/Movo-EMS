-- src/db/procedures/edit_user_phone.sql
CREATE OR REPLACE PROCEDURE edit_user_phone(p_auth_user_id UUID,
 p_user_id UUID,
 p_phone TEXT
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
 CALL check_user_permission(p_auth_user_id, 'edit_user_phone');

-- Only update the phone field; all other columns are left as-is.
UPDATE users
 SET
 phone = COALESCE(p_phone, phone)
 WHERE userId = p_user_id;
END;
$$;
