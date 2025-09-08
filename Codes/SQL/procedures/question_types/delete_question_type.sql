CREATE OR REPLACE PROCEDURE delete_question_type(p_auth_user_id UUID, p_type_code VARCHAR(30))
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
 CALL check_user_permission(p_auth_user_id, 'delete_question_type');

DELETE FROM QUESTION_TYPES
 WHERE typeCode = p_type_code;
END;
$$;