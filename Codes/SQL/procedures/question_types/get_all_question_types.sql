CREATE OR REPLACE FUNCTION get_all_question_types()
RETURNS TABLE (typeCode VARCHAR(30), description JSONB)
LANGUAGE plpgsql AS $$
BEGIN
    CALL check_user_permission(p_auth_user_id, 'get_all_question_types');

RETURN QUERY 
    SELECT 
        qt.typeCode,
        qt.description
    FROM QUESTION_TYPES qt;
END;
$$;