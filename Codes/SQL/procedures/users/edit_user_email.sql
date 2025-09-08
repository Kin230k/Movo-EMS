-- edit_user_email.sql

CREATE OR REPLACE PROCEDURE edit_user_email(p_auth_user_id UUID,
 p_userId UUID,
 p_email TEXT
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
 CALL check_user_permission(p_auth_user_id, 'edit_user_email');

UPDATE users
 SET
 email = COALESCE(p_email, email)
 WHERE userId = p_userId;
END;
$$;
