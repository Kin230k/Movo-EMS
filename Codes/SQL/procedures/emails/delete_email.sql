CREATE OR REPLACE PROCEDURE delete_email(p_auth_user_id UUID, p_email_id UUID)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
 CALL check_user_permission(p_auth_user_id, 'delete_email');

DELETE FROM EMAILS
 WHERE emailId = p_email_id;
END;
$$;