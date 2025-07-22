CREATE OR REPLACE FUNCTION get_all_numeric_answers()
RETURNS TABLE (answerId UUID, response NUMERIC)
LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY 
    SELECT 
        na.answerId,
        na.response
    FROM NUMERIC_ANSWERS na;
END;
$$;