CREATE OR REPLACE FUNCTION get_question_type_by_id(p_auth_user_id UUID,p_type_code VARCHAR(30))
RETURNS TABLE (typeCode VARCHAR(30), description JSONB)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
 CALL check_user_permission(p_auth_user_id, 'get_question_type_by_id');

RETURN QUERY
 SELECT
 qt.typeCode,
 qt.description
 FROM QUESTION_TYPES qt
 WHERE qt.typeCode = p_type_code;
END;
$$;