CREATE OR REPLACE PROCEDURE delete_form(p_auth_user_id UUID, p_form_id UUID)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
 CALL check_user_permission(p_auth_user_id, 'delete_form');

DELETE FROM FORMS
 WHERE formId = p_form_id;
END;
$$;