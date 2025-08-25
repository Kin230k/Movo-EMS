CREATE OR REPLACE FUNCTION get_all_numeric_answers(p_auth_user_id UUID)
RETURNS TABLE (answerId UUID, response NUMERIC)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
 CALL check_user_permission(p_auth_user_id, 'get_all_numeric_answers');

RETURN QUERY
 SELECT
 na.answerId,
 na.response
 FROM NUMERIC_ANSWERS na;
END;
$$;