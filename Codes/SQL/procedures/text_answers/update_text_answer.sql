CREATE OR REPLACE PROCEDURE update_text_answer(p_auth_user_id UUID,
 p_answer_id UUID,
 p_response TEXT DEFAULT NULL
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
 CALL check_user_permission(p_auth_user_id, 'update_text_answer');

-- Validate response only when provided
 IF p_response IS NOT NULL AND (TRIM(p_response) = '') THEN
 RAISE EXCEPTION 'Response cannot be empty';
 END IF;

 UPDATE TEXT_ANSWERS
 SET response = COALESCE(p_response, response)
 WHERE answerId = p_answer_id;
END;
$$;