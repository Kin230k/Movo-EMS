CREATE OR REPLACE PROCEDURE update_numeric_answer(p_auth_user_id UUID,
 p_answer_id UUID,
 p_response NUMERIC DEFAULT NULL
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
 CALL check_user_permission(p_auth_user_id, 'update_numeric_answer');

-- Validate response only when provided
 IF p_response IS NULL THEN
 RAISE EXCEPTION 'Response value cannot be NULL';
 END IF;

 UPDATE NUMERIC_ANSWERS
 SET response = p_response
 WHERE answerId = p_answer_id;
END;
$$;