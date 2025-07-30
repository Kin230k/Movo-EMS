CREATE OR REPLACE FUNCTION get_rating_answer_by_id(p_answer_id UUID)
RETURNS TABLE (answerId UUID, rating SMALLINT)
LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY 
    SELECT 
        ra.answerId,
        ra.rating
    FROM RATING_ANSWERS ra
    WHERE ra.answerId = p_answer_id;
END;
$$;