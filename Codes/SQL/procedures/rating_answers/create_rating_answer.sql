CREATE OR REPLACE PROCEDURE create_rating_answer(p_auth_user_id UUID, 
    p_answer_id UUID,
    p_rating SMALLINT,
    p_min_rating SMALLINT DEFAULT 1,
    p_max_rating SMALLINT DEFAULT 5
)
LANGUAGE plpgsql AS $$
BEGIN
    CALL check_user_permission(p_auth_user_id, 'create_rating_answer');

-- Validate rating range with parameters
    IF p_rating NOT BETWEEN p_min_rating AND p_max_rating THEN
        RAISE EXCEPTION 'Rating must be between % and % (got %)', 
            p_min_rating, p_max_rating, p_rating;
    END IF;

    INSERT INTO RATING_ANSWERS (
        answerId,
        rating
    ) VALUES (
        p_answer_id,
        p_rating
    );
    
    EXCEPTION
        WHEN foreign_key_violation THEN
            RAISE EXCEPTION 'Invalid answerId: % does not exist in ANSWERS table', p_answer_id;
        WHEN check_violation THEN
            RAISE EXCEPTION 'Rating value % violates check constraint (must be % to %)', 
                p_rating, p_min_rating, p_max_rating;
END;
$$;