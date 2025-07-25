CREATE OR REPLACE PROCEDURE create_rating_answer(
    IN p_answerId UUID,
    IN p_rating SMALLINT
)
LANGUAGE plpgsql
AS $$
BEGIN
    -- Validate rating range first
    IF p_rating NOT BETWEEN 1 AND 5 THEN
        RAISE EXCEPTION 'Rating must be between 1 and 5 (got %)', p_rating;
    END IF;

    -- Insert into RATING_ANSWERS
    INSERT INTO RATING_ANSWERS (
        answerId,
        rating
    ) VALUES (
        p_answerId,
        p_rating
    );
    
    EXCEPTION
        WHEN foreign_key_violation THEN
            RAISE EXCEPTION 'Invalid answerId: % does not exist in ANSWERS table', p_answerId;
        WHEN check_violation THEN
            RAISE EXCEPTION 'Rating value % violates check constraint (must be 1-5)', p_rating;
END;
$$;