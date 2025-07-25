CREATE OR REPLACE FUNCTION get_all_rating_answers()
RETURNS TABLE (answerId UUID, rating SMALLINT)
LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY 
    SELECT 
        ra.answerId,
        ra.rating
    FROM RATING_ANSWERS ra;
END;
$$;