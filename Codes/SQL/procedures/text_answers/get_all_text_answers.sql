CREATE OR REPLACE FUNCTION get_all_text_answers()
RETURNS TABLE (answerId UUID, response TEXT)
LANGUAGE plpgsql AS $$
BEGIN
    CALL check_user_permission(p_auth_user_id, 'get_all_text_answers');

RETURN QUERY 
    SELECT 
        ta.answerId,
        ta.response
    FROM TEXT_ANSWERS ta;
END;
$$;