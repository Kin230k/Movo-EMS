CREATE OR REPLACE PROCEDURE create_text_answer(p_auth_user_id UUID,
 IN p_answerId UUID,
 IN p_response TEXT
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
 CALL check_user_permission(p_auth_user_id, 'create_text_answer');

-- Validate response
 IF p_response IS NULL OR TRIM(p_response) = '' THEN
 RAISE EXCEPTION 'Response cannot be empty';
 END IF;

 INSERT INTO TEXT_ANSWERS (
 answerId,
 response
 ) VALUES (
 p_answerId,
 p_response
 );

 EXCEPTION
 WHEN foreign_key_violation THEN
 RAISE EXCEPTION 'Invalid answerId: % does not exist in ANSWERS table', p_answerId;
 WHEN not_null_violation THEN
 RAISE EXCEPTION 'Response cannot be NULL';
END;
$$;