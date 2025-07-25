CREATE OR REPLACE FUNCTION get_numeric_answer_by_id(p_answer_id UUID)
RETURNS TABLE (answerId UUID, response NUMERIC)
LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY 
    SELECT 
        na.answerId,
        na.response
    FROM NUMERIC_ANSWERS na
    WHERE na.answerId = p_answer_id;
END;
$$;