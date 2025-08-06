CREATE OR REPLACE PROCEDURE update_rating_answer(p_auth_user_id UUID, 
    p_answer_id UUID,
    p_rating SMALLINT DEFAULT NULL,
    p_min_rating SMALLINT DEFAULT 1,
    p_max_rating SMALLINT DEFAULT 5
)
LANGUAGE plpgsql AS $$
BEGIN
    CALL check_user_permission(p_auth_user_id, 'update_rating_answer');

-- Validate rating range only when provided
    IF p_rating IS NOT NULL AND p_rating NOT BETWEEN p_min_rating AND p_max_rating THEN
        RAISE EXCEPTION 'Rating must be between % and % (got %)', 
            p_min_rating, p_max_rating, p_rating;
    END IF;

    UPDATE RATING_ANSWERS
    SET rating = COALESCE(p_rating, rating)
    WHERE answerId = p_answer_id;
    
    EXCEPTION
        WHEN check_violation THEN
            RAISE EXCEPTION 'Rating value % violates check constraint (must be % to %)', 
                p_rating, p_min_rating, p_max_rating;
END;
$$;