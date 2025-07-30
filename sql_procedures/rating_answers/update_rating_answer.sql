CREATE OR REPLACE PROCEDURE update_rating_answer(
    p_answer_id UUID,
    p_rating SMALLINT,
    p_min_rating SMALLINT DEFAULT 1,
    p_max_rating SMALLINT DEFAULT 5
)
LANGUAGE plpgsql AS $$
BEGIN
    -- Validate rating range with parameters
    IF p_rating NOT BETWEEN p_min_rating AND p_max_rating THEN
        RAISE EXCEPTION 'Rating must be between % and % (got %)', 
            p_min_rating, p_max_rating, p_rating;
    END IF;

    UPDATE RATING_ANSWERS
    SET rating = p_rating
    WHERE answerId = p_answer_id;
    
    EXCEPTION
        WHEN check_violation THEN
            RAISE EXCEPTION 'Rating value % violates check constraint (must be % to %)', 
                p_rating, p_min_rating, p_max_rating;
END;
$$;